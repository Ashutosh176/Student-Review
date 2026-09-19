// Production/dev seed. Creates system configuration (roles, institution
// categories) plus India's most well-known 50 universities/colleges as
// APPROVED, publicly listed institutions, each with a real admission
// process summary, accepted entrance exams, and flagship courses. No
// dummy/test user accounts, reviews, questions, or organizations are
// created — the platform admin account is provisioned separately at
// server boot by adminBootstrap.service.ts, and real students/
// organizations sign up through the normal API/UI flows.
import { PrismaClient, InstitutionType } from '@prisma/client';
import { toSlug } from '../src/utils/slug.js';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Indian Institutes of Technology', slug: 'iit' },
  { name: 'National Institutes of Technology', slug: 'nit' },
  { name: 'Indian Institutes of Information Technology', slug: 'iiit' },
  { name: 'Central Universities', slug: 'central-university' },
  { name: 'State Universities', slug: 'state-university' },
  { name: 'Deemed Universities', slug: 'deemed-university' },
  { name: 'Private Universities', slug: 'private-university' },
  { name: 'Engineering Colleges', slug: 'engineering' },
  { name: 'Management Institutes', slug: 'management' },
  { name: 'Medical Colleges', slug: 'medical' },
  { name: 'Law Schools', slug: 'law' },
];

interface SeedCourse {
  name: string;
  level: 'UG' | 'PG' | 'DOCTORATE';
  department?: string;
  durationYears?: number;
}

interface SeedInstitution {
  name: string;
  type: InstitutionType;
  categorySlug: string;
  city: string;
  state: string;
  establishedYear: number;
  website: string;
  description: string;
  entranceExams: string[];
  admissionProcess: string;
  courses: SeedCourse[];
}

