import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getAccount,
  getPlans,
  subscribe,
  cancelSubscription,
  renewSubscription,
  isPremiumUser,
  getPremiumProjects,
  getPremiumProject,
  investInPremiumProject
} from '../controllers/premium.controller.js';

const router = express.Router();

router.use(protect);

router.get('/account', getAccount);
router.get('/plans', getPlans);
router.post('/subscribe', subscribe);
router.post('/cancel', cancelSubscription);
router.post('/renew', renewSubscription);
router.get('/status', isPremiumUser);
router.get('/projects', getPremiumProjects);
router.get('/projects/:id', getPremiumProject);
router.post('/projects/:id/invest', investInPremiumProject);

export default router;


