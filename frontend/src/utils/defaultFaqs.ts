// Built-in FAQs shown on /faq (and emitted as FAQPage structured data). Admin-
// managed FAQs from the database are listed alongside these. Answers only state
// how the product works today — see the Trust & Verification page and the
// review/verification services — and avoid promising timelines or figures.
export interface DefaultFaq {
  question: string;
  answer: string;
}

export interface DefaultFaqGroup {
  title: string;
  faqs: DefaultFaq[];
}

export const DEFAULT_FAQ_GROUPS: DefaultFaqGroup[] = [
  {
    title: 'Getting started',
    faqs: [
      {
        question: 'What is StudentReview?',
        answer:
          'StudentReview is a place to read and write honest, anonymous reviews of colleges and universities across India — placements, faculty, hostel life, campus and admissions — from the students who actually studied there.',
      },
      {
        question: 'Is StudentReview free for students?',
        answer: 'Yes. Reading reviews, writing reviews and asking questions are free for students. Paid plans are only for institutions that want advanced analytics for their profile.',
      },
      {
        question: 'Do I need an account to read reviews?',
        answer: 'No, you can browse colleges, ratings and reviews without signing in. You need a free account to write a review, ask a question or save colleges.',
      },
    ],
  },
  {
    title: 'Writing a review',
    faqs: [
      {
        question: 'Who can write a review?',
        answer:
          'Current students and alumni. To keep reviews trustworthy, you first verify your student identity for that college, either with your official college email or by uploading an ID or other document.',
      },
      {
        question: 'How do I verify my student identity?',
        answer:
          'Open the college page and choose "Verify your student identity". You can confirm a one-time code sent to your official college email address (personal Gmail or Yahoo addresses are not accepted), or upload a document such as an ID card, admit card or degree certificate for our team to review by hand.',
      },
      {
        question: 'Will my review really be anonymous?',
        answer:
          'Yes. Your name, email and account are never shown with a review — not to the public and not to the college. The only thing people see is a "Verified Student" or "Anonymous Student" label.',
      },
      {
        question: 'Why was my review not published straight away?',
        answer:
          'Every review is automatically checked for spam, abuse and leaked personal information, and borderline ones go to a human moderator first. Reviews are published once they pass that check.',
      },
      {
        question: 'What should I include in a good review?',
        answer:
          'Be specific and honest: what the placements, faculty, hostel, campus and fees were really like, and who you would recommend the college to. Please avoid personal attacks, names of individuals and anything you cannot stand behind.',
      },
    ],
  },
  {
    title: 'Colleges & questions',
    faqs: [
      {
        question: "I can't find my college. What should I do?",
        answer:
          'Try a shorter search, such as part of the college name or its city. If the college is genuinely missing, use "Can\'t find your college? Add it" on the search results page to add it, and then write the first review.',
      },
      {
        question: 'Can I ask a question about a specific college?',
        answer: 'Yes. Open the college page and go to its Questions tab. Current students and alumni can answer, so you get answers from people who have been there.',
      },
      {
        question: 'How are colleges ranked on StudentReview?',
        answer:
          'Rankings on the Rankings page come from the ratings students give in their reviews, not from advertising. Colleges cannot pay for a better position or to remove a genuine review.',
      },
      {
        question: 'Can I compare colleges?',
        answer: 'Yes. Use the Compare page to view colleges side by side.',
      },
    ],
  },
  {
    title: 'For institutions',
    faqs: [
      {
        question: 'How can my college claim its profile?',
        answer:
          'Go to the college page and choose the option to claim the profile. You will need to provide your official email and supporting documents so we can confirm you represent the institution.',
      },
      {
        question: 'Can a college delete or edit a negative review?',
        answer: 'No. Colleges can publicly respond to a review, but they cannot edit it or pay to have a genuine review removed.',
      },
    ],
  },
  {
    title: 'Safety & support',
    faqs: [
      {
        question: 'How do I report a review or answer?',
        answer: 'Use the report option on the review or answer. Our moderators look at every report; you can read the rules on the Community Guidelines and Review Guidelines pages.',
      },
      {
        question: 'I forgot my password. What now?',
        answer: 'Use "Forgot password" on the login page. We will email you a link to set a new password.',
      },
      {
        question: 'I have a question that is not listed here.',
        answer: 'Ask us using the form at the bottom of this page and our team will reply by email.',
      },
    ],
  },
];
