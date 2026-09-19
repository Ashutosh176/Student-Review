import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { serializePublicReview } from '../utils/serializers.js';
import * as institutionService from '../services/institution.service.js';
import * as reviewService from '../services/review.service.js';
import * as jobService from '../services/job.service.js';
import * as questionService from '../services/question.service.js';

export const stats = asyncHandler(async (_req, res) => {
  const result = await institutionService.platformStats();
  ok(res, result);
});

export const filters = asyncHandler(async (_req, res) => {
  const result = await institutionService.listSearchFilters();
  ok(res, result);
});

export const list = asyncHandler(async (req, res) => {
  const result = await institutionService.listInstitutions(req.query as never);
  ok(res, result.items, 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});

export const submit = asyncHandler(async (req, res) => {
  const institution = await institutionService.submitInstitution(req.user!.id, req.body);
  ok(res, institution, 201);
});

export const search = asyncHandler(async (req, res) => {
  const { q, limit } = req.query as unknown as { q: string; limit: number };
  const results = await institutionService.searchInstitutions(q, limit);
  ok(res, results);
});

export const getBySlug = asyncHandler(async (req, res) => {
  const institution = await institutionService.getInstitutionBySlug(req.params.slug);
  ok(res, institution);
});

export const compare = asyncHandler(async (req, res) => {
  const { slugs } = req.query as unknown as { slugs: string[] };
  const result = await institutionService.getCompareData(slugs);
  ok(res, result);
});

export const institutionReviews = asyncHandler(async (req, res) => {
  const institution = await institutionService.getInstitutionBySlug(req.params.slug);
  const result = await reviewService.listInstitutionReviews(institution.id, req.query as never);
  const revealed = await reviewService.institutionsWithRevealedCohort([institution.id]);
  ok(res, result.items.map((r) => serializePublicReview(r, revealed.has(institution.id))), 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});

export const institutionJobs = asyncHandler(async (req, res) => {
  const institution = await institutionService.getInstitutionBySlug(req.params.slug);
  const jobs = await jobService.listInstitutionJobs(institution.id);
  ok(res, jobs);
});

export const institutionQuestions = asyncHandler(async (req, res) => {
  const institution = await institutionService.getInstitutionBySlug(req.params.slug);
  const result = await questionService.listQuestions(institution.id, Number(req.query.page) || 1, Number(req.query.pageSize) || 20);
  ok(res, result.items, 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});
