/**
 * One-time migration: MDX files → Sanity
 *
 * Usage:
 *   SANITY_TOKEN=<editor-token> SANITY_PROJECT_ID=<id> node scripts/migrate.mjs
 *
 * How to get the token:
 *   sanity.io/manage → your project → API → Tokens → Add API Token (Editor role)
 */

import fs   from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';
import { marked }       from 'marked';
import crypto           from 'crypto';

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ID = process.env.SANITY_PROJECT_ID;
const TOKEN      = process.env.SANITY_TOKEN;
const DATASET    = process.env.SANITY_DATASET ?? 'production';

if (!PROJECT_ID || !TOKEN) {
  console.error('Missing SANITY_PROJECT_ID or SANITY_TOKEN env vars');
  process.exit(1);
}

const client = createClient({
  projectId:  PROJECT_ID,
  dataset:    DATASET,
  token:      TOKEN,
  useCdn:     false,
  apiVersion: '2024-01-01',
});

const CONTENT_DIR = path.join(process.cwd(), 'src/content/blog');

// ── Helpers ───────────────────────────────────────────────────────────────────

function key() {
  return crypto.randomBytes(6).toString('hex');
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('No frontmatter found');

  const yaml = match[1];
  const body = match[2];

  // Parse the known fields manually (avoids pulling in a YAML dep)
  const get = (field) => {
    const m = yaml.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
  };
  const getDate = (field) => {
    const v = get(field);
    return v ? new Date(v).toISOString() : undefined;
  };
  const getBool = (field) => {
    const v = get(field);
    return v === 'true';
  };

  // Tags are a multi-line list:  - Tag Name
  const tagMatches = [...yaml.matchAll(/^\s+-\s+(.+)$/gm)];
  const tags = tagMatches.map(m => m[1].trim().replace(/^["']|["']$/g, ''));

  return {
    title:       get('title'),
    description: get('description'),
    pubDate:     getDate('pubDate'),
    tags,
    tool:        get('tool'),
    toolHref:    get('toolHref'),
    draft:       getBool('draft'),
  };
}

// ── Markdown → Portable Text ──────────────────────────────────────────────────

function inlineTokensToSpans(tokens, markDefs) {
  return (tokens ?? []).flatMap(t => {
    if (t.type === 'text' || t.type === 'escape') {
      return [{ _type: 'span', _key: key(), text: t.text ?? t.raw ?? '', marks: [] }];
    }
    if (t.type === 'strong') {
      return inlineTokensToSpans(t.tokens, markDefs)
        .map(s => ({ ...s, marks: [...(s.marks ?? []), 'strong'] }));
    }
    if (t.type === 'em') {
      return inlineTokensToSpans(t.tokens, markDefs)
        .map(s => ({ ...s, marks: [...(s.marks ?? []), 'em'] }));
    }
    if (t.type === 'codespan') {
      return [{ _type: 'span', _key: key(), text: t.text, marks: ['code'] }];
    }
    if (t.type === 'link') {
      const markKey = key();
      markDefs.push({ _key: markKey, _type: 'link', href: t.href, blank: t.href?.startsWith('http') });
      return inlineTokensToSpans(t.tokens, markDefs)
        .map(s => ({ ...s, marks: [...(s.marks ?? []), markKey] }));
    }
    if (t.type === 'br') {
      return [{ _type: 'span', _key: key(), text: '\n', marks: [] }];
    }
    // fallback: treat raw text
    const text = t.text ?? t.raw ?? '';
    return text ? [{ _type: 'span', _key: key(), text, marks: [] }] : [];
  });
}

function blockFromInline(inlineTokens, style = 'normal') {
  const markDefs = [];
  const children = inlineTokensToSpans(inlineTokens, markDefs);
  return { _type: 'block', _key: key(), style, markDefs, children };
}

function listItemBlock(item, listType) {
  const markDefs = [];
  const children = inlineTokensToSpans(
    item.tokens?.flatMap(t => t.tokens ?? [{ type: 'text', text: t.text ?? '' }]) ?? [],
    markDefs
  );
  return {
    _type:    'block',
    _key:     key(),
    style:    'normal',
    listItem: listType === 'ordered' ? 'number' : 'bullet',
    level:    1,
    markDefs,
    children,
  };
}

function mdToPortableText(markdown) {
  // Strip MDX-specific imports/exports before lexing
  const cleaned = markdown
    .replace(/^import\s.+$/gm, '')
    .replace(/^export\s.+$/gm, '')
    .trim();

  const tokens = marked.lexer(cleaned);
  const blocks = [];

  for (const token of tokens) {
    if (token.type === 'paragraph') {
      blocks.push(blockFromInline(token.tokens, 'normal'));
    } else if (token.type === 'heading') {
      const style = `h${token.depth}`;
      blocks.push(blockFromInline(token.tokens, style));
    } else if (token.type === 'code') {
      blocks.push({
        _type:    'codeBlock',
        _key:     key(),
        language: token.lang ?? 'text',
        code:     token.text,
      });
    } else if (token.type === 'list') {
      for (const item of token.items) {
        blocks.push(listItemBlock(item, token.ordered ? 'ordered' : 'unordered'));
      }
    } else if (token.type === 'blockquote') {
      // Recurse into blockquote children, apply blockquote style
      const innerTokens = token.tokens ?? [];
      for (const inner of innerTokens) {
        if (inner.type === 'paragraph') {
          blocks.push(blockFromInline(inner.tokens, 'blockquote'));
        }
      }
    } else if (token.type === 'hr' || token.type === 'space') {
      // skip
    } else if (token.type === 'html') {
      // skip MDX HTML comments / raw HTML
    }
  }

  return blocks;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function migrate() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.mdx'));
  console.log(`Found ${files.length} MDX files\n`);

  for (const file of files) {
    const raw  = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    const slug = file.replace(/\.mdx$/, '');

    let meta, body;
    try {
      ({ body, ...meta } = (() => {
        const fm = parseFrontmatter(raw);
        const bodyStart = raw.indexOf('\n---\n', 4) + 5;
        return { ...fm, body: raw.slice(bodyStart) };
      })());
    } catch (err) {
      console.error(`  ✗ Skipping ${file}: ${err.message}`);
      continue;
    }

    const portableText = mdToPortableText(body);
    const isDraft      = meta.draft === true;

    const doc = {
      // Draft docs use "drafts.<id>" prefix — they won't appear in CDN queries
      _id:   isDraft ? `drafts.${slug}` : slug,
      _type: 'post',
      title:       meta.title,
      slug:        { _type: 'slug', current: slug },
      description: meta.description,
      publishedAt: meta.pubDate,
      tags:        meta.tags ?? [],
      tool:        meta.tool,
      toolHref:    meta.toolHref,
      body:        portableText,
    };

    try {
      await client.createOrReplace(doc);
      console.log(`  ✓ ${isDraft ? '[draft] ' : ''}${slug}`);
    } catch (err) {
      console.error(`  ✗ ${slug}: ${err.message}`);
    }
  }

  console.log('\nDone. Open sanity.io/manage to review your content.');
}

migrate();
