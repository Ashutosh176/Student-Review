import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { AppError } from '../utils/AppError.js';
import * as orgService from '../services/organization.service.js';
import * as jobService from '../services/job.service.js';
import * as paymentService from '../services/payment.service.js';
import { ratingSummaryFor } from '../services/institution.service.js';
import { claimDocumentStorageKey } from '../middlewares/upload.js';

// inviteTokenHash/inviteTokenExpiresAt are internal — never let them reach a client response.
function stripInviteToken<T extends { inviteTokenHash?: unknown; inviteTokenExpiresAt?: unknown }>(member: T) {
  const { inviteTokenHash: _hash, inviteTokenExpiresAt: _exp, ...safe } = member;
  return safe;
}

export const submitClaim = asyncHandler(async (req, res) => {
  const documentUrl = req.file ? claimDocumentStorageKey(req.file.filename) : undefined;
  const claim = await orgService.submitClaim(req.user!.id, req.params.id, { ...req.body, documentUrl });
  // documentUrl is an internal storage key, not for client consumption — strip it from the response.
  const { documentUrl: _internal, ...safeClaim } = claim;
  ok(res, { ...safeClaim, hasDocument: Boolean(documentUrl) }, 201);
});

export const myOrganization = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  const summary = await ratingSummaryFor(membership.organizationProfile.institutionId);
  ok(res, {
    role: membership.role,
    organization: membership.organizationProfile,
    institution: { ...membership.organizationProfile.institution, summary },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  if (membership.role === 'EDITOR') throw AppError.forbidden('Editors cannot change profile settings');
  const updated = await orgService.updateOrgProfile(membership.organizationProfileId, req.body);
  ok(res, updated);
});

export const listMembers = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  const members = await orgService.listMembers(membership.organizationProfileId);
  ok(res, members.map(stripInviteToken));
});

export const inviteMember = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  if (membership.role === 'EDITOR') throw AppError.forbidden('Editors cannot invite members');
  const invited = await orgService.inviteMember(membership.organizationProfileId, req.body.email, req.body.role);
  ok(res, stripInviteToken(invited), 201);
});

export const getInvite = asyncHandler(async (req, res) => {
  const invite = await orgService.getInviteByToken(req.params.token);
  ok(res, invite);
});

export const acceptInvite = asyncHandler(async (req, res) => {
  const membership = await orgService.acceptInvite(req.params.token, req.user!.id);
  ok(res, stripInviteToken(membership));
});

export const removeMember = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  if (membership.role === 'EDITOR') throw AppError.forbidden('Editors cannot remove members');
  await orgService.removeMember(membership.organizationProfileId, req.params.memberId);
  ok(res, { removed: true });
});

export const billing = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  const data = await paymentService.getBillingInfo(membership.organizationProfileId);
  ok(res, data);
});

export const createCheckout = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  if (membership.role === 'EDITOR') throw AppError.forbidden('Editors cannot change the subscription plan');
  const order = await paymentService.createCheckoutOrder(membership.organizationProfileId, req.body.plan);
  ok(res, order, 201);
});

export const verifyCheckout = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  if (membership.role === 'EDITOR') throw AppError.forbidden('Editors cannot change the subscription plan');
  const result = await paymentService.verifyCheckoutPayment({
    orderId: req.body.orderId,
    paymentId: req.body.paymentId,
    signature: req.body.signature,
  });
  ok(res, result);
});

export const analytics = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  const data = await orgService.getOrgAnalytics(membership.organizationProfile.institutionId);
  ok(res, data);
});

export const sentiment = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  const data = await orgService.getSentimentByTopic(membership.organizationProfile.institutionId);
  ok(res, data);
});

export const listJobs = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  const jobs = await jobService.listOrgJobs(membership.organizationProfileId);
  ok(res, jobs);
});

export const createJob = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  const job = await jobService.createJob(membership.organizationProfileId, membership.organizationProfile.institutionId, req.body);
  ok(res, job, 201);
});

export const publishJob = asyncHandler(async (req, res) => {
  const membership = await orgService.getOrgMembershipForUser(req.user!.id);
  const job = await jobService.publishJob(membership.organizationProfileId, req.params.jobId);
  ok(res, job);
});
