// Adds 100 more well-known Indian institutions on top of prisma/seed.ts.
// Additive and idempotent: an institution whose slug already exists is left
// untouched (nothing is updated or deleted), so it is safe to re-run and never
// overwrites edits made by admins/organizations. Listings follow the same
// conventions as seed.ts (APPROVED, listed with a primary location, courses,
// entrance exams and an admission summary). No users/reviews are created.
import { PrismaClient, InstitutionType } from '@prisma/client';
import { toSlug } from '../src/utils/slug.js';

const prisma = new PrismaClient();

type Kind = 'iit' | 'nit' | 'iiit' | 'eng' | 'iim' | 'mgmt' | 'med' | 'law' | 'arts';
type Course = { name: string; level: 'UG' | 'PG' | 'DOCTORATE'; department?: string; durationYears?: number };

const NEW_CATEGORIES = [{ name: 'Arts, Science & Commerce Colleges', slug: 'arts-science' }];

const c = (name: string, level: Course['level'], durationYears?: number, department?: string): Course => ({ name, level, durationYears, department });

const ENG_COURSES = [
  c('B.Tech in Computer Science and Engineering', 'UG', 4, 'Computer Science and Engineering'),
  c('B.Tech in Electrical Engineering', 'UG', 4, 'Electrical Engineering'),
  c('B.Tech in Mechanical Engineering', 'UG', 4, 'Mechanical Engineering'),
  c('M.Tech in Computer Science and Engineering', 'PG', 2, 'Computer Science and Engineering'),
];
const IIIT_COURSES = [
  c('B.Tech in Computer Science and Engineering', 'UG', 4, 'Computer Science and Engineering'),
  c('B.Tech in Electronics and Communication Engineering', 'UG', 4, 'Electronics and Communication Engineering'),
  c('M.Tech in Computer Science and Engineering', 'PG', 2, 'Computer Science and Engineering'),
];
const IIM_COURSES = [
  c('Post Graduate Programme in Management (MBA equivalent)', 'PG', 2, 'Management'),
  c('Fellow Programme in Management (PhD equivalent)', 'DOCTORATE', 4, 'Management'),
];
const MGMT_COURSES = [c('MBA / PGDM (flagship two-year programme)', 'PG', 2, 'Management')];
const MED_COURSES = [
  c('MBBS', 'UG', 5.5, 'Medicine'),
  c('MD (various specialisations)', 'PG', 3, 'Medicine'),
  c('MS (various specialisations)', 'PG', 3, 'Surgery'),
];
const LAW_COURSES = [
  c('BA LLB (Hons.)', 'UG', 5, 'Law'),
  c('LLM', 'PG', 1, 'Law'),
  c('PhD in Law', 'DOCTORATE', 3, 'Law'),
];
const ARTS_COURSES = [
  c('BA (Hons.) in various disciplines', 'UG', 3, 'Humanities and Social Sciences'),
  c('BSc (Hons.) in various disciplines', 'UG', 3, 'Sciences'),
  c('Postgraduate programmes in various disciplines', 'PG', 2),
];

const TYPE_BY_KIND: Record<Kind, InstitutionType> = {
  iit: 'IIT',
  nit: 'NIT',
  iiit: 'IIIT',
  eng: 'ENGINEERING_COLLEGE',
  iim: 'MANAGEMENT_INSTITUTE',
  mgmt: 'MANAGEMENT_INSTITUTE',
  med: 'MEDICAL_COLLEGE',
  law: 'LAW_SCHOOL',
  arts: 'ARTS_SCIENCE_COLLEGE',
};
const CATEGORY_BY_KIND: Record<Kind, string> = {
  iit: 'iit',
  nit: 'nit',
  iiit: 'iiit',
  eng: 'engineering',
  iim: 'management',
  mgmt: 'management',
  med: 'medical',
  law: 'law',
  arts: 'arts-science',
};
const COURSES_BY_KIND: Record<Kind, Course[]> = {
  iit: ENG_COURSES,
  nit: ENG_COURSES,
  iiit: IIIT_COURSES,
  eng: ENG_COURSES,
  iim: IIM_COURSES,
  mgmt: MGMT_COURSES,
  med: MED_COURSES,
  law: LAW_COURSES,
  arts: ARTS_COURSES,
};

