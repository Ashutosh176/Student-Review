import { LegalPage } from './LegalPage';

export function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>By using StudentReview, you agree to the following terms.</p>
      <h2>Reviews are user experiences</h2>
      <p>
        Reviews represent individual users' personal experiences and opinions. StudentReview does not verify every factual
        claim in a review and does not guarantee that every statement is true. Users are responsible for what they submit.
      </p>
      <h2>Manipulated content can be removed</h2>
      <p>
        Fake, duplicated, coordinated, or otherwise manipulated reviews can be removed under our Community Guidelines. Removal
        for policy violations is unrelated to whether a review is positive or negative.
      </p>
      <h2>Organizations may respond, never delete</h2>
      <p>
        A verified organization may publish an official response to a review. Organizations cannot delete, hide, or pay to
        remove a legitimate review — only StudentReview moderators can act on reviews, and only for policy violations.
      </p>
      <h2>No payment removes legitimate content</h2>
      <p>Paid plans unlock profile management, analytics, and listings. No plan, at any price, removes a legitimate negative review.</p>
      <h2>Grievances</h2>
      <p>
        If you believe content violates these terms, use the Report button on that content or the{' '}
        <a href="/report-content" className="text-brand">
          Report Content
        </a>{' '}
        page.
      </p>
    </LegalPage>
  );
}
