// Pushes every URL in the live sitemap to IndexNow (Bing, Yandex, Seznam,
// Naver and others share submissions), so new/updated pages get crawled in
// hours instead of waiting for discovery. Free, no account needed — ownership
// is proven by the key file served at https://studentreview.in/<key>.txt
// (frontend/public/<key>.txt).
//   npx tsx scripts/indexnow-submit.ts
// Re-run after adding colleges or content in bulk. Google does not use
// IndexNow — use Search Console's sitemap/URL inspection for Google.
const HOST = 'studentreview.in';
const KEY = 'f90cf745d8690c0bf9310117755604e9';
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

async function main() {
  const keyCheck = await fetch(`https://${HOST}/${KEY}.txt`);
  const keyBody = (await keyCheck.text()).trim();
  if (!keyCheck.ok || keyBody !== KEY) throw new Error(`Key file not served correctly at https://${HOST}/${KEY}.txt (status ${keyCheck.status})`);

  const xml = await (await fetch(SITEMAP_URL)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter((u) => new URL(u).host === HOST);
  if (urls.length === 0) throw new Error('No URLs found in sitemap');

  // IndexNow accepts up to 10,000 URLs per request.
  for (let i = 0; i < urls.length; i += 10_000) {
    const batch = urls.slice(i, i + 10_000);
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: batch }),
    });
    console.log(`Submitted ${batch.length} URLs → HTTP ${res.status} ${res.statusText}`);
    if (res.status >= 400) console.log(await res.text());
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
