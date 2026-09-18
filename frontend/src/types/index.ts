export type RoleName = 'STUDENT' | 'ORGANIZATION' | 'MODERATOR' | 'ADMIN';

export interface SelfUser {
  id: string;
  username: string;
  email: string;
  status: string;
  emailVerified: boolean;
  publicProfileOptIn: boolean;
  notifyReviewActivity: boolean;
  notifyCommunityActivity: boolean;
  notifySubmissionUpdates: boolean;
  notifySystem: boolean;
  roles: RoleName[];
  createdAt: string;
}

export type RatingCategory =
  | 'OVERALL'
  | 'PLACEMENT'
  | 'FACULTY'
  | 'INFRASTRUCTURE'
  | 'ADMINISTRATION'
  | 'CAMPUS_LIFE'
  | 'VALUE_FOR_MONEY'
  | 'HOSTEL';

export interface RatingSummaryItem {
  category: RatingCategory;
  average: number;
  count: number;
}

export interface InstitutionLocation {
  city: string;
  state: string;
  country?: string;
}

export interface InstitutionSummary {
  id: string;
  slug: string;
  name: string;
  type: string;
  logoUrl?: string | null;
  verified: boolean;
  featured?: boolean;
  locations: InstitutionLocation[];
  summary: { reviewCount: number; verifiedCount: number; ratings: RatingSummaryItem[] };
}

export interface CourseDetail {
  id: string;
  name: string;
  level: string;
  department?: string | null;
  durationYears?: number | null;
  feePerYearInr?: number | null;
  totalFeeInr?: number | null;
}

export interface AdmissionCutoff {
  id: string;
  courseId: string;
  course: { name: string };
  examName: string;
  category: string;
  year: number;
  openingRank?: number | null;
  closingRank?: number | null;
  percentile?: number | null;
}

export interface InstitutionDetail extends InstitutionSummary {
  website?: string | null;
  description?: string | null;
  establishedYear?: number | null;
  claimed: boolean;
  courses: CourseDetail[];
  entranceExams: string[];
  admissionCutoffs: AdmissionCutoff[];
}

export interface ReviewAuthor {
  label: string;
  verified: boolean;
}

export interface PublicReview {
  id: string;
  institutionId: string;
  courseId?: string | null;
  relationship: 'CURRENT_STUDENT' | 'ALUMNI' | 'FORMER_STUDENT';
  batchYear: number;
  title?: string | null;
  body?: string;
  recommend: boolean;
  status: string;
  author: ReviewAuthor;
  ratings: { category: RatingCategory; value: number }[];
  sentiment?: string | null;
  helpfulCount: number;
  officialResponse?: { body: string; createdAt: string } | null;
  createdAt: string;
  editedAt?: string | null;
}

export interface QuestionSummary {
  id: string;
  title: string;
  body?: string | null;
  createdAt: string;
  _count: { answers: number };
}

export interface AnswerItem {
  id: string;
  questionId: string;
  body: string;
  author: ReviewAuthor;
  upvoteCount: number;
  createdAt: string;
}

export interface RankingRow {
  rank: number;
  score: number;
  institution: {
    id: string;
    slug: string;
    name: string;
    logoUrl?: string | null;
    verified: boolean;
    location: { city: string; state: string } | null;
  };
}

export interface JobListing {
  id: string;
  title: string;
  description: string;
  type: 'JOB' | 'INTERNSHIP';
  locationType: 'ONSITE' | 'REMOTE' | 'HYBRID';
  location?: string | null;
  compensation?: string | null;
  applicationUrl?: string | null;
  deadline?: string | null;
  status: string;
}