// Cautious, non-numeric wording: exact cutoffs and dates change every year,
// so we point students to the official site rather than state figures.
function admissionText(kind: Kind, exams: string[]): string {
  const list = exams.join(', ');
  const base: Record<Kind, string> = {
    iit: `Undergraduate admission is through ${list} followed by JoSAA counselling, with seats allotted by rank, category and branch preference. Postgraduate admission is generally through GATE, and doctoral admission through a department-level test and interview.`,
    nit: `Undergraduate B.Tech admission is through ${list} followed by JoSAA counselling, with seats split between home-state and other-state quotas. Postgraduate M.Tech admission is generally through GATE (CCMT counselling).`,
    iiit: `Undergraduate admission is through ${list} followed by JoSAA/CSAB counselling. Postgraduate admission is generally through GATE or an institute-level test and interview.`,
    eng: `Admission is based on ${list}, followed by counselling or merit-based seat allotment as per the institution's policy. Postgraduate admission is generally through GATE or an institute-level test.`,
    iim: `Admission to the flagship programme is through ${list}, followed by a written ability test, group discussion and personal interview, with weightage for academics and work experience. Doctoral admission uses CAT/GMAT/GRE scores plus interviews.`,
    mgmt: `Admission is based on ${list}, followed by shortlisting, group discussion/written ability test and a personal interview as per the institute's process.`,
    med: `Admission is through ${list}, with seats allotted via the applicable central or state counselling process based on rank and category.`,
    law: `Admission is through ${list}, with seats allotted by merit rank and category through the university's counselling process.`,
    arts: `Admission is through ${list}, as per the admission policy of the institution for each programme.`,
  };
  return `${base[kind]} Check the official website for current eligibility, dates and cutoffs.`;
}

// name, kind, city, state, established, website, exams, [custom courses], [description]
type Row = [string, Kind, string, string, number, string, string[], Course[]?, string?];

