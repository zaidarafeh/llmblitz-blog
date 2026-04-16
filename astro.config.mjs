import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://blog.llmblitz.io',
  output: 'static',
  adapter: cloudflare(),
});
