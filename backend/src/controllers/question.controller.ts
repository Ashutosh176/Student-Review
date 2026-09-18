import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { serializePublicAnswer, serializePublicQuestion } from '../utils/serializers.js';
import * as questionService from '../services/question.service.js';

export const create = asyncHandler(async (req, res) => {
  const question = await questionService.createQuestion(req.user!.id, req.body.institutionId, req.body.title, req.body.body);
  ok(res, serializePublicQuestion(question), 201);
});

export const listForInstitution = asyncHandler(async (req, res) => {
  const result = await questionService.listQuestions(req.params.institutionId, Number(req.query.page) || 1, Number(req.query.pageSize) || 20);
  ok(res, result.items.map(serializePublicQuestion), 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});

export const getOne = asyncHandler(async (req, res) => {
  const question = await questionService.getQuestionWithAnswers(req.params.id);
  ok(res, { ...serializePublicQuestion(question), answers: question.answers.map(serializePublicAnswer) });
});

export const reportQuestion = asyncHandler(async (req, res) => {
  const report = await questionService.reportQuestion(req.params.id, req.user!.id, req.body.reason, req.body.details);
  ok(res, report, 201);
});

export const reportAnswer = asyncHandler(async (req, res) => {
  const report = await questionService.reportAnswer(req.params.answerId, req.user!.id, req.body.reason, req.body.details);
  ok(res, report, 201);
});

export const mine = asyncHandler(async (req, res) => {
  const [questions, answers] = await Promise.all([
    questionService.listOwnQuestions(req.user!.id),
    questionService.listOwnAnswers(req.user!.id),
  ]);
  ok(res, { questions, answers });
});

export const answer = asyncHandler(async (req, res) => {
  const created = await questionService.createAnswer(req.user!.id, req.params.id, req.body.body);
  ok(res, serializePublicAnswer(created), 201);
});

export const upvoteAnswer = asyncHandler(async (req, res) => {
  const result = await questionService.toggleAnswerUpvote(req.params.answerId, req.user!.id);
  ok(res, result);
});