const ROWS: Row[] = [
  // ── IITs ──
  ['Indian Institute of Technology Ropar', 'iit', 'Rupnagar', 'Punjab', 2008, 'https://www.iitrpr.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology Bhubaneswar', 'iit', 'Bhubaneswar', 'Odisha', 2008, 'https://www.iitbbs.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology Gandhinagar', 'iit', 'Gandhinagar', 'Gujarat', 2008, 'https://iitgn.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology Jodhpur', 'iit', 'Jodhpur', 'Rajasthan', 2008, 'https://iitj.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology Patna', 'iit', 'Patna', 'Bihar', 2008, 'https://www.iitp.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology Mandi', 'iit', 'Mandi', 'Himachal Pradesh', 2009, 'https://www.iitmandi.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology (ISM) Dhanbad', 'iit', 'Dhanbad', 'Jharkhand', 1926, 'https://www.iitism.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology Tirupati', 'iit', 'Tirupati', 'Andhra Pradesh', 2015, 'https://www.iittp.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology Palakkad', 'iit', 'Palakkad', 'Kerala', 2015, 'https://iitpkd.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology Bhilai', 'iit', 'Raipur', 'Chhattisgarh', 2016, 'https://www.iitbhilai.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology Goa', 'iit', 'Farmagudi', 'Goa', 2016, 'https://www.iitgoa.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology Jammu', 'iit', 'Jammu', 'Jammu and Kashmir', 2016, 'https://www.iitjammu.ac.in', ['JEE Advanced']],
  ['Indian Institute of Technology Dharwad', 'iit', 'Dharwad', 'Karnataka', 2016, 'https://www.iitdh.ac.in', ['JEE Advanced']],

  // ── NITs ──
  ['Sardar Vallabhbhai National Institute of Technology, Surat', 'nit', 'Surat', 'Gujarat', 1961, 'https://www.svnit.ac.in', ['JEE Main']],
  ['National Institute of Technology Durgapur', 'nit', 'Durgapur', 'West Bengal', 1960, 'https://nitdgp.ac.in', ['JEE Main']],
  ['Motilal Nehru National Institute of Technology Allahabad', 'nit', 'Prayagraj', 'Uttar Pradesh', 1961, 'https://www.mnnit.ac.in', ['JEE Main']],
  ['National Institute of Technology Kurukshetra', 'nit', 'Kurukshetra', 'Haryana', 1963, 'https://nitkkr.ac.in', ['JEE Main']],
  ['Malaviya National Institute of Technology Jaipur', 'nit', 'Jaipur', 'Rajasthan', 1963, 'https://www.mnit.ac.in', ['JEE Main']],
  ['Maulana Azad National Institute of Technology Bhopal', 'nit', 'Bhopal', 'Madhya Pradesh', 1960, 'https://www.manit.ac.in', ['JEE Main']],
  ['Visvesvaraya National Institute of Technology Nagpur', 'nit', 'Nagpur', 'Maharashtra', 1960, 'https://vnit.ac.in', ['JEE Main']],
  ['National Institute of Technology Silchar', 'nit', 'Silchar', 'Assam', 1967, 'https://www.nits.ac.in', ['JEE Main']],
  ['Dr. B. R. Ambedkar National Institute of Technology Jalandhar', 'nit', 'Jalandhar', 'Punjab', 1987, 'https://www.nitj.ac.in', ['JEE Main']],
  ['National Institute of Technology Hamirpur', 'nit', 'Hamirpur', 'Himachal Pradesh', 1986, 'https://nith.ac.in', ['JEE Main']],
  ['National Institute of Technology Patna', 'nit', 'Patna', 'Bihar', 1886, 'https://www.nitp.ac.in', ['JEE Main']],
  ['National Institute of Technology Raipur', 'nit', 'Raipur', 'Chhattisgarh', 1956, 'https://www.nitrr.ac.in', ['JEE Main']],

  // ── IIITs ──
  ['Indian Institute of Information Technology Allahabad', 'iiit', 'Prayagraj', 'Uttar Pradesh', 1999, 'https://www.iiita.ac.in', ['JEE Main']],
  ['ABV-Indian Institute of Information Technology and Management Gwalior', 'iiit', 'Gwalior', 'Madhya Pradesh', 1997, 'https://www.iiitm.ac.in', ['JEE Main']],
  ['Indian Institute of Information Technology Guwahati', 'iiit', 'Guwahati', 'Assam', 2013, 'https://www.iiitg.ac.in', ['JEE Main']],

  // ── Engineering & technology institutions / universities ──
  ['Delhi Technological University', 'eng', 'New Delhi', 'Delhi', 1941, 'https://www.dtu.ac.in', ['JEE Main']],
  ['Netaji Subhas University of Technology', 'eng', 'New Delhi', 'Delhi', 1983, 'https://www.nsut.ac.in', ['JEE Main']],
  ['Indian Institute of Engineering Science and Technology, Shibpur', 'eng', 'Howrah', 'West Bengal', 1856, 'https://www.iiests.ac.in', ['JEE Main']],
  ['Jadavpur University', 'eng', 'Kolkata', 'West Bengal', 1955, 'https://jadavpuruniversity.in', ['WBJEE'], [
    c('B.E. in Computer Science and Engineering', 'UG', 4, 'Computer Science and Engineering'),
    c('B.E. in Electrical Engineering', 'UG', 4, 'Electrical Engineering'),
    c('BA (Hons.) in various disciplines', 'UG', 3, 'Arts'),
    c('M.E. / M.Tech programmes', 'PG', 2, 'Engineering'),
  ], 'A leading public university in Kolkata known for its engineering, science and arts faculties.'],
  ['COEP Technological University', 'eng', 'Pune', 'Maharashtra', 1854, 'https://www.coep.org.in', ['MHT CET', 'JEE Main']],
  ['PSG College of Technology', 'eng', 'Coimbatore', 'Tamil Nadu', 1951, 'https://www.psgtech.edu', ['TNEA']],
  ['Thapar Institute of Engineering and Technology', 'eng', 'Patiala', 'Punjab', 1956, 'https://www.thapar.edu', ['JEE Main']],
  ['Veermata Jijabai Technological Institute', 'eng', 'Mumbai', 'Maharashtra', 1887, 'https://vjti.ac.in', ['MHT CET', 'JEE Main']],
  ['SASTRA Deemed University', 'eng', 'Thanjavur', 'Tamil Nadu', 1984, 'https://www.sastra.edu', ['JEE Main', 'Institution-level admission test']],
  ['Birla Institute of Technology, Mesra', 'eng', 'Ranchi', 'Jharkhand', 1955, 'https://www.bitmesra.ac.in', ['JEE Main']],
  ['Punjab Engineering College', 'eng', 'Chandigarh', 'Chandigarh', 1921, 'https://pec.ac.in', ['JEE Main']],
  ['Amrita Vishwa Vidyapeetham', 'eng', 'Coimbatore', 'Tamil Nadu', 1994, 'https://www.amrita.edu', ['JEE Main', 'Amrita Engineering Entrance Exam']],
  ['Kalinga Institute of Industrial Technology', 'eng', 'Bhubaneswar', 'Odisha', 1992, 'https://kiit.ac.in', ['KIITEE']],
  ['Chandigarh University', 'eng', 'Mohali', 'Punjab', 2012, 'https://www.cuchd.in', ['JEE Main', 'Institution-level admission test']],
  ['Lovely Professional University', 'eng', 'Phagwara', 'Punjab', 2005, 'https://www.lpu.in', ['LPUNEST', 'JEE Main']],
  ['Bennett University', 'eng', 'Greater Noida', 'Uttar Pradesh', 2016, 'https://www.bennett.edu.in', ['JEE Main', 'Institution-level admission test']],

  // ── IIMs ──
  ['Indian Institute of Management Indore', 'iim', 'Indore', 'Madhya Pradesh', 1996, 'https://www.iimidr.ac.in', ['CAT']],
  ['Indian Institute of Management Udaipur', 'iim', 'Udaipur', 'Rajasthan', 2011, 'https://www.iimu.ac.in', ['CAT']],
  ['Indian Institute of Management Shillong', 'iim', 'Shillong', 'Meghalaya', 2007, 'https://www.iimshillong.ac.in', ['CAT']],
  ['Indian Institute of Management Rohtak', 'iim', 'Rohtak', 'Haryana', 2010, 'https://www.iimrohtak.ac.in', ['CAT']],
  ['Indian Institute of Management Ranchi', 'iim', 'Ranchi', 'Jharkhand', 2010, 'https://www.iimranchi.ac.in', ['CAT']],
  ['Indian Institute of Management Raipur', 'iim', 'Raipur', 'Chhattisgarh', 2010, 'https://www.iimraipur.ac.in', ['CAT']],
  ['Indian Institute of Management Tiruchirappalli', 'iim', 'Tiruchirappalli', 'Tamil Nadu', 2011, 'https://www.iimtrichy.ac.in', ['CAT']],
  ['Indian Institute of Management Kashipur', 'iim', 'Kashipur', 'Uttarakhand', 2011, 'https://www.iimkashipur.ac.in', ['CAT']],
  ['Indian Institute of Management Nagpur', 'iim', 'Nagpur', 'Maharashtra', 2015, 'https://www.iimnagpur.ac.in', ['CAT']],
  ['Indian Institute of Management Visakhapatnam', 'iim', 'Visakhapatnam', 'Andhra Pradesh', 2015, 'https://www.iimv.ac.in', ['CAT']],
  ['Indian Institute of Management Amritsar', 'iim', 'Amritsar', 'Punjab', 2015, 'https://www.iimamritsar.ac.in', ['CAT']],

  // ── Other management institutions ──
  ['S. P. Jain Institute of Management and Research', 'mgmt', 'Mumbai', 'Maharashtra', 1981, 'https://www.spjimr.org', ['CAT', 'GMAT', 'XAT']],
  ['Management Development Institute Gurgaon', 'mgmt', 'Gurugram', 'Haryana', 1973, 'https://www.mdi.ac.in', ['CAT']],
  ['SVKM\'s Narsee Monjee Institute of Management Studies', 'mgmt', 'Mumbai', 'Maharashtra', 1981, 'https://www.nmims.edu', ['NMAT by GMAC']],
  ['Institute of Management Technology Ghaziabad', 'mgmt', 'Ghaziabad', 'Uttar Pradesh', 1980, 'https://www.imt.edu', ['CAT', 'XAT', 'GMAT']],
  ['Indian School of Business', 'mgmt', 'Hyderabad', 'Telangana', 2001, 'https://www.isb.edu', ['GMAT', 'GRE'], [c('Post Graduate Programme in Management (one-year MBA equivalent)', 'PG', 1, 'Management')]],
  ['Tata Institute of Social Sciences', 'mgmt', 'Mumbai', 'Maharashtra', 1936, 'https://tiss.edu', ['TISSNET', 'CUET (PG)'], [
    c('MA in Social Work', 'PG', 2, 'Social Work'),
    c('MA in Development Studies', 'PG', 2, 'Development Studies'),
    c('MA in Human Resource Management and Labour Relations', 'PG', 2, 'Management'),
  ], 'A leading Indian institute for social sciences, social work, public policy and human resource management education.'],
  ['Indian Institute of Foreign Trade', 'mgmt', 'New Delhi', 'Delhi', 1963, 'https://www.iift.ac.in', ['CAT'], [c('MBA in International Business', 'PG', 2, 'International Business')]],
  ['Great Lakes Institute of Management', 'mgmt', 'Chennai', 'Tamil Nadu', 2004, 'https://www.greatlakes.edu.in', ['CAT', 'XAT', 'GMAT', 'GRE']],
  ['Symbiosis International University', 'mgmt', 'Pune', 'Maharashtra', 2002, 'https://www.siu.edu.in', ['SNAP', 'Symbiosis Entrance Test'], [
    c('BBA', 'UG', 3, 'Management'),
    c('MBA', 'PG', 2, 'Management'),
    c('Programmes in law, computer studies, media and health sciences', 'UG'),
  ], 'A multi-disciplinary deemed university in Pune with constituent institutes across management, law, media, computing and health sciences.'],

  // ── Medical ──
  ['All India Institute of Medical Sciences, Bhubaneswar', 'med', 'Bhubaneswar', 'Odisha', 2012, 'https://aiimsbhubaneswar.nic.in', ['NEET UG', 'INI-CET']],
  ['All India Institute of Medical Sciences, Rishikesh', 'med', 'Rishikesh', 'Uttarakhand', 2012, 'https://www.aiimsrishikesh.edu.in', ['NEET UG', 'INI-CET']],
  ['Postgraduate Institute of Medical Education and Research, Chandigarh', 'med', 'Chandigarh', 'Chandigarh', 1962, 'https://pgimer.edu.in', ['INI-CET', 'NEET SS'], [
    c('MD (various specialisations)', 'PG', 3, 'Medicine'),
    c('MS (various specialisations)', 'PG', 3, 'Surgery'),
    c('DM (super-specialty)', 'PG', 3, 'Super-specialty Medicine'),
    c('MCh (super-specialty)', 'PG', 3, 'Super-specialty Surgery'),
  ], 'A premier postgraduate and tertiary-care medical institute of national importance in Chandigarh.'],
  ['Lady Hardinge Medical College', 'med', 'New Delhi', 'Delhi', 1916, 'https://lhmc-hosp.gov.in', ['NEET UG', 'NEET PG']],
  ['King George\'s Medical University', 'med', 'Lucknow', 'Uttar Pradesh', 1911, 'https://www.kgmu.org', ['NEET UG', 'NEET PG']],
  ['Seth G. S. Medical College and KEM Hospital', 'med', 'Mumbai', 'Maharashtra', 1926, 'https://www.kem.edu', ['NEET UG', 'NEET PG']],
  ['Madras Medical College', 'med', 'Chennai', 'Tamil Nadu', 1835, 'https://www.mmc.tn.gov.in', ['NEET UG', 'NEET PG']],
  ['National Institute of Mental Health and Neurosciences', 'med', 'Bengaluru', 'Karnataka', 1974, 'https://nimhans.ac.in', ['INI-CET', 'Institute entrance test'], [
    c('MD in Psychiatry', 'PG', 3, 'Psychiatry'),
    c('DM in Neurology', 'PG', 3, 'Neurology'),
    c('M.Phil in Clinical Psychology', 'PG', 2, 'Clinical Psychology'),
  ], 'A leading institute of national importance for mental health and neurosciences education, research and patient care.'],
  ['Sri Ramachandra Institute of Higher Education and Research', 'med', 'Chennai', 'Tamil Nadu', 1985, 'https://www.sriramachandra.edu.in', ['NEET UG', 'NEET PG']],
  ['St. John\'s Medical College', 'med', 'Bengaluru', 'Karnataka', 1963, 'https://www.stjohns.in', ['NEET UG', 'NEET PG']],

  // ── Law ──
  ['National Law University, Jodhpur', 'law', 'Jodhpur', 'Rajasthan', 1999, 'https://nlujodhpur.ac.in', ['CLAT']],
  ['West Bengal National University of Juridical Sciences', 'law', 'Kolkata', 'West Bengal', 1999, 'https://www.nujs.edu', ['CLAT']],
  ['Gujarat National Law University', 'law', 'Gandhinagar', 'Gujarat', 2003, 'https://www.gnlu.ac.in', ['CLAT']],
  ['Hidayatullah National Law University', 'law', 'Raipur', 'Chhattisgarh', 2003, 'https://www.hnlu.ac.in', ['CLAT']],
  ['National Law Institute University', 'law', 'Bhopal', 'Madhya Pradesh', 1997, 'https://www.nliu.ac.in', ['CLAT']],
  ['Rajiv Gandhi National University of Law', 'law', 'Patiala', 'Punjab', 2006, 'https://www.rgnul.ac.in', ['CLAT']],
  ['National Law University Odisha', 'law', 'Cuttack', 'Odisha', 2009, 'https://www.nluo.ac.in', ['CLAT']],
  ['Faculty of Law, University of Delhi', 'law', 'New Delhi', 'Delhi', 1924, 'https://lawfaculty.du.ac.in', ['CUET (UG)', 'CUET (PG)'], [
    c('LLB', 'UG', 3, 'Law'),
    c('LLM', 'PG', 1, 'Law'),
    c('PhD in Law', 'DOCTORATE', 3, 'Law'),
  ]],

  // ── Universities, science & arts/commerce colleges ──
  ['St. Stephen\'s College', 'arts', 'New Delhi', 'Delhi', 1881, 'https://www.ststephens.edu', ['CUET (UG)'], [
    c('BA (Hons.) in Economics, English, History and other subjects', 'UG', 3, 'Humanities and Social Sciences'),
    c('BSc (Hons.) in Physics, Chemistry, Mathematics and other subjects', 'UG', 3, 'Sciences'),
  ]],
  ['Miranda House', 'arts', 'New Delhi', 'Delhi', 1948, 'https://www.mirandahouse.ac.in', ['CUET (UG)']],
  ['Hindu College', 'arts', 'New Delhi', 'Delhi', 1899, 'https://www.hinducollege.ac.in', ['CUET (UG)']],
  ['Lady Shri Ram College for Women', 'arts', 'New Delhi', 'Delhi', 1956, 'https://lsr.edu.in', ['CUET (UG)']],
  ['Shri Ram College of Commerce', 'arts', 'New Delhi', 'Delhi', 1926, 'https://www.srcc.edu', ['CUET (UG)'], [
    c('B.Com (Hons.)', 'UG', 3, 'Commerce'),
    c('BA (Hons.) in Economics', 'UG', 3, 'Economics'),
    c('MA / MCom programmes', 'PG', 2),
  ]],
  ['Presidency University, Kolkata', 'arts', 'Kolkata', 'West Bengal', 1817, 'https://www.presiuniv.ac.in', ['CUET (UG)', 'University-level admission process']],
  ['St. Xavier\'s College, Mumbai', 'arts', 'Mumbai', 'Maharashtra', 1869, 'https://xaviers.edu', ['Merit-based admission']],
  ['Loyola College, Chennai', 'arts', 'Chennai', 'Tamil Nadu', 1925, 'https://www.loyolacollege.edu', ['Merit-based admission']],
  ['Madras Christian College', 'arts', 'Chennai', 'Tamil Nadu', 1837, 'https://www.mcc.edu.in', ['Merit-based admission']],
  ['St. Xavier\'s College, Kolkata', 'arts', 'Kolkata', 'West Bengal', 1860, 'https://www.sxccal.edu', ['Merit-based admission']],
  ['Christ University', 'arts', 'Bengaluru', 'Karnataka', 1969, 'https://christuniversity.in', ['Christ University Entrance Test'], [
    c('BBA', 'UG', 3, 'Management'),
    c('BCom', 'UG', 3, 'Commerce'),
    c('BA in various disciplines', 'UG', 3, 'Humanities and Social Sciences'),
    c('MBA', 'PG', 2, 'Management'),
  ]],
  ['Savitribai Phule Pune University', 'arts', 'Pune', 'Maharashtra', 1949, 'https://www.unipune.ac.in', ['University / state-level entrance tests and merit']],
  ['Osmania University', 'arts', 'Hyderabad', 'Telangana', 1918, 'https://www.osmania.ac.in', ['University / state-level entrance tests and merit']],
  ['Panjab University', 'arts', 'Chandigarh', 'Chandigarh', 1882, 'https://puchd.ac.in', ['CUET (UG)', 'PU-CET']],
  ['University of Allahabad', 'arts', 'Prayagraj', 'Uttar Pradesh', 1887, 'https://www.allduniv.ac.in', ['CUET (UG)']],
  ['Visva-Bharati University', 'arts', 'Santiniketan', 'West Bengal', 1921, 'https://www.visva-bharati.ac.in', ['CUET (UG)']],
  ['Indian Institute of Science', 'arts', 'Bengaluru', 'Karnataka', 1909, 'https://iisc.ac.in', ['JEE Advanced', 'JEE Main', 'NEET UG', 'GATE'], [
    c('BS (Research) in Mathematics, Physics, Chemistry, Biology or Materials', 'UG', 4, 'Sciences'),
    c('M.Tech in various engineering disciplines', 'PG', 2, 'Engineering'),
    c('PhD in science and engineering disciplines', 'DOCTORATE', 5),
  ], "India's premier institution for advanced scientific and technological research and education, established in Bengaluru in 1909."],
  ['Pondicherry University', 'arts', 'Puducherry', 'Puducherry', 1985, 'https://www.pondiuni.edu.in', ['CUET (UG)', 'CUET (PG)']],
];

