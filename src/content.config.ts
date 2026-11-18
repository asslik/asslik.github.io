import { defineCollection, z, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';

const mediaItem = (image: SchemaContext['image']) =>
  z.object({
    src: image(),
    alt: z.string(),
    caption: z.string().optional(),
    kind: z.enum(['photo', 'diagram', 'result', 'screenshot']).default('photo'),
    // Set to false to keep an image out of the page and the Media gallery.
    public: z.boolean().default(true),
  });

const link = z.object({ label: z.string(), href: z.string() });

const research = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/research' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      short: z.string(),
      authors: z.array(z.string()),
      venue: z.string(),
      year: z.number().optional(),
      status: z.enum(['published', 'in-progress']),
      order: z.number(),
      theme: z.string(),
      summary: z.string(),
      tags: z.array(z.string()),
      pages: z.number(),
      doi: z.string().optional(),
      bibtex: z.string().optional(),
      links: z.array(link).default([]),
      highlights: z.array(z.object({ value: z.string(), label: z.string() })),
      resultsIntro: z.string().optional(),
      results: z
        .array(
          z.object({
            title: z.string(),
            columns: z.array(z.string()),
            rows: z.array(z.array(z.string())),
            emphasis: z.number().optional(),
            note: z.string().optional(),
          }),
        )
        .default([]),
      media: z.array(mediaItem(image)),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      context: z.string(),
      year: z.string().optional(),
      order: z.number(),
      summary: z.string(),
      tools: z.array(z.string()),
      related: z.array(link).default([]),
      media: z.array(mediaItem(image)).default([]),
    }),
});

const experience = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/experience' }),
  schema: ({ image }) =>
    z.object({
      role: z.string(),
      org: z.string(),
      period: z.string(),
      order: z.number(),
      bullets: z.array(z.string()),
      keywords: z.array(z.string()),
      related: z.array(link).default([]),
      media: z.array(mediaItem(image)).default([]),
    }),
});

const teaching = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/teaching' }),
  schema: ({ image }) =>
    z.object({
      role: z.string(),
      title: z.string(),
      detail: z.string().optional(),
      org: z.string().optional(),
      period: z.string(),
      duration: z.string(),
      order: z.number(),
      media: z.array(mediaItem(image)).default([]),
    }),
});

export const collections = { research, projects, experience, teaching };
