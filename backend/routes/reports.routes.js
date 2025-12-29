import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getTransactionReport,
  getFeeReport,
  getUserReport
} from '../controllers/reports.controller.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/transactions', getTransactionReport);
router.get('/fees', getFeeReport);
router.get('/user', getUserReport);

export default router;


