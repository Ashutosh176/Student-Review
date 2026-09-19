import { Logo } from './Logo';
import { Link } from 'react-router-dom';

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white px-4 py-9 sm:px-7 print:hidden">
      <div className="grid grid-cols-2 gap-6 text-[12.5px] sm:grid-cols-3 lg:grid-cols-5">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <Logo className="mb-2 h-7 w-auto" />
          <p className="max-w-[200px] text-sub">Honest, anonymous college reviews for students across India.</p>
        </div>
        <div>
          <h5 className="mb-2.5 text-[11.5px] font-semibold text-sub">Company</h5>
          <Link to="/about" className="mb-1.5 block text-[#4B4F5E]">
            About
          </Link>
          <Link to="/contact" className="mb-1.5 block text-[#4B4F5E]">
            Contact
          </Link>
          <Link to="/faq" className="mb-1.5 block text-[#4B4F5E]">
            FAQ
          </Link>
          <Link to="/pricing" className="mb-1.5 block text-[#4B4F5E]">
            Pricing
          </Link>
        </div>
        <div>
          <h5 className="mb-2.5 text-[11.5px] font-semibold text-sub">Legal</h5>
          <Link to="/privacy" className="mb-1.5 block text-[#4B4F5E]">
            Privacy
          </Link>
          <Link to="/terms" className="mb-1.5 block text-[#4B4F5E]">
            Terms
          </Link>
          <Link to="/refund-policy" className="mb-1.5 block text-[#4B4F5E]">
            Refund &amp; Cancellation
          </Link>
          <Link to="/community-guidelines" className="mb-1.5 block text-[#4B4F5E]">
            Community Guidelines
          </Link>
        </div>
        <div>
          <h5 className="mb-2.5 text-[11.5px] font-semibold text-sub">Trust &amp; Safety</h5>
          <Link to="/trust" className="mb-1.5 block text-[#4B4F5E]">
            How Verification Works
          </Link>
          <Link to="/report-content" className="mb-1.5 block text-[#4B4F5E]">
            Report Content
          </Link>
          <Link to="/review-guidelines" className="mb-1.5 block text-[#4B4F5E]">
            Review Guidelines
          </Link>
          <Link to="/org-response-policy" className="mb-1.5 block text-[#4B4F5E]">
            Org Response Policy
          </Link>
        </div>
        <div>
          <h5 className="mb-2.5 text-[11.5px] font-semibold text-sub">Follow</h5>
          <a
            href="https://www.instagram.com/studentreview.india?stkn=MTFqa2hhcGZ4d3dpag%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-1.5 block text-[#4B4F5E]"
          >
            Instagram
          </a>
          <a
            href="https://www.linkedin.com/company/studentreview-in"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-1.5 block text-[#4B4F5E]"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
