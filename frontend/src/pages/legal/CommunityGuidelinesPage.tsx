import { LegalPage } from './LegalPage';

export function CommunityGuidelinesPage() {
  return (
    <LegalPage title="Community Guidelines">
      <p>✓ Reviews should reflect your genuine, first-hand experience.</p>
      <p>✓ Avoid sharing anyone's personal information, including your own — no phone numbers, addresses, or financial details.</p>
      <p>✓ Specific, constructive feedback is more useful than general statements.</p>
      <p>✓ Legitimate criticism is always allowed — moderation targets policy violations, not negative sentiment.</p>
      <p>✕ No threats, hate speech, or targeted harassment.</p>
      <p>✕ No spam, fake reviews, or impersonation of another person or the institution.</p>
      <p>✕ No fabricated claims presented as fact — describe your own experience rather than unsupported accusations.</p>
      <p>
        Content that violates these guidelines can be flagged automatically or reported by other users, and is reviewed by our
        moderation team. See the{' '}
        <a href="/review-guidelines" className="text-brand">
          Review Guidelines
        </a>{' '}
        for what to include when writing a review.
      </p>
    </LegalPage>
  );
}
