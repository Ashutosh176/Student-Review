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
    title: 'IIT vs NIT vs IIIT: Differences, and Which Is Better for You',
    description:
      'How IITs, NITs and IIITs differ in admission and governance, what an IIIT actually is, and whether an IIIT or an NIT is the better choice for you.',
    updatedAt: '2026-11-17',
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
      { type: 'h2', text: 'What is an IIIT, exactly?' },
      {
        type: 'p',
        text: '"IIIT" (Indian or International Institute of Information Technology) is a name shared by institutes that are set up and run in quite different ways. They broadly fall into four groups:',
      },
      {
        type: 'ul',
        items: [
          'Centrally funded IIITs, such as IIIT Allahabad and ABV-IIITM Gwalior, run by the central government.',
          'Public-private partnership (PPP) IIITs, set up jointly by the central government, a state government and industry partners. Several of these are relatively new.',
          'State IIITs, such as IIIT-Delhi, set up by a state government.',
          'Deemed universities, such as IIIT Hyderabad and IIIT Bangalore, which run their own admissions.',
        ],
      },
      {
        type: 'p',
        text: 'Most IIITs concentrate on computer science, electronics and related fields, while NITs and IITs offer a much wider range of engineering branches.',
      },
      { type: 'h2', text: 'IIIT kya hota hai? (in short)' },
      {
        type: 'p',
        text: 'IIIT ka matlab hai Indian (ya International) Institute of Information Technology. Ye mainly computer science, electronics aur IT se jude courses padhate hain. Kuch IIIT central government ke hain, kuch public-private partnership (PPP) mein chalte hain, kuch state ke hain, aur kuch deemed universities hain. Zyada tar IIIT mein admission JEE Main aur JoSAA se hota hai, lekin IIIT Hyderabad aur IIIT-Delhi jaise kuch institute apna alag admission process chalate hain. Kaunsa IIIT accha hai, ye uske program, faculty, campus aur placements dekh kar tay karein, sirf naam se nahi.',
      },
      { type: 'h2', text: 'Is an IIIT better than an NIT?' },
      {
        type: 'p',
        text: 'Neither is better across the board. The established IIITs have strong reputations in computer science, and some are among the most sought-after options for that branch. Some newer IIITs are still building their campuses, faculty and placement networks. NITs are older and larger, offer many branches, and have long-standing recruiter relationships. Compare the specific institute and program:',
      },
      {
        type: 'ul',
        items: [
          'If you want computer science, compare the CSE program at the IIIT with the CSE program at the NIT: curriculum, electives, faculty and the branch-wise placement report.',
          'If you are unsure about your branch, an NIT gives more room to switch or add a minor in a different field.',
          'For a newer IIIT, check whether it runs from its own permanent campus, and how many batches have graduated.',
          'Check the full fees. PPP and state IIITs can cost noticeably more than NITs.',
          'Ask current students how the teaching, hostels and administration actually work day to day.',
        ],
      },
      { type: 'h2', text: 'IIT vs NIT' },
      {
        type: 'p',
        text: 'IITs admit through JEE Advanced and are generally the hardest to get into, with large research programs and alumni networks. NITs admit through JEE Main and are spread across almost every state. The older NITs are highly regarded, and a sought-after branch at a top NIT can be a better fit than a branch you do not want at an IIT. The questions below apply to that choice too.',
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
  {
    slug: 'private-deemed-state-autonomous-college-types',
    title: 'Private, Deemed, State or Autonomous? What College Labels Mean in India',
    description:
      'Central, state, private and deemed universities, institutes of national importance, affiliated and autonomous colleges, and PGDM institutes, explained.',
    updatedAt: '2026-10-31',
    relatedColleges: [],
    blocks: [
      {
        type: 'p',
        text: 'Indian colleges carry labels like "deemed to be university", "autonomous" or "affiliated to". They are not marketing words. They decide who awards your degree, who sets your syllabus and exams, and which regulator you can turn to if something goes wrong.',
      },
      { type: 'h2', text: 'Universities: the bodies that award degrees' },
      {
        type: 'ul',
        items: [
          'Central university: set up by an Act of Parliament and funded by the central government.',
          'State university: set up by an Act of a state legislature. Many state universities also affiliate colleges and award the degrees for them.',
          'Private university: set up by an Act of a state legislature with a private sponsoring body. It awards its own degrees, but generally cannot affiliate other colleges.',
          'Deemed to be university: an institution the central government, on the advice of UGC, has declared a university under Section 3 of the UGC Act. It awards its own degrees.',
          'Institute of National Importance: declared by an Act of Parliament, such as the IITs, NITs and AIIMS. These award their own degrees.',
        ],
      },
      { type: 'h2', text: 'Colleges: where many students actually study' },
      {
        type: 'ul',
        items: [
          "Affiliated college: teaches the program, but the affiliating university sets the syllabus, conducts the exams and awards the degree. Your degree carries the university's name.",
          'Autonomous college: still affiliated, and the degree still comes from the university, but the college sets its own syllabus and conducts its own exams.',
          'Constituent college: a college run by the university itself, usually on or near its campus.',
        ],
      },
      { type: 'h2', text: 'PGDM institutes: a diploma, not a degree' },
      {
        type: 'p',
        text: 'Many business schools are standalone institutes approved by AICTE. They award a Post Graduate Diploma in Management (PGDM) rather than an MBA degree. A PGDM from a well-regarded institute is widely accepted by employers, but check whether it has the equivalence you need if you plan to pursue a PhD or a government job that asks for a degree.',
      },
      { type: 'h2', text: 'What the labels do not tell you' },
      {
        type: 'p',
        text: 'Legal status says nothing about quality. A small affiliated college can teach better than a large private university, and the reverse is just as common. NAAC accreditation, NIRF data and what current students say are better guides to quality. The label only tells you who is responsible for your degree.',
      },
      { type: 'h2', text: 'How to check a college yourself' },
      {
        type: 'ol',
        items: [
          "Find the university on UGC's official list of universities, and check that it is not on UGC's list of fake universities.",
          'For an affiliated or autonomous college, confirm the affiliation on the university\'s own website, not just the college\'s.',
          'For engineering, management, pharmacy and similar programs, confirm the exact program is approved by the relevant regulator, such as AICTE.',
          'Check the NAAC grade and its validity date. Accreditation expires and has to be renewed.',
          'Read what current students say about how exams, results and degree certificates are actually handled.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-check-college-placement-claims',
    title: "How to Check a College's Placement Claims",
    description:
      'Highest package, average package and "100% placement" explained, and the questions and data that show what placements really look like.',
    updatedAt: '2026-10-31',
    relatedColleges: [],
    blocks: [
      {
        type: 'p',
        text: 'Placement numbers are the most advertised and least explained figures in Indian admissions. A banner with one large package says very little about what happens to a typical student. These checks help you get from the headline to the real picture.',
      },
      { type: 'h2', text: 'Why the headline numbers mislead' },
      {
        type: 'ul',
        items: [
          'The highest package describes one student, often from one branch, and is sometimes an international offer converted at a favourable exchange rate.',
          'An average can be pulled up by a few very large offers. The median, the package of the student in the middle, is far more useful.',
          '"100% placement" usually counts only students who registered for placements, and may leave out those who opted out, did not meet eligibility criteria or did not get an offer.',
          'Counting offers instead of students inflates the numbers when one student receives several offers.',
          'A CTC figure can include joining bonuses, relocation allowances, performance pay and stock options that are not part of the monthly salary.',
        ],
      },
      { type: 'h2', text: 'Questions to ask the placement cell' },
      {
        type: 'ol',
        items: [
          'How many students were in the graduating batch, how many registered for placements, and how many unique students got at least one offer?',
          'What was the median package, for my branch or specialisation specifically?',
          'Which companies hired, how many students did each hire, and for what roles?',
          'How much of the quoted CTC is fixed pay?',
          'Are internship-to-job conversions and offers from companies linked to the college included?',
          'Can I see the full placement report rather than a brochure page?',
        ],
      },
      { type: 'h2', text: 'Cross-check against NIRF data' },
      {
        type: 'p',
        text: "Colleges that take part in NIRF submit placement data for their graduating batches, including the number of students placed, the number who went on to higher studies, and the median salary. This data is published with the rankings. Compare it with the college's own claims. Large gaps between the two are worth asking about.",
      },
      { type: 'h2', text: 'Talk to the people who were placed (or were not)' },
      {
        type: 'ul',
        items: [
          "Use the Alumni tab on the college's LinkedIn page to see where recent graduates of your branch actually work.",
          'Ask final-year students how many of their classmates are still looking for a job.',
          'Read student reviews for how the placement cell treats students outside the top of the batch.',
        ],
      },
    ],
  },
  {
    slug: 'questions-to-ask-current-students',
    title: 'Questions to Ask Current Students Before You Take Admission',
    description:
      'What to ask current students about academics, attendance, hostels, safety, hidden fees and placements, and where to find students to ask.',
    updatedAt: '2026-10-31',
    relatedColleges: [],
    blocks: [
      {
        type: 'p',
        text: 'A brochure tells you what a college wants you to know. Current students can tell you what it is like to live there. Twenty minutes with two or three students is one of the most useful things you can do before you accept a seat. These questions help you use that time well.',
      },
      { type: 'h2', text: 'Academics' },
      {
        type: 'ul',
        items: [
          'How many classes are actually taught by permanent faculty?',
          'What is the attendance rule, and how strictly is it enforced?',
          'Are exams and results on time, or are there regular delays?',
          'How easy is it to change branch, pick electives or take a minor?',
        ],
      },
      { type: 'h2', text: 'Hostel, food and daily life' },
      {
        type: 'ul',
        items: [
          'Is a hostel room guaranteed for every year, and how many students share a room?',
          'How is the mess food, and can you opt out of it?',
          'What are the hostel rules on timings, visitors and leaving campus?',
          'How reliable are the water supply, electricity and internet?',
        ],
      },
      { type: 'h2', text: 'Safety and support' },
      {
        type: 'ul',
        items: [
          'Is ragging taken seriously, and what happens when someone reports it?',
          'Who do students go to with a complaint, and does anything change?',
          'Is there a counsellor or student support cell that students actually use?',
        ],
      },
      { type: 'h2', text: 'Money' },
      {
        type: 'ul',
        items: [
          'Beyond tuition, what did you pay in the first year for hostel, mess, exams, uniforms, transport and events?',
          'Did fees go up partway through the course?',
          'How long did scholarships or refunds take to arrive?',
        ],
      },
      { type: 'h2', text: 'Placements and internships' },
      {
        type: 'ul',
        items: [
          'How many students in your branch got a job or internship through the college last year?',
          'Does the placement cell help everyone, or mainly the top of the batch?',
          'Do students get time off for internships?',
        ],
      },
      { type: 'h2', text: 'The one question to end with' },
      {
        type: 'p',
        text: 'Ask: "If you were choosing again, would you pick this college?" The pause before the answer often tells you as much as the answer itself.',
      },
      { type: 'h2', text: 'Where to find students to ask' },
      {
        type: 'ul',
        items: [
          "The Alumni tab on the college's LinkedIn page, filtered by your branch and recent years.",
          'A campus visit on a working day, outside the admission office.',
          'The questions section on the college\'s page here, where current students and alumni answer applicants anonymously.',
          'Student reviews, which cover many of these questions already. Read several and look for patterns.',
        ],
      },
    ],
  },
  {
    slug: 'how-to-choose-an-engineering-branch',
    title: 'How to Choose an Engineering Branch: CSE, ECE, Mechanical and More',
    description:
      'What the main engineering branches involve, how to choose between them, and when the branch should matter more than the college.',
    updatedAt: '2026-11-17',
    relatedColleges: [],
    blocks: [
      {
        type: 'p',
        text: 'Your branch decides what you study for four years and shapes your first job. Many students pick it from cutoff ranks and what relatives say is in demand. A little time spent on what each branch actually involves makes the choice easier and much less likely to be regretted.',
      },
      { type: 'h2', text: 'What the main branches involve' },
      {
        type: 'ul',
        items: [
          'Computer Science (CSE): programming, algorithms, systems and software. Most of the work happens at a computer.',
          'Electronics and Communication (ECE): circuits, signals, communication systems and embedded hardware, with a fair amount of programming too.',
          'Electrical (EE): power systems, machines, control and electronics.',
          'Mechanical: design, manufacturing, thermodynamics and machines. A broad branch that connects to many industries.',
          'Civil: structures, construction, transport and water. Closely linked to infrastructure and government projects.',
          'Chemical: processes that turn raw materials into products, used in industries such as energy, pharmaceuticals and materials.',
          'Newer programs, such as AI and Data Science, are often specialised versions of computer science. Check how much of the curriculum overlaps with core CSE.',
        ],
      },
      { type: 'h2', text: 'Questions that help you decide' },
      {
        type: 'ol',
        items: [
          'Which school subjects did you enjoy, rather than just score well in? Physics-heavy branches feel very different from programming-heavy ones.',
          'Do you like building physical things, working with circuits, or writing code? Try a free introductory course in each before deciding.',
          'What kind of work do you picture yourself doing? Talk to two or three people working in that field.',
          'How easy is it to switch? Many students in other branches move into software through minors, electives or self-study, while moving into core engineering roles from CSE is less common.',
        ],
      },
      { type: 'h2', text: 'Branch or college?' },
      {
        type: 'p',
        text: 'The usual dilemma is a branch you want at a less famous college, against a branch you are unsure about at a better-known one. If you are confident about your interest, the branch usually matters more. If you are not, a stronger college with flexible branch-change and minor policies keeps more doors open. Check those policies for the specific college before you decide.',
      },
      { type: 'h2', text: 'Check the program, not just the branch name' },
      {
        type: 'ul',
        items: [
          'The curriculum and electives of that branch at that college',
          'The branch-wise placement report, including the median and the kinds of roles offered',
          'Labs, project work and internship opportunities',
          'What current students of that branch say in reviews',
        ],
      },
    ],
  },
  {
    slug: 'nirf-ranking-explained',
    title: 'NIRF Ranking Meaning: What It Measures and How to Use It',
    description:
      "What NIRF ranking means, what India's national ranking measures, its limits, and how to use the data colleges submit to NIRF when choosing a college.",
    updatedAt: '2026-11-24',
    relatedColleges: [],
    blocks: [
      {
        type: 'p',
        text: "The National Institutional Ranking Framework (NIRF) is the Ministry of Education's annual ranking of Indian higher education institutions. It is the most widely quoted ranking in India, and also one of the most misunderstood.",
      },
      { type: 'h2', text: 'What NIRF measures' },
      {
        type: 'p',
        text: 'NIRF scores participating institutions on five broad parameters:',
      },
      {
        type: 'ul',
        items: [
          'Teaching, learning and resources, including faculty strength and student numbers',
          'Research and professional practice, including publications and patents',
          'Graduation outcomes, including placements, higher studies and median salary',
          'Outreach and inclusivity, including regional and gender diversity',
          'Perception, based on surveys of employers, academics and others',
        ],
      },
      {
        type: 'p',
        text: 'Rankings are published separately by category, such as overall, university, engineering, management, medical and law.',
      },
      { type: 'h2', text: 'What the rank does not tell you' },
      {
        type: 'ul',
        items: [
          'Participation is voluntary, so many colleges, including some good ones, do not appear at all.',
          'Research carries a lot of weight. A research-heavy institute can outrank a college that is better at teaching undergraduates.',
          'The rank covers the whole institution, not the branch or program you will join.',
          'It says little about daily life: hostels, safety, the administration or how students are treated.',
        ],
      },
      { type: 'h2', text: 'Use the data, not just the rank' },
      {
        type: 'p',
        text: "Every participating institution's submitted data is published alongside the rankings. It is often more useful than the rank itself:",
      },
      {
        type: 'ol',
        items: [
          'Open the data sheet for each college you are considering.',
          'Compare the number of graduates placed or going to higher studies, and the median salary, for the program level you are applying to.',
          'Look at faculty numbers relative to student numbers.',
          "Cross-check these figures with the college's own placement claims. Large gaps are worth asking about.",
        ],
      },
      { type: 'h2', text: 'What to combine NIRF with' },
      {
        type: 'ul',
        items: [
          'Approval of the exact program by the relevant regulator',
          'The branch-wise placement report from the college',
          'NAAC accreditation and its validity date',
          'What current students say about teaching, hostels and the administration',
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