const INSTITUTIONS: SeedInstitution[] = [
  // ── IITs ──────────────────────────────────────────────
  {
    name: 'Indian Institute of Technology Bombay',
    type: 'IIT',
    categorySlug: 'iit',
    city: 'Mumbai',
    state: 'Maharashtra',
    establishedYear: 1958,
    website: 'https://www.iitb.ac.in',
    description: "One of India's most selective public technical universities, widely regarded among the country's top-ranked institutions for engineering and technology.",
    entranceExams: ['JEE Advanced'],
    admissionProcess:
      'Undergraduate admission is through JEE Advanced, open only to candidates who first clear the JEE Main cutoff; seats across B.Tech and dual-degree programs are allotted by rank, category, and branch/institute preference through the centralized JoSAA counselling process. Postgraduate M.Tech admission is through GATE, MBA and other management programs have their own entrance tests, and PhD admission is by a written test and/or interview conducted by the department.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electrical Engineering', level: 'UG', department: 'Electrical Engineering', durationYears: 4 },
      { name: 'Dual Degree in Aerospace Engineering', level: 'UG', department: 'Aerospace Engineering', durationYears: 5 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'Indian Institute of Technology Delhi',
    type: 'IIT',
    categorySlug: 'iit',
    city: 'New Delhi',
    state: 'Delhi',
    establishedYear: 1961,
    website: 'https://home.iitd.ac.in',
    description: 'A premier public technical university offering undergraduate, postgraduate, and doctoral programs across engineering, sciences, and design.',
    entranceExams: ['JEE Advanced'],
    admissionProcess:
      'Undergraduate B.Tech admission is through JEE Advanced and JoSAA counselling, with seats allotted by rank and preference. Postgraduate M.Tech admission is through GATE, the MBA program admits via CAT, and doctoral admission is by department-level written test and interview.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electrical Engineering', level: 'UG', department: 'Electrical Engineering', durationYears: 4 },
      { name: 'B.Tech in Textile and Fibre Engineering', level: 'UG', department: 'Textile and Fibre Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'Indian Institute of Technology Madras',
    type: 'IIT',
    categorySlug: 'iit',
    city: 'Chennai',
    state: 'Tamil Nadu',
    establishedYear: 1959,
    website: 'https://www.iitm.ac.in',
    description: 'A leading public technical university known for its research output and consistently ranked among the top engineering institutes in India.',
    entranceExams: ['JEE Advanced'],
    admissionProcess:
      'B.Tech admission is through JEE Advanced followed by JoSAA counselling for seat allotment by rank and branch preference. The institute also runs a separately administered BS in Data Science and Applications program with online, qualifier-based admission. Postgraduate admission follows GATE (M.Tech) or CAT (MBA), with PhD admission by department interview.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Mechanical Engineering', level: 'UG', department: 'Mechanical Engineering', durationYears: 4 },
      { name: 'B.Tech in Naval Architecture and Ocean Engineering', level: 'UG', department: 'Ocean Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'Indian Institute of Technology Kanpur',
    type: 'IIT',
    categorySlug: 'iit',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    establishedYear: 1959,
    website: 'https://www.iitk.ac.in',
    description: 'A public technical university with a strong focus on core engineering, sciences, and aerospace research.',
    entranceExams: ['JEE Advanced'],
    admissionProcess:
      'B.Tech admission is through JEE Advanced and centralized JoSAA counselling. M.Tech admission is via GATE, MBA via CAT, and PhD admission through a department-conducted written test and interview.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electrical Engineering', level: 'UG', department: 'Electrical Engineering', durationYears: 4 },
      { name: 'B.Tech in Aerospace Engineering', level: 'UG', department: 'Aerospace Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'Indian Institute of Technology Kharagpur',
    type: 'IIT',
    categorySlug: 'iit',
    city: 'Kharagpur',
    state: 'West Bengal',
    establishedYear: 1951,
    website: 'https://www.iitkgp.ac.in',
    description: 'The first of the IITs, offering one of the widest ranges of undergraduate and postgraduate engineering, architecture, and management programs.',
    entranceExams: ['JEE Advanced'],
    admissionProcess:
      'B.Tech and dual-degree admission is through JEE Advanced and JoSAA counselling. The 5-year B.Arch program additionally requires an Architecture Aptitude Test score. Postgraduate admission follows GATE for M.Tech and CAT for its management programs.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electronics and Electrical Communication Engineering', level: 'UG', department: 'Electronics and Electrical Communication', durationYears: 4 },
      { name: 'B.Tech in Mining Engineering', level: 'UG', department: 'Mining Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'Indian Institute of Technology Roorkee',
    type: 'IIT',
    categorySlug: 'iit',
    city: 'Roorkee',
    state: 'Uttarakhand',
    establishedYear: 1847,
    website: 'https://www.iitr.ac.in',
    description: "One of Asia's oldest technical institutions, granted IIT status in 2001, known for civil and structural engineering.",
    entranceExams: ['JEE Advanced'],
    admissionProcess:
      'B.Tech admission is through JEE Advanced and JoSAA counselling. M.Tech admission is via GATE, with a well-known specialization in Earthquake Engineering run by its dedicated department; MBA admits via CAT and PhD via department interview.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Civil Engineering', level: 'UG', department: 'Civil Engineering', durationYears: 4 },
      { name: 'M.Tech in Earthquake Engineering', level: 'PG', department: 'Earthquake Engineering', durationYears: 2 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'Indian Institute of Technology Guwahati',
    type: 'IIT',
    categorySlug: 'iit',
    city: 'Guwahati',
    state: 'Assam',
    establishedYear: 1994,
    website: 'https://www.iitg.ac.in',
    description: "A public technical university serving as one of Northeast India's premier centers for engineering and science education.",
    entranceExams: ['JEE Advanced'],
    admissionProcess:
      'B.Tech admission is through JEE Advanced and JoSAA counselling; its Bachelor of Design (B.Des) program uses the UCEED score instead. Postgraduate admission follows GATE for M.Tech and CAT for management programs.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Mechanical Engineering', level: 'UG', department: 'Mechanical Engineering', durationYears: 4 },
      { name: 'Bachelor of Design', level: 'UG', department: 'Design', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'Indian Institute of Technology Hyderabad',
    type: 'IIT',
    categorySlug: 'iit',
    city: 'Hyderabad',
    state: 'Telangana',
    establishedYear: 2008,
    website: 'https://www.iith.ac.in',
    description: 'A newer-generation IIT known for interdisciplinary research and strong industry collaboration.',
    entranceExams: ['JEE Advanced'],
    admissionProcess:
      'B.Tech admission, including its dedicated Artificial Intelligence program, is through JEE Advanced and JoSAA counselling. Postgraduate admission follows GATE for M.Tech and CAT for management programs.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Artificial Intelligence', level: 'UG', department: 'Artificial Intelligence', durationYears: 4 },
      { name: 'B.Tech in Electrical Engineering', level: 'UG', department: 'Electrical Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'Indian Institute of Technology (BHU) Varanasi',
    type: 'IIT',
    categorySlug: 'iit',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    establishedYear: 1919,
    website: 'https://www.iitbhu.ac.in',
    description: 'Originally the Banaras Engineering College, converted to IIT status in 2012, offering engineering and technology programs within Banaras Hindu University.',
    entranceExams: ['JEE Advanced'],
    admissionProcess:
      'B.Tech admission is through JEE Advanced and JoSAA counselling, alongside the wider IIT system. Postgraduate admission follows GATE for M.Tech programs.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Ceramic Engineering', level: 'UG', department: 'Ceramic Engineering', durationYears: 4 },
      { name: 'B.Tech in Electronics Engineering', level: 'UG', department: 'Electronics Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'Indian Institute of Technology Indore',
    type: 'IIT',
    categorySlug: 'iit',
    city: 'Indore',
    state: 'Madhya Pradesh',
    establishedYear: 2009,
    website: 'https://www.iiti.ac.in',
    description: 'A newer-generation IIT offering undergraduate and postgraduate programs across engineering, sciences, and design.',
    entranceExams: ['JEE Advanced'],
    admissionProcess:
      'B.Tech admission is through JEE Advanced and JoSAA counselling. Postgraduate admission follows GATE for M.Tech and department-level tests/interviews for PhD.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electrical Engineering', level: 'UG', department: 'Electrical Engineering', durationYears: 4 },
      { name: 'B.Tech in Engineering Physics', level: 'UG', department: 'Engineering Physics', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },

  // ── NITs ──────────────────────────────────────────────
  {
    name: 'National Institute of Technology Tiruchirappalli',
    type: 'NIT',
    categorySlug: 'nit',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    establishedYear: 1964,
    website: 'https://www.nitt.edu',
    description: 'Widely regarded as the top-ranked NIT, offering undergraduate and postgraduate engineering programs.',
    entranceExams: ['JEE Main'],
    admissionProcess:
      'B.Tech admission is through JEE Main scores, with seats allotted via the centralized JoSAA counselling process (and CSAB for leftover seats). M.Tech admission is through GATE, and MBA admission follows CAT/other national management exams.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electronics and Communication Engineering', level: 'UG', department: 'Electronics and Communication Engineering', durationYears: 4 },
      { name: 'B.Tech in Mechanical Engineering', level: 'UG', department: 'Mechanical Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'National Institute of Technology Karnataka, Surathkal',
    type: 'NIT',
    categorySlug: 'nit',
    city: 'Surathkal',
    state: 'Karnataka',
    establishedYear: 1960,
    website: 'https://www.nitk.ac.in',
    description: 'A public technical university on the Karnataka coast, known for its engineering and architecture programs.',
    entranceExams: ['JEE Main'],
    admissionProcess:
      'B.Tech admission is through JEE Main and JoSAA/CSAB counselling; the B.Arch program additionally requires NATA. Postgraduate admission follows GATE for M.Tech.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electronics and Communication Engineering', level: 'UG', department: 'Electronics and Communication Engineering', durationYears: 4 },
      { name: 'B.Tech in Civil Engineering', level: 'UG', department: 'Civil Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'National Institute of Technology Warangal',
    type: 'NIT',
    categorySlug: 'nit',
    city: 'Warangal',
    state: 'Telangana',
    establishedYear: 1959,
    website: 'https://www.nitw.ac.in',
    description: 'One of the earliest Regional Engineering Colleges, upgraded to NIT status, known for civil and mechanical engineering.',
    entranceExams: ['JEE Main'],
    admissionProcess: 'B.Tech admission is through JEE Main and JoSAA/CSAB counselling. Postgraduate admission follows GATE for M.Tech and CAT for its management programs.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Civil Engineering', level: 'UG', department: 'Civil Engineering', durationYears: 4 },
      { name: 'B.Tech in Mechanical Engineering', level: 'UG', department: 'Mechanical Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'National Institute of Technology Rourkela',
    type: 'NIT',
    categorySlug: 'nit',
    city: 'Rourkela',
    state: 'Odisha',
    establishedYear: 1961,
    website: 'https://www.nitrkl.ac.in',
    description: 'A public technical university with strong ties to the metallurgical and mining industries in eastern India.',
    entranceExams: ['JEE Main'],
    admissionProcess: 'B.Tech admission is through JEE Main and JoSAA/CSAB counselling. Postgraduate admission follows GATE for M.Tech.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Metallurgical and Materials Engineering', level: 'UG', department: 'Metallurgical and Materials Engineering', durationYears: 4 },
      { name: 'B.Tech in Electronics and Communication Engineering', level: 'UG', department: 'Electronics and Communication Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'National Institute of Technology Calicut',
    type: 'NIT',
    categorySlug: 'nit',
    city: 'Kozhikode',
    state: 'Kerala',
    establishedYear: 1961,
    website: 'https://www.nitc.ac.in',
    description: 'A public technical university in Kerala offering undergraduate and postgraduate engineering and architecture programs.',
    entranceExams: ['JEE Main'],
    admissionProcess: 'B.Tech admission is through JEE Main and JoSAA/CSAB counselling; the B.Arch program additionally requires NATA. Postgraduate admission follows GATE for M.Tech.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electronics and Communication Engineering', level: 'UG', department: 'Electronics and Communication Engineering', durationYears: 4 },
      { name: 'B.Tech in Mechanical Engineering', level: 'UG', department: 'Mechanical Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },

  // ── IIITs ─────────────────────────────────────────────
  {
    name: 'International Institute of Information Technology, Hyderabad',
    type: 'IIIT',
    categorySlug: 'iiit',
    city: 'Hyderabad',
    state: 'Telangana',
    establishedYear: 1998,
    website: 'https://www.iiit.ac.in',
    description: 'A research-focused institute specializing in computer science, electronics, and information technology.',
    entranceExams: ['UGEE (IIIT Hyderabad)', 'JEE Main'],
    admissionProcess:
      "Undergraduate admission is mainly through the institute's own Undergraduate Entrance Exam (UGEE), with a portion of seats also accepting JEE Main ranks. Postgraduate M.Tech/MS admission is through GATE scores or the institute's own written test and interview.",
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electronics and Communication Engineering', level: 'UG', department: 'Electronics and Communication Engineering', durationYears: 4 },
      { name: 'Dual Degree (B.Tech + MS) in Computer Science', level: 'UG', department: 'Computer Science and Engineering', durationYears: 5 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'Indraprastha Institute of Information Technology, Delhi',
    type: 'IIIT',
    categorySlug: 'iiit',
    city: 'New Delhi',
    state: 'Delhi',
    establishedYear: 2008,
    website: 'https://www.iiitd.ac.in',
    description: 'A state university specializing in computer science, electronics, and design, backed by the Delhi government.',
    entranceExams: ['JEE Main'],
    admissionProcess: 'Undergraduate admission is through JEE Main rank via the Joint Admission Counselling (JAC) Delhi process. Postgraduate admission is through GATE scores or an institute-conducted written test and interview.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Computer Science and Artificial Intelligence', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electronics and Communication Engineering', level: 'UG', department: 'Electronics and Communication Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'International Institute of Information Technology, Bangalore',
    type: 'IIIT',
    categorySlug: 'iiit',
    city: 'Bangalore',
    state: 'Karnataka',
    establishedYear: 1999,
    website: 'https://www.iiitb.ac.in',
    description: 'A public-private institute offering graduate and postgraduate programs in information technology.',
    entranceExams: ['JEE Main', 'GATE'],
    admissionProcess:
      'Undergraduate admission is based on JEE Main rank combined with the institute\'s own selection process. Postgraduate M.Tech/MS programs, historically the institute\'s primary focus, admit mainly through GATE scores or an entrance test followed by an interview.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'M.Tech in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
      { name: 'M.Tech in Information Technology', level: 'PG', department: 'Information Technology', durationYears: 2 },
      { name: 'MS by Research in Computer Science and Engineering', level: 'PG', department: 'Computer Science and Engineering', durationYears: 2 },
    ],
  },

  // ── Management ────────────────────────────────────────
  {
    name: 'Indian Institute of Management Ahmedabad',
    type: 'MANAGEMENT_INSTITUTE',
    categorySlug: 'management',
    city: 'Ahmedabad',
    state: 'Gujarat',
    establishedYear: 1961,
    website: 'https://www.iima.ac.in',
    description: "India's most selective business school, consistently ranked as the top management institute in the country.",
    entranceExams: ['CAT'],
    admissionProcess:
      "Admission to the flagship PGP begins with a CAT percentile-based shortlist, followed by a Written Ability Test (WAT) and Personal Interview (PI); final selection weighs CAT score, academic record, work experience, and WAT-PI performance.",
    courses: [
      { name: 'Post Graduate Programme in Management (PGP)', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'PGP in Food and Agribusiness Management', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'PGP for Executives (PGPX)', level: 'PG', department: 'Management', durationYears: 1 },
      { name: 'Fellow Programme in Management', level: 'DOCTORATE', department: 'Management' },
    ],
  },
  {
    name: 'Indian Institute of Management Bangalore',
    type: 'MANAGEMENT_INSTITUTE',
    categorySlug: 'management',
    city: 'Bangalore',
    state: 'Karnataka',
    establishedYear: 1973,
    website: 'https://www.iimb.ac.in',
    description: 'A leading business school offering postgraduate and doctoral management programs.',
    entranceExams: ['CAT'],
    admissionProcess: 'Admission to the PGP is based on CAT percentile, followed by a Written Ability Test and Personal Interview; the final composite score also factors in academic record and work experience.',
    courses: [
      { name: 'Post Graduate Programme in Management (PGP)', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'Executive Post Graduate Programme (EPGP)', level: 'PG', department: 'Management', durationYears: 1 },
      { name: 'Post Graduate Programme in Enterprise Management', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'Fellow Programme in Management', level: 'DOCTORATE', department: 'Management' },
    ],
  },
  {
    name: 'Indian Institute of Management Calcutta',
    type: 'MANAGEMENT_INSTITUTE',
    categorySlug: 'management',
    city: 'Kolkata',
    state: 'West Bengal',
    establishedYear: 1961,
    website: 'https://www.iimcal.ac.in',
    description: "India's oldest IIM, offering postgraduate management and doctoral programs.",
    entranceExams: ['CAT'],
    admissionProcess: 'Admission to the PGP is based on CAT percentile, followed by a Written Ability Test and Personal Interview, with final selection weighing academic record and work experience alongside test performance.',
    courses: [
      { name: 'Post Graduate Programme in Management (PGP)', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'Post Graduate Programme for Executives (PGPEX)', level: 'PG', department: 'Management', durationYears: 1 },
      { name: 'PGDM in Business Analytics', level: 'PG', department: 'Management', durationYears: 1 },
      { name: 'Fellow Programme in Management', level: 'DOCTORATE', department: 'Management' },
    ],
  },
  {
    name: 'Indian Institute of Management Lucknow',
    type: 'MANAGEMENT_INSTITUTE',
    categorySlug: 'management',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    establishedYear: 1984,
    website: 'https://www.iiml.ac.in',
    description: 'A leading business school known for its agribusiness and general management programs.',
    entranceExams: ['CAT'],
    admissionProcess: 'Admission to the PGP is based on CAT percentile, followed by a Written Ability Test and Personal Interview.',
    courses: [
      { name: 'Post Graduate Programme in Management (PGP)', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'Post Graduate Programme in Agribusiness Management', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'Executive MBA', level: 'PG', department: 'Management', durationYears: 1 },
      { name: 'Fellow Programme in Management', level: 'DOCTORATE', department: 'Management' },
    ],
  },
  {
    name: 'Indian Institute of Management Kozhikode',
    type: 'MANAGEMENT_INSTITUTE',
    categorySlug: 'management',
    city: 'Kozhikode',
    state: 'Kerala',
    establishedYear: 1996,
    website: 'https://www.iimk.ac.in',
    description: 'A public business school offering postgraduate management programs across multiple campuses.',
    entranceExams: ['CAT'],
    admissionProcess: 'Admission to the PGP is based on CAT percentile, followed by a Written Ability Test and Personal Interview.',
    courses: [
      { name: 'Post Graduate Programme in Management (PGP)', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'Executive Post Graduate Programme in Management', level: 'PG', department: 'Management', durationYears: 1 },
      { name: 'Fellow Programme in Management', level: 'DOCTORATE', department: 'Management' },
    ],
  },
  {
    name: 'XLRI Xavier School of Management',
    type: 'MANAGEMENT_INSTITUTE',
    categorySlug: 'management',
    city: 'Jamshedpur',
    state: 'Jharkhand',
    establishedYear: 1949,
    website: 'https://www.xlri.ac.in',
    description: "One of India's oldest business schools, known for its human resource management and general management programs.",
    entranceExams: ['XAT'],
    admissionProcess: 'Admission is based on XAT score, followed by a Group Discussion/Writing round and a Personal Interview; final selection also weighs academic record and work experience.',
    courses: [
      { name: 'Business Management (BM)', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'Human Resource Management (HRM)', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'Global MBA', level: 'PG', department: 'Management', durationYears: 1 },
      { name: 'Fellow Programme in Management', level: 'DOCTORATE', department: 'Management' },
    ],
  },
  {
    name: 'Faculty of Management Studies, University of Delhi',
    type: 'MANAGEMENT_INSTITUTE',
    categorySlug: 'management',
    city: 'New Delhi',
    state: 'Delhi',
    establishedYear: 1954,
    website: 'https://fms.edu',
    description: 'A public business school under the University of Delhi, known for its low fees relative to its placement outcomes.',
    entranceExams: ['CAT'],
    admissionProcess: 'Admission is based on CAT percentile, followed by a Group Discussion and Personal Interview; as a public university department, its fees are notably lower than most other top-ranked business schools.',
    courses: [
      { name: 'MBA (Full-Time)', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'MBA (Executive)', level: 'PG', department: 'Management', durationYears: 2 },
      { name: 'PhD in Management', level: 'DOCTORATE', department: 'Management' },
    ],
  },

  // ── Medical ───────────────────────────────────────────
  {
    name: 'All India Institute of Medical Sciences, Delhi',
    type: 'MEDICAL_COLLEGE',
    categorySlug: 'medical',
    city: 'New Delhi',
    state: 'Delhi',
    establishedYear: 1956,
    website: 'https://www.aiims.edu',
    description: "India's premier public medical college and hospital, and the flagship of the AIIMS institution network.",
    entranceExams: ['NEET-UG', 'INI-CET'],
    admissionProcess:
      'MBBS admission is through NEET-UG all-India rank and centralized counselling conducted by the Medical Counselling Committee (MCC). Postgraduate MD/MS/DM/MCh seats are admitted through INI-CET, a joint entrance exam shared across AIIMS and other Institutes of National Importance.',
    courses: [
      { name: 'MBBS', level: 'UG', department: 'Medicine', durationYears: 5.5 },
      { name: 'B.Sc. (Hons.) Nursing', level: 'UG', department: 'Nursing', durationYears: 4 },
      { name: 'MD in General Medicine', level: 'PG', department: 'Medicine', durationYears: 3 },
      { name: 'MS in General Surgery', level: 'PG', department: 'Surgery', durationYears: 3 },
    ],
  },
  {
    name: 'Christian Medical College, Vellore',
    type: 'MEDICAL_COLLEGE',
    categorySlug: 'medical',
    city: 'Vellore',
    state: 'Tamil Nadu',
    establishedYear: 1900,
    website: 'https://www.cmch-vellore.edu',
    description: 'A private Christian minority medical college and hospital with a long-standing reputation for medical education and patient care.',
    entranceExams: ['NEET-UG'],
    admissionProcess:
      "All candidates must clear NEET-UG; a portion of seats are reserved under CMC's affiliation with its sponsoring church councils and mission hospitals, while the remainder are filled through an open merit list combined with the college's own selection criteria.",
    courses: [
      { name: 'MBBS', level: 'UG', department: 'Medicine', durationYears: 5.5 },
      { name: 'B.Sc. Nursing', level: 'UG', department: 'Nursing', durationYears: 4 },
      { name: 'Allied Health Sciences (various)', level: 'UG', department: 'Allied Health Sciences', durationYears: 3.5 },
      { name: 'MD/MS (various specialities)', level: 'PG', department: 'Medicine' },
    ],
  },
  {
    name: 'Armed Forces Medical College, Pune',
    type: 'MEDICAL_COLLEGE',
    categorySlug: 'medical',
    city: 'Pune',
    state: 'Maharashtra',
    establishedYear: 1948,
    website: 'https://afmc.nic.in',
    description: 'A medical college run by the Indian Armed Forces, training doctors for both military and civilian medical service.',
    entranceExams: ['NEET-UG'],
    admissionProcess:
      "Candidates must first clear NEET-UG, after which AFMC conducts its own selection process, including a written test, interview, and medical/physical fitness assessment. MBBS graduates are bonded to serve as commissioned medical officers in the Armed Forces after completing their degree.",
    courses: [
      { name: 'MBBS', level: 'UG', department: 'Medicine', durationYears: 5.5 },
      { name: 'B.Sc. Nursing', level: 'UG', department: 'Nursing', durationYears: 4 },
      { name: 'MD/MS (various specialities)', level: 'PG', department: 'Medicine' },
    ],
  },
  {
    name: 'Jawaharlal Institute of Postgraduate Medical Education and Research',
    type: 'MEDICAL_COLLEGE',
    categorySlug: 'medical',
    city: 'Puducherry',
    state: 'Puducherry',
    establishedYear: 1964,
    website: 'https://www.jipmer.edu.in',
    description: 'A central government medical college and hospital offering undergraduate and postgraduate medical education.',
    entranceExams: ['NEET-UG'],
    admissionProcess:
      'MBBS and postgraduate medical admissions are through NEET-UG/NEET-PG all-India counselling; JIPMER previously ran its own separate entrance exam, which was discontinued and folded into the national NEET process from 2020 onward.',
    courses: [
      { name: 'MBBS', level: 'UG', department: 'Medicine', durationYears: 5.5 },
      { name: 'B.Sc. Nursing', level: 'UG', department: 'Nursing', durationYears: 4 },
      { name: 'MD/MS (various specialities)', level: 'PG', department: 'Medicine' },
      { name: 'PhD in Biomedical Sciences', level: 'DOCTORATE', department: 'Biomedical Sciences' },
    ],
  },
  {
    name: 'Maulana Azad Medical College',
    type: 'MEDICAL_COLLEGE',
    categorySlug: 'medical',
    city: 'New Delhi',
    state: 'Delhi',
    establishedYear: 1958,
    website: 'https://www.mamc.ac.in',
    description: 'A public medical college in Delhi affiliated with several major government hospitals.',
    entranceExams: ['NEET-UG'],
    admissionProcess:
      'MBBS admission is through NEET-UG all-India rank via the Delhi-specific counselling process conducted by the Directorate General of Health Services (DGHS) for Delhi government medical colleges.',
    courses: [
      { name: 'MBBS', level: 'UG', department: 'Medicine', durationYears: 5.5 },
      { name: 'MD/MS (various specialities)', level: 'PG', department: 'Medicine' },
      { name: 'Diploma courses (various specialities)', level: 'PG', department: 'Medicine' },
    ],
  },

  // ── Law ───────────────────────────────────────────────
  {
    name: 'National Law School of India University',
    type: 'LAW_SCHOOL',
    categorySlug: 'law',
    city: 'Bangalore',
    state: 'Karnataka',
    establishedYear: 1987,
    website: 'https://www.nls.ac.in',
    description: "India's first National Law University and consistently its top-ranked law school.",
    entranceExams: ['CLAT'],
    admissionProcess:
      "Undergraduate admission to the five-year BA LLB (Hons.) is through the Common Law Admission Test (CLAT), a national entrance exam shared across the National Law Universities, with seats allotted by rank and category through centralized counselling.",
    courses: [
      { name: 'BA LLB (Hons.)', level: 'UG', department: 'Law', durationYears: 5 },
      { name: 'LLM', level: 'PG', department: 'Law', durationYears: 1 },
      { name: 'PhD in Law', level: 'DOCTORATE', department: 'Law' },
    ],
  },
  {
    name: 'NALSAR University of Law',
    type: 'LAW_SCHOOL',
    categorySlug: 'law',
    city: 'Hyderabad',
    state: 'Telangana',
    establishedYear: 1998,
    website: 'https://www.nalsar.ac.in',
    description: 'A leading National Law University offering an integrated undergraduate law degree and postgraduate programs.',
    entranceExams: ['CLAT'],
    admissionProcess: 'Undergraduate admission to its integrated law degrees is through CLAT, with seats allotted by rank and category through centralized counselling.',
    courses: [
      { name: 'BA LLB (Hons.)', level: 'UG', department: 'Law', durationYears: 5 },
      { name: 'BBA LLB (Hons.)', level: 'UG', department: 'Law', durationYears: 5 },
      { name: 'LLM', level: 'PG', department: 'Law', durationYears: 1 },
    ],
  },
  {
    name: 'National Law University, Delhi',
    type: 'LAW_SCHOOL',
    categorySlug: 'law',
    city: 'New Delhi',
    state: 'Delhi',
    establishedYear: 2008,
    website: 'https://nludelhi.ac.in',
    description: 'A National Law University known for its clinical legal education and moot court program.',
    entranceExams: ['AILET'],
    admissionProcess: "NLU Delhi conducts its own entrance exam, AILET (All India Law Entrance Test), independent of CLAT, for admission to its undergraduate and postgraduate law programs.",
    courses: [
      { name: 'BA LLB (Hons.)', level: 'UG', department: 'Law', durationYears: 5 },
      { name: 'LLM', level: 'PG', department: 'Law', durationYears: 1 },
      { name: 'PhD in Law', level: 'DOCTORATE', department: 'Law' },
    ],
  },
  {
    name: 'Symbiosis Law School, Pune',
    type: 'LAW_SCHOOL',
    categorySlug: 'law',
    city: 'Pune',
    state: 'Maharashtra',
    establishedYear: 1977,
    website: 'https://www.symlaw.ac.in',
    description: 'A private law school under Symbiosis International, offering integrated undergraduate and postgraduate law degrees.',
    entranceExams: ['SLAT'],
    admissionProcess: 'Admission is through SLAT (Symbiosis Law Admission Test) followed by a Personal Interaction/Writing Ability Test round.',
    courses: [
      { name: 'BA LLB', level: 'UG', department: 'Law', durationYears: 5 },
      { name: 'BBA LLB', level: 'UG', department: 'Law', durationYears: 5 },
      { name: 'LLM', level: 'PG', department: 'Law', durationYears: 1 },
    ],
  },

  // ── Central universities ──────────────────────────────
  {
    name: 'University of Delhi',
    type: 'STATE_UNIVERSITY',
    categorySlug: 'central-university',
    city: 'New Delhi',
    state: 'Delhi',
    establishedYear: 1922,
    website: 'https://www.du.ac.in',
    description: "One of India's largest central universities, comprising dozens of affiliated colleges across the humanities, sciences, and commerce.",
    entranceExams: ['CUET-UG'],
    admissionProcess:
      "Since 2022, undergraduate admission to most programs across its affiliated colleges is through CUET-UG scores followed by a centralized seat-allocation process; a small number of programs (sports, extracurricular-activity quotas) have supplementary trial-based criteria.",
    courses: [
      { name: 'BA (Hons.) Economics', level: 'UG', department: 'Economics', durationYears: 3 },
      { name: 'B.Com (Hons.)', level: 'UG', department: 'Commerce', durationYears: 3 },
      { name: 'BSc (Hons.) Computer Science', level: 'UG', department: 'Computer Science', durationYears: 3 },
      { name: 'MA in various Social Sciences', level: 'PG', department: 'Social Sciences', durationYears: 2 },
    ],
  },
  {
    name: 'Jawaharlal Nehru University',
    type: 'STATE_UNIVERSITY',
    categorySlug: 'central-university',
    city: 'New Delhi',
    state: 'Delhi',
    establishedYear: 1969,
    website: 'https://www.jnu.ac.in',
    description: 'A central university known for its graduate and postgraduate programs in the social sciences, languages, and international studies.',
    entranceExams: ['CUET-UG', 'CUET-PG'],
    admissionProcess: "Undergraduate and postgraduate admissions are through CUET-UG/CUET-PG scores, followed by JNU's own merit list, and for research (MPhil/PhD) programs, a viva-voce.",
    courses: [
      { name: 'BA (Hons.) in Foreign Languages', level: 'UG', department: 'Languages', durationYears: 3 },
      { name: 'MA in International Relations', level: 'PG', department: 'International Studies', durationYears: 2 },
      { name: 'MPhil/PhD in Social Sciences', level: 'DOCTORATE', department: 'Social Sciences' },
    ],
  },
  {
    name: 'Banaras Hindu University',
    type: 'STATE_UNIVERSITY',
    categorySlug: 'central-university',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    establishedYear: 1916,
    website: 'https://www.bhu.ac.in',
    description: "One of Asia's largest residential central universities, offering programs across arts, sciences, engineering, and medicine.",
    entranceExams: ['CUET-UG'],
    admissionProcess:
      "Most undergraduate admissions are through CUET-UG scores; professional programs run within the university, such as engineering (IIT-BHU) and medicine, are admitted separately through their respective national entrance exams (JEE Advanced and NEET-UG).",
    courses: [
      { name: 'BA (Hons.) Sanskrit', level: 'UG', department: 'Sanskrit Studies', durationYears: 3 },
      { name: 'BSc (Hons.) various', level: 'UG', department: 'Sciences', durationYears: 3 },
      { name: 'MA in various disciplines', level: 'PG', department: 'Humanities', durationYears: 2 },
    ],
  },
  {
    name: 'Jamia Millia Islamia',
    type: 'STATE_UNIVERSITY',
    categorySlug: 'central-university',
    city: 'New Delhi',
    state: 'Delhi',
    establishedYear: 1920,
    website: 'https://www.jmi.ac.in',
    description: 'A central university offering undergraduate and postgraduate programs across engineering, humanities, and mass communication.',
    entranceExams: ['CUET-UG', 'JMI Entrance Test'],
    admissionProcess: "Undergraduate admission is largely through CUET-UG scores, though select professional programs (engineering, mass communication, architecture) retain Jamia's own entrance test.",
    courses: [
      { name: 'B.Tech (various branches)', level: 'UG', department: 'Engineering', durationYears: 4 },
      { name: 'BA (Hons.) Mass Communication', level: 'UG', department: 'Mass Communication', durationYears: 3 },
      { name: 'BA LLB', level: 'UG', department: 'Law', durationYears: 5 },
    ],
  },
  {
    name: 'Aligarh Muslim University',
    type: 'STATE_UNIVERSITY',
    categorySlug: 'central-university',
    city: 'Aligarh',
    state: 'Uttar Pradesh',
    establishedYear: 1920,
    website: 'https://www.amu.ac.in',
    description: 'A central university with a large residential campus, offering programs across engineering, medicine, law, and the humanities.',
    entranceExams: ['AMU Entrance Test', 'CUET-UG'],
    admissionProcess: "AMU conducts its own entrance tests for many undergraduate and professional programs, alongside CUET-UG-based admission for select courses.",
    courses: [
      { name: 'B.Tech (various branches)', level: 'UG', department: 'Engineering', durationYears: 4 },
      { name: 'MBBS', level: 'UG', department: 'Medicine', durationYears: 5.5 },
      { name: 'BA (Hons.) various', level: 'UG', department: 'Humanities', durationYears: 3 },
      { name: 'LLB', level: 'UG', department: 'Law', durationYears: 3 },
    ],
  },
  {
    name: 'University of Hyderabad',
    type: 'STATE_UNIVERSITY',
    categorySlug: 'central-university',
    city: 'Hyderabad',
    state: 'Telangana',
    establishedYear: 1974,
    website: 'https://uohyd.ac.in',
    description: 'A central university known for its postgraduate and doctoral research programs in the sciences and humanities.',
    entranceExams: ['CUET-PG', 'CUET-UG'],
    admissionProcess: "Postgraduate and integrated master's programs are primarily admitted via CUET-PG (and CUET-UG for a few integrated 5-year programs), followed by the university's own merit process.",
    courses: [
      { name: 'Integrated MA in Economics', level: 'PG', department: 'Economics', durationYears: 5 },
      { name: 'MSc in various Sciences', level: 'PG', department: 'Sciences', durationYears: 2 },
      { name: 'PhD in various disciplines', level: 'DOCTORATE', department: 'Various' },
    ],
  },

  // ── State universities ────────────────────────────────
  {
    name: 'University of Calcutta',
    type: 'STATE_UNIVERSITY',
    categorySlug: 'state-university',
    city: 'Kolkata',
    state: 'West Bengal',
    establishedYear: 1857,
    website: 'https://www.caluniv.ac.in',
    description: 'One of the oldest and largest state universities in India, with a wide network of affiliated colleges.',
    entranceExams: [],
    admissionProcess:
      'Undergraduate admission to most of its affiliated colleges is merit-based on Class 12 board exam marks, with the university itself conducting entrance tests for select postgraduate and professional programs.',
    courses: [
      { name: 'BA (Hons.) various', level: 'UG', department: 'Arts', durationYears: 3 },
      { name: 'BSc (Hons.) various', level: 'UG', department: 'Sciences', durationYears: 3 },
      { name: 'B.Com (Hons.)', level: 'UG', department: 'Commerce', durationYears: 3 },
    ],
  },
  {
    name: 'University of Mumbai',
    type: 'STATE_UNIVERSITY',
    categorySlug: 'state-university',
    city: 'Mumbai',
    state: 'Maharashtra',
    establishedYear: 1857,
    website: 'https://mu.ac.in',
    description: 'One of the oldest state universities in India, with a large network of affiliated colleges across Mumbai.',
    entranceExams: [],
    admissionProcess:
      "Undergraduate admission to its affiliated colleges is largely merit-based on Class 12 marks, coordinated through a centralized online admission process (CAP) for many programs; select postgraduate and professional courses require entrance tests.",
    courses: [
      { name: 'BA various', level: 'UG', department: 'Arts', durationYears: 3 },
      { name: 'BSc various', level: 'UG', department: 'Sciences', durationYears: 3 },
      { name: 'B.Com', level: 'UG', department: 'Commerce', durationYears: 3 },
    ],
  },
  {
    name: 'Anna University',
    type: 'STATE_UNIVERSITY',
    categorySlug: 'state-university',
    city: 'Chennai',
    state: 'Tamil Nadu',
    establishedYear: 1978,
    website: 'https://www.annauniv.edu',
    description: "Tamil Nadu's primary technical state university, overseeing engineering education across hundreds of affiliated colleges.",
    entranceExams: ['TNEA'],
    admissionProcess:
      'Undergraduate engineering admission across Anna University and its affiliated colleges is through TNEA (Tamil Nadu Engineering Admissions), based on Class 12 marks and centralized counselling; postgraduate admission is through TANCET.',
    courses: [
      { name: 'BE in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'BE in Electronics and Communication Engineering', level: 'UG', department: 'Electronics and Communication Engineering', durationYears: 4 },
      { name: 'BE in Mechanical Engineering', level: 'UG', department: 'Mechanical Engineering', durationYears: 4 },
      { name: 'ME (various specializations)', level: 'PG', department: 'Engineering', durationYears: 2 },
    ],
  },

  // ── Deemed universities ───────────────────────────────
  {
    name: 'Birla Institute of Technology and Science, Pilani',
    type: 'DEEMED_UNIVERSITY',
    categorySlug: 'deemed-university',
    city: 'Pilani',
    state: 'Rajasthan',
    establishedYear: 1964,
    website: 'https://www.bits-pilani.ac.in',
    description: "One of India's top private deemed universities for engineering and sciences, admitting students through its own entrance exam.",
    entranceExams: ['BITSAT'],
    admissionProcess:
      "Admission to its integrated first-degree programs is through BITSAT, BITS Pilani's own computer-based entrance test, followed by a centralized campus and branch allocation process based on score and preference.",
    courses: [
      { name: 'B.E. Computer Science', level: 'UG', department: 'Computer Science', durationYears: 4 },
      { name: 'B.E. Electronics and Instrumentation', level: 'UG', department: 'Electronics and Instrumentation', durationYears: 4 },
      { name: 'M.Sc. Economics (dual degree)', level: 'UG', department: 'Economics', durationYears: 4 },
      { name: 'MBA', level: 'PG', department: 'Management', durationYears: 2 },
    ],
  },
  {
    name: 'Manipal Academy of Higher Education',
    type: 'DEEMED_UNIVERSITY',
    categorySlug: 'deemed-university',
    city: 'Manipal',
    state: 'Karnataka',
    establishedYear: 1953,
    website: 'https://manipal.edu',
    description: 'A large deemed university offering programs across medicine, engineering, and management.',
    entranceExams: ['MET', 'NEET-UG'],
    admissionProcess:
      "Engineering admission is through MET (Manipal Entrance Test), the university's own computer-based exam; medical admission is through NEET-UG; management and other programs use their own merit- or test-based selection.",
    courses: [
      { name: 'B.Tech in Computer Science', level: 'UG', department: 'Computer Science', durationYears: 4 },
      { name: 'B.Tech in Information Technology', level: 'UG', department: 'Information Technology', durationYears: 4 },
      { name: 'MBBS', level: 'UG', department: 'Medicine', durationYears: 5.5 },
      { name: 'MBA', level: 'PG', department: 'Management', durationYears: 2 },
    ],
  },
  {
    name: 'Vellore Institute of Technology',
    type: 'DEEMED_UNIVERSITY',
    categorySlug: 'deemed-university',
    city: 'Vellore',
    state: 'Tamil Nadu',
    establishedYear: 1984,
    website: 'https://vit.ac.in',
    description: 'A private deemed university known for its engineering programs and its own national entrance exam.',
    entranceExams: ['VITEEE'],
    admissionProcess: "Undergraduate engineering admission is through VITEEE, VIT's own computer-based entrance exam, followed by a counselling and branch-allocation process.",
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electronics and Communication Engineering', level: 'UG', department: 'Electronics and Communication Engineering', durationYears: 4 },
      { name: 'B.Tech in Mechanical Engineering', level: 'UG', department: 'Mechanical Engineering', durationYears: 4 },
      { name: 'M.Tech (various specializations)', level: 'PG', department: 'Engineering', durationYears: 2 },
    ],
  },
  {
    name: 'SRM Institute of Science and Technology',
    type: 'DEEMED_UNIVERSITY',
    categorySlug: 'deemed-university',
    city: 'Kattankulathur',
    state: 'Tamil Nadu',
    establishedYear: 1985,
    website: 'https://www.srmist.edu.in',
    description: 'A private deemed university offering engineering, medicine, and management programs across multiple campuses.',
    entranceExams: ['SRMJEEE', 'NEET-UG'],
    admissionProcess: "Undergraduate engineering admission is through SRMJEEE, SRM's own entrance exam, while its medical programs admit through NEET-UG.",
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'B.Tech in Electronics and Communication Engineering', level: 'UG', department: 'Electronics and Communication Engineering', durationYears: 4 },
      { name: 'MBBS', level: 'UG', department: 'Medicine', durationYears: 5.5 },
      { name: 'MBA', level: 'PG', department: 'Management', durationYears: 2 },
    ],
  },

  // ── Private universities ──────────────────────────────
  {
    name: 'Amity University',
    type: 'PRIVATE_UNIVERSITY',
    categorySlug: 'private-university',
    city: 'Noida',
    state: 'Uttar Pradesh',
    establishedYear: 2005,
    website: 'https://www.amity.edu',
    description: "One of India's largest private university groups, with campuses across multiple states and disciplines.",
    entranceExams: ['Amity JEE'],
    admissionProcess:
      "Admission to most programs is through Amity's own entrance test and interview, or a merit-based review of academic records; JEE Main/NEET scores are accepted for some professional courses.",
    courses: [
      { name: 'B.Tech in Computer Science', level: 'UG', department: 'Computer Science', durationYears: 4 },
      { name: 'BBA', level: 'UG', department: 'Business Administration', durationYears: 3 },
      { name: 'BA LLB', level: 'UG', department: 'Law', durationYears: 5 },
      { name: 'MBA', level: 'PG', department: 'Management', durationYears: 2 },
    ],
  },
  {
    name: 'Shiv Nadar University',
    type: 'PRIVATE_UNIVERSITY',
    categorySlug: 'private-university',
    city: 'Greater Noida',
    state: 'Uttar Pradesh',
    establishedYear: 2011,
    website: 'https://snu.edu.in',
    description: 'A private research university offering undergraduate and postgraduate programs across engineering, sciences, and the humanities.',
    entranceExams: ['SNUSAT'],
    admissionProcess: 'Admission is through SNUSAT (Shiv Nadar University Selection Aptitude Test) or accepted scores from exams such as JEE Main/SAT, combined with a review of academic record.',
    courses: [
      { name: 'B.Tech in Computer Science and Engineering', level: 'UG', department: 'Computer Science and Engineering', durationYears: 4 },
      { name: 'BSc (Research) Economics', level: 'UG', department: 'Economics', durationYears: 3 },
      { name: 'BA (Research) various', level: 'UG', department: 'Humanities', durationYears: 3 },
    ],
  },
  {
    name: 'Ashoka University',
    type: 'PRIVATE_UNIVERSITY',
    categorySlug: 'private-university',
    city: 'Sonipat',
    state: 'Haryana',
    establishedYear: 2014,
    website: 'https://www.ashoka.edu.in',
    description: 'A private liberal arts university known for its undergraduate interdisciplinary programs.',
    entranceExams: ['Ashoka Aptitude Test (AAT)'],
    admissionProcess:
      'Admission follows a holistic, liberal-arts style process combining the Ashoka Aptitude Test (or accepted standardized scores such as SAT/ACT), academic record, personal essays, and an interview.',
    courses: [
      { name: 'BA (Hons.) Economics', level: 'UG', department: 'Economics', durationYears: 3 },
      { name: 'BA (Hons.) Political Science', level: 'UG', department: 'Political Science', durationYears: 3 },
      { name: 'BSc (Hons.) various', level: 'UG', department: 'Sciences', durationYears: 3 },
      { name: 'Young India Fellowship', level: 'PG', department: 'Interdisciplinary Studies', durationYears: 1 },
    ],
  },
];