async function main() {
  if (ROWS.length !== 100) throw new Error(`Expected 100 institutions, got ${ROWS.length}`);
  const slugs = ROWS.map((r) => toSlug(r[0]));
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length) throw new Error(`Duplicate slugs in list: ${dupes.join(', ')}`);

  await Promise.all(NEW_CATEGORIES.map((cat) => prisma.institutionCategory.upsert({ where: { slug: cat.slug }, create: cat, update: {} })));
  const categories = await prisma.institutionCategory.findMany();
  const categoryIdBySlug = new Map(categories.map((cat) => [cat.slug, cat.id]));

  let created = 0;
  let skipped = 0;
  for (const [name, kind, city, state, establishedYear, website, exams, customCourses, customDescription] of ROWS) {
    const slug = toSlug(name);
    if (await prisma.institution.findUnique({ where: { slug }, select: { id: true } })) {
      skipped++;
      console.log(`skip (exists): ${name}`);
      continue;
    }
    const categoryId = categoryIdBySlug.get(CATEGORY_BY_KIND[kind]);
    if (!categoryId) throw new Error(`Missing category ${CATEGORY_BY_KIND[kind]}`);
    const courses = customCourses ?? COURSES_BY_KIND[kind];

    await prisma.institution.create({
      data: {
        name,
        slug,
        type: TYPE_BY_KIND[kind],
        categoryId,
        establishedYear,
        website,
        description: customDescription ?? `${name} is a well-known institution located in ${city}, ${state}, established in ${establishedYear}.`,
        entranceExams: exams,
        admissionProcess: admissionText(kind, exams),
        status: 'APPROVED',
        verified: true,
        locations: { create: { city, state, isPrimary: true } },
        courses: {
          create: courses.map((co) => ({ name: co.name, level: co.level, department: co.department, durationYears: co.durationYears })),
        },
      },
    });
    created++;
  }
  console.log(`\nDone: ${created} created, ${skipped} skipped (already existed). Total institutions: ${await prisma.institution.count()}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
