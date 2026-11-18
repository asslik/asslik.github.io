import type { APIRoute } from 'astro';
import { profile } from '../data/profile';
import { searchable } from '../data/search.mjs';

// Pages stay crawlable while hidden: a crawler must load them to read their noindex tag.
// The CV PDF cannot carry that tag, so it is blocked here instead.
const hidden = `User-agent: *
Allow: /
Disallow: /papers/
Disallow: ${profile.cv}

User-agent: Googlebot-Image
Disallow: /
`;

export const GET: APIRoute = ({ site }) =>
  new Response(
    searchable ? `User-agent: *\nAllow: /\nDisallow: /papers/\n\nSitemap: ${new URL('sitemap-index.xml', site)}\n` : hidden,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
