import { LegalPage } from './LegalPage';

export function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        StudentReview is built around anonymity by design. We collect only what is necessary to run the platform, and we never
        publish personally identifying information alongside a review or answer.
      </p>
      <h2>What we collect</h2>
      <p>Account email, a username you choose, hashed passwords, and content you submit (reviews, questions, answers, reports).</p>
      <h2>What we never expose publicly</h2>
      <p>
        Your email address, phone number, IP address, or any verification evidence (such as an institutional email used to apply
        for a "Verified Student" badge) is never included in any public API response or page. Reviews show only "Anonymous
        Student" or "Verified Student."
      </p>
      <h2>Verification evidence</h2>
      <p>
        When you submit a student or alumni verification request, we store a one-way hash reference rather than the raw
        evidence wherever practical, and access to verification records is restricted to platform administrators reviewing
        that specific request.
      </p>
      <h2>Data retention</h2>
      <p>You can delete your own reviews at any time. Deleting your account removes your personal account data; aggregate,
      de-identified statistics may be retained.</p>
    </LegalPage>
  );
}
