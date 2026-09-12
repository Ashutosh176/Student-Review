import { LegalPage } from './LegalPage';

export function OrgResponsePolicyPage() {
  return (
    <LegalPage title="Organization Response Policy">
      <p>
        A verified organization can publish one official response per review, displayed publicly beneath that review and
        labeled "Official Response."
      </p>
      <h2>What organizations can do</h2>
      <p>Respond publicly to any review of their institution. Edit their own official profile information. Report content that violates the Community Guidelines, which is then reviewed by StudentReview moderators — organizations cannot act on reports themselves.</p>
      <h2>What organizations can never do</h2>
      <p>Delete, hide, or edit a student's review. Pay to remove a legitimate negative review, at any subscription tier. See a reviewer's real identity — organizations only ever see "Anonymous Student" or "Verified Student," the same as the public.</p>
    </LegalPage>
  );
}
