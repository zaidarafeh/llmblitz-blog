import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset:   import.meta.env.PUBLIC_SANITY_DATASET ?? 'production',
  useCdn:    true,
  apiVersion: '2024-01-01',
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PostSummary {
  title:       string;
  slug:        string;
  description: string;
  publishedAt: string;
  tags:        string[];
  tool?:       string;
  toolHref?:   string;
}

export interface PostFull extends PostSummary {
  body: PortableTextBlock[];
}

// Minimal type — @portabletext/to-html handles the full shape
export type PortableTextBlock = Record<string, unknown>;

// ── Queries ───────────────────────────────────────────────────────────────────

export const POSTS_QUERY = `
  *[_type == "post"] | order(publishedAt desc) {
    title,
    "slug": slug.current,
    description,
    publishedAt,
    tags,
    tool,
    toolHref
  }
`;

export const POST_QUERY = `
  *[_type == "post" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    description,
    publishedAt,
    tags,
    tool,
    toolHref,
    body[] {
      ...,
      _type == "imageBlock" => {
        ...,
        image { ..., asset-> { url } }
      },
      _type == "imageTextBlock" => {
        ...,
        mainImage { ..., asset-> { url } }
      }
    }
  }
`;

export const ALL_SLUGS_QUERY = `
  *[_type == "post"] { "slug": slug.current }
`;
