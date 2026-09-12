// Single source of truth for the InstitutionType enum — mirrors the Prisma
// schema/backend validator exactly. Shared by the admin "Add institution"
// form and the public search filters so a public page never has to import
// from the admin API module to get this list.
export const INSTITUTION_TYPES = [
  'IIT',
  'NIT',
  'IIIT',
  'PRIVATE_UNIVERSITY',
  'STATE_UNIVERSITY',
  'DEEMED_UNIVERSITY',
  'ENGINEERING_COLLEGE',
  'MANAGEMENT_INSTITUTE',
  'MEDICAL_COLLEGE',
  'LAW_SCHOOL',
  'ARTS_SCIENCE_COLLEGE',
  'OTHER',
] as const;

export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  IIT: 'IIT',
  NIT: 'NIT',
  IIIT: 'IIIT',
  PRIVATE_UNIVERSITY: 'Private University',
  STATE_UNIVERSITY: 'State University',
  DEEMED_UNIVERSITY: 'Deemed University',
  ENGINEERING_COLLEGE: 'Engineering College',
  MANAGEMENT_INSTITUTE: 'Management Institute',
  MEDICAL_COLLEGE: 'Medical College',
  LAW_SCHOOL: 'Law School',
  ARTS_SCIENCE_COLLEGE: 'Arts & Science College',
  OTHER: 'Other',
};
