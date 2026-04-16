import { defineType } from 'sanity';

// Shared blockContent type used by plugins that depend on it
export const blockContentType = defineType({
  name:  'blockContent',
  title: 'Block Content',
  type:  'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2',     value: 'h2'     },
        { title: 'H3',     value: 'h3'     },
      ],
      marks: {
        decorators: [
          { title: 'Bold',   value: 'strong' },
          { title: 'Italic', value: 'em'     },
          { title: 'Code',   value: 'code'   },
        ],
        annotations: [
          {
            name:   'link',
            type:   'object',
            title:  'Link',
            fields: [
              { name: 'href', type: 'url', title: 'URL' },
            ],
          },
        ],
      },
    },
  ],
});
