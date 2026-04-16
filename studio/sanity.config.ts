import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { table } from 'sanity-plugin-table';
import { schemaTypes } from './schemaTypes';

export default defineConfig({
  name:      'llmblitz-blog',
  title:     'LLMBlitz Blog',
  projectId: '8k1laq6c',
  dataset:   'production',
  plugins: [
    structureTool(),
    visionTool(),
    table(),
  ],
  schema: { types: schemaTypes },
});
