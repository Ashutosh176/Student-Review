import { describe, expect, it } from 'vitest';
import { createInstitutionSchema } from './admin.validator.js';

const validInstitution = {
  name: 'IIT Guwahati',
  type: 'IIT',
  city: 'Guwahati',
  state: 'Assam',
};

describe('createInstitutionSchema', () => {
  it('accepts a well-formed institution with only the required fields', () => {
    expect(() => createInstitutionSchema.parse(validInstitution)).not.toThrow();
  });

  it('rejects an unknown institution type', () => {
    expect(() => createInstitutionSchema.parse({ ...validInstitution, type: 'COMMUNITY_COLLEGE' })).toThrow();
  });

  it('rejects a missing city or state', () => {
    expect(() => createInstitutionSchema.parse({ ...validInstitution, city: undefined })).toThrow();
    expect(() => createInstitutionSchema.parse({ ...validInstitution, state: undefined })).toThrow();
  });

  it('rejects an established year in the future', () => {
    expect(() => createInstitutionSchema.parse({ ...validInstitution, establishedYear: new Date().getFullYear() + 1 })).toThrow();
  });

  it('accepts an empty-string website (form default) without requiring a valid URL', () => {
    expect(() => createInstitutionSchema.parse({ ...validInstitution, website: '' })).not.toThrow();
  });

  it('rejects a malformed website URL', () => {
    expect(() => createInstitutionSchema.parse({ ...validInstitution, website: 'not-a-url' })).toThrow();
  });

  it('coerces a numeric-string established year (form inputs arrive as strings)', () => {
    const parsed = createInstitutionSchema.parse({ ...validInstitution, establishedYear: '1994' as unknown as number });
    expect(parsed.establishedYear).toBe(1994);
  });
});
