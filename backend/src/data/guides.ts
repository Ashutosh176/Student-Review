// Editorial guides served at /guides/:slug (see guide.routes.ts). Written by
// the StudentReview team, evergreen on purpose: no cutoffs, dates, fees or
// package figures that go stale each admission cycle — those belong on
// college pages, sourced per year. Plain text only (every block is escaped
// when rendered), so no HTML ever goes in here.

export type GuideBlock =
  | { type: 'h2'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

export interface Guide {
  slug: string;
  title: string;
  // Used as the meta description, so keep it under ~160 characters.
  description: string;
  updatedAt: string; // ISO date
  blocks: GuideBlock[];
  // Colleges worth linking from this guide (institution slugs).
  relatedColleges: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'how-to-choose-a-college-in-india',
    title: 'How to Choose a College in India: A Practical Checklist',
    description:
      'Approval, NIRF data, placement reports, full cost and what current students say: the checks that matter before you accept a seat.',
    updatedAt: '2026-09-26',
    relatedColleges: [],
    blocks: [
      {
        type: 'p',
        text: "Rank, brand and a relative's advice all matter, but the three to five years you actually spend at a college depend on things most brochures skip. Work through these checks in order. The first one is pass or fail.",
      },
      { type: 'h2', text: '1. Check the approval of the program, not just the college' },
      {
        type: 'p',
        text: 'A degree is only as useful as the approval behind it, and approval is given program by program. Confirm the exact program you are joining is approved by the right body:',
      },
      {
        type: 'ul',
        items: [
          'Engineering and management programs: AICTE',
          'Pharmacy: Pharmacy Council of India. Architecture: Council of Architecture',
          'Universities and the degrees they award: UGC',
          'Medicine: National Medical Commission. Law: Bar Council of India',
        ],
      },
      {
        type: 'p',
        text: "An unapproved program can cause problems later for government jobs, competitive exams and higher studies abroad. Check the regulator's own website rather than the college brochure.",
      },
      { type: 'h2', text: "2. Read the college's NIRF data, not just its rank" },
      {
        type: 'p',
        text: 'NIRF publishes the data each participating institution submits, including student strength, how many graduates were placed or went on to higher studies, median salary, and faculty numbers. Open the data sheet for the college you are considering and compare the figures that matter to you.',
      },
      {
        type: 'p',
        text: 'The overall rank blends teaching, research, graduation outcomes, outreach and perception. As an undergraduate, graduation outcomes matter far more to you than research output. A gap of a few places in the middle of the list tells you very little.',
      },
      { type: 'h2', text: '3. Ask for the placement report, then read it critically' },
      {
        type: 'ul',
        items: [
          'Ask for the report for your branch or specialisation, not the college-wide average.',
          'Look at the median salary as well as the average. A handful of very large offers can pull the average far above what most students get.',
          'Check how many students were eligible, how many opted out, and how many were actually placed.',
          'Read the company list. Are these recruiters who come back every year, and what roles did they hire for?',
        ],
      },
      { type: 'h2', text: '4. Work out the full cost' },
      {
        type: 'ul',
        items: [
          'Tuition for every year of the program, since fees often rise year on year',
          'Hostel and mess charges',
          'One-time charges such as admission, caution deposit and development fees',
          'Travel home during breaks',
          'Scholarships and fee waivers you are actually eligible for, not just the ones listed',
        ],
      },
      { type: 'h2', text: '5. Talk to current students' },
      {
        type: 'p',
        text: 'This is the step most people skip and the one that tells you the most. Ask about things only students know:',
      },
      {
        type: 'ul',
        items: [
          'How strict is attendance, and how is grading done?',
          'What is the hostel like in the hottest and wettest months?',
          'How does the administration respond when something goes wrong?',
          'Do students from your branch get the kind of placements the brochure shows?',
        ],
      },
      {
        type: 'p',
        text: "Easy ways to find them: the college's LinkedIn page (the Alumni tab lists graduates by year and field), the Instagram pages of college clubs, and reviews written by verified students.",
      },
      { type: 'h2', text: '6. Watch for red flags' },
      {
        type: 'ul',
        items: [
          "Pressure to pay a seat-booking amount before you've seen approval documents",
          'Placement claims with no company names or numbers behind them',
          'Online reviews that are almost all 5 stars and appeared in a burst around admission season',
          'Seat offers through agents or middlemen',
        ],
      },
      { type: 'h2', text: 'Where StudentReview fits' },
      {
        type: 'p',
        text: 'StudentReview collects anonymous reviews from students who verify with their official college email, so you can read what people who actually studied somewhere have to say. Coverage is still growing, so use it alongside the checks above rather than instead of them.',
      },
    ],
  },
  {
    slug: 'josaa-counselling-explained',
    title: 'JoSAA Counselling Explained: Choice Filling, Freeze, Float and Slide',
    description:
      'How JoSAA seat allocation works for IITs, NITs and IIITs: filling your choices, mock allotments, and what freeze, float and slide mean.',
    updatedAt: '2026-09-26',
    relatedColleges: [
      'indian-institute-of-technology-bombay',
      'indian-institute-of-technology-delhi',
      'national-institute-of-technology-tiruchirappalli',
      'national-institute-of-technology-warangal',
    ],
    blocks: [
      {
        type: 'p',
        text: 'JoSAA (the Joint Seat Allocation Authority) runs one common counselling process for the IITs, NITs, and the IIITs and other government-funded technical institutes (GFTIs) that take part. You fill a single ranked list of choices, and seats are allotted round by round based on your rank, category and preferences.',
      },
      { type: 'h2', text: 'Which rank counts where' },
      {
        type: 'ul',
        items: [
          'IITs admit on JEE Advanced ranks.',
          'NITs, participating IIITs and GFTIs admit on JEE Main ranks.',
          'If you are eligible for both, choices for all of them go into the same list.',
          'Some well-known institutes with IIIT in their name, such as IIIT Hyderabad and IIIT-Delhi, run their own admissions and are not part of JoSAA. Check each institute you are interested in.',
        ],
      },
      { type: 'h2', text: 'Choice filling: the step that matters most' },
      {
        type: 'p',
        text: 'You rank institute and program combinations in order of preference. The system gives you the highest choice on your list that your rank allows, which leads to a few simple rules:',
      },
      {
        type: 'ul',
        items: [
          'List choices in your true order of preference. Placing a "safe" choice above one you would rather have can only cost you the better seat.',
          'Fill plenty of choices. A short list increases the risk of ending up with nothing.',
          "Use previous years' opening and closing ranks, published on the JoSAA website, as a guide rather than a guarantee.",
          'NITs reserve half their seats for candidates from their home state, so the closing rank for home-state and other-state candidates can be very different.',
          'Before the deadline, check your final locked list carefully and keep a copy.',
        ],
      },
      { type: 'h2', text: 'Mock allotments' },
      {
        type: 'p',
        text: 'Before the real rounds, JoSAA publishes mock seat allocations based on the choices filled so far. Use them to see roughly where you stand and to reorder your list before it is locked.',
      },
      { type: 'h2', text: 'After a seat is allotted: freeze, float or slide' },
      {
        type: 'ul',
        items: [
          'Freeze: you accept the allotted seat and do not want to be considered for any other choice.',
          'Float: you accept the seat but want to be considered for any higher choice on your list, at any institute, in later rounds.',
          'Slide: you accept the seat but want to be considered only for higher choices within the same institute.',
        ],
      },
      {
        type: 'p',
        text: 'Whichever you pick, you must complete the reporting steps (uploading documents and paying the seat acceptance fee) by the deadline for that round, or the seat is cancelled. If you float or slide and get upgraded, the new seat replaces the old one.',
      },
      { type: 'h2', text: 'After JoSAA: CSAB special rounds' },
      {
        type: 'p',
        text: "Seats that remain vacant at NITs, participating IIITs and GFTIs are usually filled through CSAB special rounds after JoSAA ends. Registration, fees and rules differ from JoSAA, so read CSAB's own notices.",
      },
      { type: 'h2', text: 'Before you lock your list' },
      {
        type: 'p',
        text: 'Rank lists tell you where you can get in, not what it is like once you are there. For your top few choices, read what current students say about the branch, the hostel and placements before you decide the order.',
      },
    ],
  },
  {
    slug: 'iit-vs-nit-vs-iiit',
    title: "IIT vs NIT vs IIIT: What's Actually Different",
    description:
      'How IITs, NITs and IIITs differ in admission, how they are run, and what to compare when choosing between a college and a branch.',
    updatedAt: '2026-09-26',
    relatedColleges: [
      'indian-institute-of-technology-bombay',
      'indian-institute-of-technology-madras',
      'national-institute-of-technology-tiruchirappalli',
      'national-institute-of-technology-karnataka-surathkal',
      'international-institute-of-information-technology-hyderabad',
      'indraprastha-institute-of-information-technology-delhi',
    ],
    blocks: [
      {
        type: 'p',
        text: 'All three are respected routes into engineering, but they differ in how you get in and how they are run, and the right choice often comes down to the specific program rather than the three letters in the name.',
      },
      { type: 'h2', text: 'How you get in' },
      {
        type: 'ul',
        items: [
          'IITs: JEE Advanced, which you become eligible for through JEE Main. Seats are allotted through JoSAA.',
          'NITs: JEE Main ranks through JoSAA, with half the seats at each NIT reserved for candidates from its home state.',
          'IIITs: it depends on the institute. The government-funded and public-private partnership IIITs mostly admit through JEE Main and JoSAA, while some, such as IIIT Hyderabad and IIIT-Delhi, run their own admission processes.',
        ],
      },
      { type: 'h2', text: 'How they are run' },
      {
        type: 'p',
        text: 'IITs and NITs are Institutions of National Importance set up under Acts of Parliament. IIITs are a mix: some are central institutions, some are run as public-private partnerships, and others are state or deemed universities. That affects fees, governance and how much each campus has grown, so it is worth checking for the specific IIIT you are considering.',
      },
      { type: 'h2', text: 'College or branch? The real trade-off' },
      {
        type: 'p',
        text: 'The hardest decision is usually a better-known institute with a branch you are less keen on, against a less famous institute with the branch you want. There is no universal answer, but these questions help:',
      },
      {
        type: 'ul',
        items: [
          'Do you know what you want to work on? If so, the branch and its curriculum matter more.',
          'Can you change branch, or add a minor or dual degree, after the first year? Rules differ a lot between institutes.',
          'Do students from that branch actually get placed in the roles you want? Look at the branch-wise report, not the headline figure.',
          'How much do location, internships nearby and total cost matter to your family?',
        ],
      },
      { type: 'h2', text: 'What to compare instead of the name' },
      {
        type: 'ul',
        items: [
          'The curriculum and electives of the exact program',
          'Branch-change, minor and dual-degree policies',
          'The branch-wise placement report, including the median',
          'Location, internship access and the full cost of the degree',
          'What current students in that branch say about teaching, hostel life and the administration',
        ],
      },
    ],
  },
  {
    slug: 'how-to-spot-fake-college-reviews',
    title: 'How to Spot Fake College Reviews (and Read Real Ones Properly)',
    description:
      'Warning signs of fake or paid college reviews, how to read genuine reviews properly, and what to check beyond reviews before you decide.',
    updatedAt: '2026-09-26',
    relatedColleges: [],
    blocks: [
      {
        type: 'p',
        text: 'Online reviews can be the most honest source of information about a college, or the least. Bunches of glowing reviews posted in the same week are a common sign of organised reviewing, often a college asking a batch to post during admission season. These checks help you tell the difference.',
      },
      { type: 'h2', text: 'Signs a review may not be genuine' },
      {
        type: 'ul',
        items: [
          'Many 5-star reviews posted within a few days, followed by months of silence',
          'Generic praise with no specifics: "best faculty, best placements, good infrastructure"',
          'Reviewer accounts with a single review ever, or accounts that gave several competing colleges 5 stars',
          'The same phrases repeated across different reviews',
          'Reviews that read like the brochure',
        ],
      },
      { type: 'h2', text: 'How to read genuine reviews' },
      {
        type: 'ul',
        items: [
          'Read the 1 to 3 star reviews first. They tell you what goes wrong and how the college handles it.',
          'Look for patterns across several reviews rather than reacting to one angry or ecstatic one.',
          'Check the date. A review from five years ago may describe a different hostel, curriculum or placement cell.',
          "Separate problems with the college from one person's branch, batch or bad luck.",
          'Give more weight to reviews from verified students.',
        ],
      },
      { type: 'h2', text: 'Check beyond reviews' },
      {
        type: 'ul',
        items: [
          'Ask for the placement report with company names and the number of offers, and compare it with the data the college submitted to NIRF.',
          'Confirm the approval of the exact program with the regulator.',
          'Talk to two or three current students directly, for example through the Alumni tab on the college\'s LinkedIn page.',
        ],
      },
      { type: 'h2', text: 'How StudentReview handles this' },
      {
        type: 'ul',
        items: [
          'Reviewers can verify with their official college email to earn the Verified Student badge. Personal email providers are not accepted.',
          'Names are never shown, and reviews publish in batches so the timing cannot identify anyone.',
          'Near-identical reviews posted on the same college are flagged for a human moderator.',
          "Colleges can reply publicly, but cannot pay to remove a genuine review.",
          'Rankings adjust for the number of reviews and require a minimum number before a college is ranked, so a couple of 5-star reviews cannot put a college at the top.',
        ],
      },
    ],
  },
];

export function guideSummaries() {
  return GUIDES.map(({ slug, title, description, updatedAt }) => ({ slug, title, description, updatedAt }));
}

export function findGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
