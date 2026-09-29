import { describe, expect, it } from 'vitest';
import { firstReviewOutreachEmail, type OutreachEmailInput } from './emailTemplates.js';
import { parseOutreachEmails } from './outreach.service.js';

const base: OutreachEmailInput = {
  institution: { name: 'Quantum University', slug: 'quantum-university', type: 'PRIVATE_UNIVERSITY', website: 'https://www.quantumuniversity.edu.in/', verified: false },
  firstReview: { type: 'ADMISSION_PROCESS', relationship: 'APPLICANT', verifiedStudent: false, recommend: true },
  siteOrigin: 'https://studentreview.in',
  proOfferMonths: 12,
  proPriceInr: 799,
  contact: { phone: '+91 00000 00000', email: 'founder@example.com' },
};

describe('firstReviewOutreachEmail', () => {
  it('builds the Quantum-style email with poster, review and claim links', () => {
    const { subject, text, html } = firstReviewOutreachEmail(base);
    expect(subject).toBe('Quantum University on StudentReview.in: one year of Pro free, and a QR poster for your students');
    expect(text).toContain('from an applicant who went through your admission process and recommends applying');
    expect(text).toContain('https://studentreview.in/poster/quantum-university');
    expect(text).toContain('https://studentreview.in/write-review?college=quantum-university');
    expect(text).toContain('https://studentreview.in/claim/quantum-university');
    expect(text).toContain('official @quantumuniversity.edu.in email address');
    expect(text).toContain('normally ₹799 a month) free for 12 months');
    expect(text).toContain('Phone / WhatsApp: +91 00000 00000');
    expect(text).toContain('usually within a few working days');
    expect(html).toContain('href="https://studentreview.in/poster/quantum-university"');
  });

  it('describes a verified current student and uses "college" for colleges', () => {
    const { text } = firstReviewOutreachEmail({
      ...base,
      institution: { ...base.institution, name: 'ABES Engineering College', slug: 'abes', type: 'ENGINEERING_COLLEGE', verified: true },
      firstReview: { type: 'EXPERIENCE', relationship: 'CURRENT_STUDENT', verifiedStudent: true, recommend: true },
    });
    expect(text).toContain('from a verified current student who recommends the college');
    expect(text).toContain('already carries our "Verified" badge');
    expect(text).not.toMatch(/\buniversity\b/);
  });

  it('never claims a recommendation the reviewer did not make', () => {
    const { text } = firstReviewOutreachEmail({ ...base, firstReview: { ...base.firstReview, recommend: false } });
    expect(text).toContain('from an applicant who went through your admission process.');
    expect(text).not.toContain('recommends');
  });

  it('drops the Pro offer when months is 0', () => {
    const { subject, text } = firstReviewOutreachEmail({ ...base, proOfferMonths: 0 });
    expect(subject).toBe('Quantum University on StudentReview.in: a QR poster for your students');
    expect(text).not.toContain('Pro');
  });

  it('escapes HTML in the college name', () => {
    const { html } = firstReviewOutreachEmail({ ...base, institution: { ...base.institution, name: 'A<b>C' } });
    expect(html).not.toContain('A<b>C');
    expect(html).toContain('A&lt;b&gt;C');
  });
});

describe('parseOutreachEmails', () => {
  it('splits, lowercases and drops invalid entries', () => {
    expect(parseOutreachEmails(' Info@X.edu, admissions@x.edu ; bad, ')).toEqual(['info@x.edu', 'admissions@x.edu']);
    expect(parseOutreachEmails(null)).toEqual([]);
  });
});
