import { Link } from 'react-router-dom';
import { LegalPage } from './LegalPage';

export function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <p>
        StudentReview (studentreview.in) is operated by Ashutosh Sharma (individual proprietor), India. This policy explains how cancellations
        and refunds work for paid plans. Reading and writing reviews on StudentReview is free for students — nothing on this page applies to
        students.
      </p>

      <h2>What is paid</h2>
      <p>
        Only institutions (colleges, universities and other organisations) can buy a paid plan — Pro or Business — to unlock analytics, listings
        and profile features. See <Link to="/pricing" className="font-semibold text-brand">Pricing</Link> for current prices, shown in Indian
        Rupees (INR) and inclusive of any applicable taxes.
      </p>

      <h2>How billing works</h2>
      <p>
        A paid plan is bought as a one-time payment for a 30-day period through Razorpay. It does <strong>not</strong> renew automatically and we
        never store your card details. When the 30 days end, the organisation returns to the Free plan unless it pays again.
      </p>

      <h2>Cancellation</h2>
      <p>
        There is nothing to cancel: because plans don't auto-renew, simply don't pay again and the plan ends at the end of the paid period. You
        keep access to the paid features until then.
      </p>

      <h2>Refunds</h2>
      <ul className="ml-5 list-disc">
        <li>
          <strong>Within 7 days of payment:</strong> you can request a full refund for any reason. Write to us within 7 days of the payment date.
        </li>
        <li>
          <strong>After 7 days:</strong> payments for a plan period already in use are not refundable, except where StudentReview has failed to
          provide the service.
        </li>
        <li>
          <strong>Duplicate or failed payments:</strong> if you were charged twice or charged but the plan was not activated, we refund the extra
          or unactivated amount in full.
        </li>
        <li>
          <strong>Reviews are never for sale:</strong> no plan and no refund decision affects whether a review is shown or removed.
        </li>
      </ul>

      <h2>How to request a refund</h2>
      <p>
        Use the <Link to="/contact" className="font-semibold text-brand">Contact</Link> page (choose "Institution inquiry") or email{' '}
        <a href="mailto:no-reply@studentreview.in" className="font-semibold text-brand">no-reply@studentreview.in</a> from the organisation's
        registered email, with the payment ID from your receipt. We reply within 3 business days.
      </p>

      <h2>When you will get the money</h2>
      <p>
        Approved refunds are sent back to the original payment method through Razorpay. Banks typically credit it within 5–7 business days after
        we approve it.
      </p>

      <h2>Shipping</h2>
      <p>StudentReview is a digital service. Nothing is shipped; paid plans are activated on your account immediately after payment.</p>
    </LegalPage>
  );
}
