import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://blog.llmblitz.io',
  integrations: [mdx()],
  output: 'static',
});