async function main() {
  console.log('Seeding roles...');
  const roleNames = ['STUDENT', 'ORGANIZATION', 'MODERATOR', 'ADMIN'] as const;
  await Promise.all(roleNames.map((name) => prisma.role.upsert({ where: { name }, create: { name }, update: {} })));

  console.log('Seeding institution categories...');
  await Promise.all(CATEGORIES.map((c) => prisma.institutionCategory.upsert({ where: { slug: c.slug }, create: c, update: {} })));
  const categories = await prisma.institutionCategory.findMany();
  const categoryIdBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  console.log(`Seeding ${INSTITUTIONS.length} well-known Indian institutions (with admission process and courses)...`);
  for (const inst of INSTITUTIONS) {
    const slug = toSlug(inst.name);
    const categoryId = categoryIdBySlug.get(inst.categorySlug);
    if (!categoryId) throw new Error(`Unknown category slug "${inst.categorySlug}" for institution "${inst.name}"`);

    const existing = await prisma.institution.findUnique({ where: { slug }, select: { id: true } });
    const baseData = {
      name: inst.name,
      type: inst.type,
      categoryId,
      establishedYear: inst.establishedYear,
      website: inst.website,
      description: inst.description,
      entranceExams: inst.entranceExams,
      admissionProcess: inst.admissionProcess,
      status: 'APPROVED' as const,
      verified: true,
    };

    const institutionId = existing
      ? (await prisma.institution.update({ where: { slug }, data: baseData })).id
      : (
          await prisma.institution.create({
            data: { ...baseData, slug, locations: { create: { city: inst.city, state: inst.state, isPrimary: true } } },
          })
        ).id;

    // Curated seed courses are fully owned by this script — replace rather
    // than merge so re-running it always reflects the list above exactly.
    await prisma.course.deleteMany({ where: { institutionId } });
    await prisma.course.createMany({
      data: inst.courses.map((c) => ({
        institutionId,
        name: c.name,
        level: c.level,
        department: c.department,
        durationYears: c.durationYears,
      })),
    });
  }

  console.log('\nSeed complete: roles, institution categories, and 50 real institutions (with admission process + courses) are in place.');
  console.log('No dummy/test user accounts were created — the platform admin account is bootstrapped separately at server boot.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
