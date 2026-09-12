import { Router } from 'express';
import * as rankingController from '../controllers/ranking.controller.js';

const router = Router();
router.get('/', rankingController.list);
export default router;
