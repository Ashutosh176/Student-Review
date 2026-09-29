import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import QRCode from 'qrcode';
import { institutionsApi } from '@/api/institutions.api';

// Printable A4 review poster for one college, linked from the first-review
// outreach email (backend services/outreach.service.ts). The QR opens that
// college's review form. "Download PDF" is the browser's print dialog, where
// "Save as PDF" is the default destination on desktop and Android.

// "ABES Engineering College (ABESEC), Ghaziabad" → "ABES Engineering College"
function shortName(name: string): string {
  return name.replace(/\s*\([^)]*\)/g, '').split(',')[0].trim();
}

function institutionNoun(type: string): string {
  if (type.endsWith('UNIVERSITY')) return 'university';
  if (['IIT', 'NIT', 'IIIT', 'MANAGEMENT_INSTITUTE'].includes(type)) return 'institute';
  return 'college';
}

export function PosterPage() {
  const { slug = '' } = useParams();
  const query = useQuery({ queryKey: ['institution', slug], queryFn: () => institutionsApi.getBySlug(slug) });
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const reviewUrl = `${window.location.origin}/write-review?college=${encodeURIComponent(slug)}`;

  useEffect(() => {
    QRCode.toString(reviewUrl, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#161B33', light: '#FFFFFF' } })
      .then(setQrSvg)
      .catch(() => setQrSvg(null));
  }, [reviewUrl]);

  if (query.isError) {
    return <p className="p-10 text-center text-sm text-sub">This college couldn't be found.</p>;
  }
  const inst = query.data;
  if (!inst || !qrSvg) return <p className="p-10 text-center text-sm text-sub">Preparing poster…</p>;

  const short = shortName(inst.name);
  const city = inst.locations[0]?.city;
  const headlineSize = short.length > 30 ? 'text-[40px]' : short.length > 20 ? 'text-[48px]' : 'text-[56px]';

  return (
    <div className="poster-root min-h-screen bg-surface py-6 print:bg-white print:py-0">
      <Helmet>
        <title>{`Review poster — ${short} — StudentReview`}</title>
        <meta name="robots" content="noindex" />
        <style>{'@page { size: A4; margin: 0 } @media print { html, body { background: #fff } }'}</style>
      </Helmet>

      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 print:hidden">
        <p className="text-[13px] text-sub">
          Print this poster, or choose <b>Download PDF</b> and then <b>Save as PDF</b>.
        </p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
          Download PDF
        </button>
      </div>

      <div className="mx-auto flex h-[297mm] w-[210mm] flex-col items-center justify-between bg-white px-[18mm] pb-[16mm] pt-[22mm] text-center text-brand-deep shadow-card print:shadow-none">
        <div className="flex items-center gap-2.5 text-[20px] font-bold">
          <img src="/favicon-192x192.png" alt="" className="h-10 w-10" />
          StudentReview.in
        </div>

        <div className="flex flex-col items-center">
          <h1 className={`mt-[8mm] font-heading font-extrabold leading-[1.05] tracking-tight ${headlineSize}`}>Studying at {short}?</h1>
          <p className="mt-3 max-w-[160mm] text-[22px] leading-snug text-[#3a4060]">
            Share what it's really like, so next year's batch can choose. Scan to write an anonymous review.
          </p>
          <div
            className="mt-[10mm] h-[92mm] w-[92mm] rounded-[6mm] border-[3px] border-brand-deep p-[5mm] [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <p className="mt-[6mm] text-[24px] font-bold">
            {short}
            {city && !short.includes(city) ? `, ${city}` : ''}
          </p>
          <ul className="mt-[5mm] space-y-1 text-left text-[20px]">
            {['Takes about 5 minutes', 'Your name is never shown', 'Good or bad, just honest'].map((t) => (
              <li key={t}>
                <span className="mr-2 font-bold text-[#C98A12]">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-[15px] text-[#555]">
          <span className="mb-1 block text-[26px] font-bold text-brand-deep">studentreview.in</span>
          Independent student review platform. Reviews are written by students and are not edited by the {institutionNoun(inst.type)}.
        </div>
      </div>
    </div>
  );
}
