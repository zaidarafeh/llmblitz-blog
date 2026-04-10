import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title:       z.string(),
    description: z.string(),
    pubDate:     z.coerce.date(),
    tags:        z.array(z.string()).default([]),
    tool:        z.string().optional(),   // which LLMBlitz tool this post links to
    toolHref:    z.string().optional(),   // e.g. /eco-blitz
    draft:       z.boolean().default(false),
  }),
});

export const collections = { blog };
