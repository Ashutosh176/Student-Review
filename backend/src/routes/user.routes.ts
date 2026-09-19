import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  changePasswordSchema,
  deactivateAccountSchema,
  saveInstitutionSchema,
  updateSettingsSchema,
} from '../validators/user.validator.js';

const router = Router();
router.use(authenticate);

router.get('/saved-institutions', userController.listSaved);
router.post('/saved-institutions', validate({ body: saveInstitutionSchema }), userController.saveInstitution);
router.delete('/saved-institutions/:institutionId', userController.unsaveInstitution);

router.patch('/settings', validate({ body: updateSettingsSchema }), userController.updateSettings);
router.patch('/password', validate({ body: changePasswordSchema }), userController.changePassword);
router.post('/deactivate', validate({ body: deactivateAccountSchema }), userController.deactivateAccount);
router.post('/delete-account', validate({ body: deactivateAccountSchema }), userController.deleteAccount);

router.get('/notifications', userController.notifications);
router.post('/notifications/:id/read', userController.markNotificationRead);
router.post('/notifications/read-all', userController.markAllNotificationsRead);

export default router;
