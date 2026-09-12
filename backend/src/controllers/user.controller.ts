import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import * as userService from '../services/user.service.js';
import * as notificationService from '../services/notification.service.js';

export const saveInstitution = asyncHandler(async (req, res) => {
  await userService.saveInstitution(req.user!.id, req.body.institutionId);
  ok(res, { saved: true }, 201);
});

export const unsaveInstitution = asyncHandler(async (req, res) => {
  await userService.unsaveInstitution(req.user!.id, req.params.institutionId);
  ok(res, { saved: false });
});

export const listSaved = asyncHandler(async (req, res) => {
  const saved = await userService.listSavedInstitutions(req.user!.id);
  ok(res, saved);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const updated = await userService.updateSettings(req.user!.id, req.body);
  ok(res, {
    publicProfileOptIn: updated.publicProfileOptIn,
    notifyReviewActivity: updated.notifyReviewActivity,
    notifyCommunityActivity: updated.notifyCommunityActivity,
    notifySubmissionUpdates: updated.notifySubmissionUpdates,
    notifySystem: updated.notifySystem,
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  ok(res, { message: 'Password updated. You may need to log in again on other devices.' });
});

export const deactivateAccount = asyncHandler(async (req, res) => {
  await userService.deactivateAccount(req.user!.id, req.body.password);
  ok(res, { message: 'Your account has been deactivated.' });
});

export const notifications = asyncHandler(async (req, res) => {
  const result = await notificationService.listNotifications(req.user!.id, Number(req.query.page) || 1, Number(req.query.pageSize) || 20);
  ok(res, result.items, 200, { total: result.total, page: result.page, pageSize: result.pageSize });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  await notificationService.markRead(req.user!.id, req.params.id);
  ok(res, { read: true });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user!.id);
  ok(res, { read: true });
});
