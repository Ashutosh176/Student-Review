// Pure string-templating helpers for building the HTML served to crawlers
// that don't execute JavaScript (see middleware.ts). No DOM, no `document` —
// must run in the Vercel Edge runtime.

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface BotHeadTags {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  structuredData?: unknown;
}

// The base `index.html` (fetched fresh from this same deployment, so it
// always has the current build's hashed asset tags) has no static
// description/canonical/og:title/og:description — see index.html's comment
// for why — so this only needs to REPLACE <title> and INSERT everything
// else, never de-duplicate an existing static tag.
export function injectHead(html: string, tags: BotHeadTags): string {
  const title = escapeHtml(tags.title);
  const description = escapeHtml(tags.description);
  const ogTitle = escapeHtml(tags.ogTitle ?? tags.title);
  const ogDescription = escapeHtml(tags.ogDescription ?? tags.description);

  const inserted = [
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${escapeHtml(tags.canonical)}">`,
    `<meta property="og:title" content="${ogTitle}">`,
    `<meta property="og:description" content="${ogDescription}">`,
    `<meta property="og:url" content="${escapeHtml(tags.canonical)}">`,
    tags.structuredData ? `<script type="application/ld+json">${JSON.stringify(tags.structuredData)}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  return html.replace(/<title>.*?<\/title>/s, `<title>${title}</title>\n    ${inserted}`);
}

// `main.tsx` mounts with `createRoot(...).render(...)`, not `hydrateRoot`, so
// React fully replaces whatever is inside #root on the client — this content
// is purely for crawlers that never run the JS at all, and briefly visible
// to real browsers before hydration, never a hydration-mismatch risk.
export function injectRootContent(html: string, contentHtml: string): string {
  return html.replace('<div id="root"></div>', `<div id="root">${contentHtml}</div>`);
}
