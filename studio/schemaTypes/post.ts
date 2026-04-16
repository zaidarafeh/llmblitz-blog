import { defineField, defineType } from 'sanity';

export const postType = defineType({
  name:  'post',
  title: 'Post',
  type:  'document',
  fields: [
    defineField({
      name:       'title',
      title:      'Title',
      type:       'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name:  'slug',
      title: 'Slug',
      type:  'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name:       'description',
      title:      'Description (SEO)',
      type:       'text',
      rows:       3,
      validation: Rule => Rule.required().max(160),
    }),
    defineField({
      name:       'publishedAt',
      title:      'Published At',
      type:       'datetime',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name:  'tags',
      title: 'Tags',
      type:  'array',
      of:    [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name:        'tool',
      title:       'Related Tool',
      description: 'e.g. BlitzLab',
      type:        'string',
    }),
    defineField({
      name:        'toolHref',
      title:       'Tool Link',
      description: 'e.g. /optimize',
      type:        'string',
    }),
    defineField({
      name:  'body',
      title: 'Body',
      type:  'array',
      of: [
        // ── Rich text block ──────────────────────────────────────────
        {
          type: 'block',
          styles: [
            { title: 'Normal',     value: 'normal'     },
            { title: 'H2',         value: 'h2'         },
            { title: 'H3',         value: 'h3'         },
            { title: 'H4',         value: 'h4'         },
            { title: 'Quote',      value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold',      value: 'strong'        },
              { title: 'Italic',    value: 'em'            },
              { title: 'Code',      value: 'code'          },
              { title: 'Underline', value: 'underline'     },
              { title: 'Strike',    value: 'strike-through' },
            ],
            annotations: [
              {
                name:  'link',
                type:  'object',
                title: 'Link',
                fields: [
                  {
                    name:  'href',
                    type:  'url',
                    title: 'URL',
                    validation: (Rule: any) =>
                      Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
                  },
                  {
                    name:         'blank',
                    type:         'boolean',
                    title:        'Open in new tab',
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },

        // ── Hero Image ────────────────────────────────────────────────
        {
          name:  'heroImage',
          title: 'Hero Image',
          type:  'object',
          fields: [
            {
              name:     'image',
              title:    'Image',
              type:     'image',
              options:  { hotspot: true },
              validation: (Rule: any) => Rule.required(),
            },
            { name: 'alt',      title: 'Alt text',          type: 'string' },
            { name: 'title',    title: 'Overlay title',     type: 'string' },
            { name: 'subtitle', title: 'Overlay subtitle',  type: 'string' },
            {
              name:    'height',
              title:   'Height',
              type:    'string',
              options: {
                list: [
                  { title: 'Small (300px)',  value: 'small'  },
                  { title: 'Medium (480px)', value: 'medium' },
                  { title: 'Large (640px)',  value: 'large'  },
                ],
                layout: 'radio',
              },
              initialValue: 'medium',
            },
          ],
          preview: {
            select: { media: 'image', title: 'title', subtitle: 'height' },
            prepare({ media, title, subtitle }: any) {
              return { media, title: `Hero: ${title || 'untitled'}`, subtitle };
            },
          },
        },

        // ── Image Pair (side by side) ─────────────────────────────────
        {
          name:  'imagePair',
          title: 'Image Pair',
          type:  'object',
          fields: [
            {
              name:  'left',
              title: 'Left image',
              type:  'object',
              fields: [
                { name: 'image',   type: 'image', options: { hotspot: true } },
                { name: 'alt',     type: 'string', title: 'Alt text'  },
                { name: 'caption', type: 'string', title: 'Caption'   },
              ],
            },
            {
              name:  'right',
              title: 'Right image',
              type:  'object',
              fields: [
                { name: 'image',   type: 'image', options: { hotspot: true } },
                { name: 'alt',     type: 'string', title: 'Alt text'  },
                { name: 'caption', type: 'string', title: 'Caption'   },
              ],
            },
          ],
          preview: {
            select: { media: 'left.image' },
            prepare({ media }: any) {
              return { media, title: 'Image Pair' };
            },
          },
        },

        // ── Image + Text ──────────────────────────────────────────────
        {
          name:  'imageText',
          title: 'Image + Text',
          type:  'object',
          fields: [
            {
              name:    'image',
              title:   'Image',
              type:    'image',
              options: { hotspot: true },
              validation: (Rule: any) => Rule.required(),
            },
            { name: 'alt',      title: 'Alt text',  type: 'string' },
            { name: 'heading',  title: 'Heading',   type: 'string' },
            { name: 'body',     title: 'Body text', type: 'text', rows: 4 },
            {
              name:  'button',
              title: 'Button (optional)',
              type:  'object',
              fields: [
                { name: 'label', title: 'Label', type: 'string' },
                { name: 'href',  title: 'URL',   type: 'url',
                  validation: (Rule: any) => Rule.uri({ allowRelative: true, scheme: ['http','https'] }) },
                { name: 'newTab', title: 'Open in new tab', type: 'boolean', initialValue: false },
              ],
            },
            {
              name:         'imagePosition',
              title:        'Image position',
              type:         'string',
              options:      { list: [{ title: 'Left', value: 'left' }, { title: 'Right', value: 'right' }], layout: 'radio' },
              initialValue: 'left',
            },
          ],
          preview: {
            select: { media: 'image', title: 'heading', subtitle: 'imagePosition' },
            prepare({ media, title, subtitle }: any) {
              return { media, title: `Image+Text: ${title || 'untitled'}`, subtitle };
            },
          },
        },

        // ── Image (with optional caption + link) ─────────────────────
        {
          name:  'imageBlock',
          title: 'Image',
          type:  'object',
          fields: [
            {
              name:    'image',
              title:   'Image',
              type:    'image',
              options: { hotspot: true },
              validation: (Rule: any) => Rule.required(),
            },
            {
              name:  'alt',
              title: 'Alt text',
              type:  'string',
            },
            {
              name:  'caption',
              title: 'Caption',
              type:  'string',
            },
            {
              name:  'href',
              title: 'Link URL (optional)',
              type:  'url',
            },
          ],
          preview: {
            select: { media: 'image', title: 'alt', subtitle: 'caption' },
            prepare({ media, title, subtitle }: any) {
              return { media, title: title || 'Image', subtitle };
            },
          },
        },

        // ── Rich Table (sanity-plugin-rich-table, v5 compatible) ─────
        { type: 'richTableBlock' },

        // ── Code block ────────────────────────────────────────────────
        {
          name:  'codeBlock',
          title: 'Code Block',
          type:  'object',
          fields: [
            {
              name:    'language',
              title:   'Language',
              type:    'string',
              options: {
                list: [
                  { title: 'Plain text', value: 'text'       },
                  { title: 'TypeScript', value: 'typescript' },
                  { title: 'JavaScript', value: 'javascript' },
                  { title: 'Python',     value: 'python'     },
                  { title: 'Bash',       value: 'bash'       },
                  { title: 'JSON',       value: 'json'       },
                  { title: 'YAML',       value: 'yaml'       },
                  { title: 'HTML',       value: 'html'       },
                  { title: 'CSS',        value: 'css'        },
                  { title: 'SQL',        value: 'sql'        },
                ],
              },
              initialValue: 'text',
            },
            {
              name:  'code',
              title: 'Code',
              type:  'text',
              rows:  10,
            },
          ],
          preview: {
            select: { language: 'language', code: 'code' },
            prepare({ language, code }: { language: string; code: string }) {
              return {
                title:    `[${language ?? 'code'}]`,
                subtitle: code?.slice(0, 80),
              };
            },
          },
        },

        // ── Callout / info box ────────────────────────────────────────
        {
          name:  'callout',
          title: 'Callout',
          type:  'object',
          fields: [
            {
              name:    'style',
              type:    'string',
              options: {
                list: [
                  { title: 'Info',    value: 'info'    },
                  { title: 'Warning', value: 'warning' },
                  { title: 'Tip',     value: 'tip'     },
                ],
              },
              initialValue: 'info',
            },
            {
              name:  'content',
              title: 'Content',
              type:  'text',
            },
          ],
          preview: {
            select: { style: 'style', content: 'content' },
            prepare({ style, content }: { style: string; content: string }) {
              return { title: `[${style}] ${content?.slice(0, 60)}` };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'publishedAt' },
  },
});
