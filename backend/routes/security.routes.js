import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  analyzeTransaction,
  getFraudAlerts,
  reviewAlert,
  getFraudStats,
  getAuditLogs,
  logSecurityEvent,
  getComplianceStatus,
  runPenetrationTest,
  getPenetrationTests
} from '../controllers/security.controller.js';

const router = express.Router();

router.use(protect);

// Fraud detection
router.post('/fraud/analyze', analyzeTransaction);
router.get('/fraud/alerts', getFraudAlerts);
router.post('/fraud/alerts/:id/review', authorize('admin'), reviewAlert);
router.get('/fraud/stats', authorize('admin'), getFraudStats);

// Audit
router.post('/audit/log', logSecurityEvent);
router.get('/audit/logs', authorize('admin'), getAuditLogs);

// Compliance
router.get('/compliance', getComplianceStatus);

// Penetration tests
router.post('/penetration-test', authorize('admin'), runPenetrationTest);
router.get('/penetration-tests', authorize('admin'), getPenetrationTests);

export default router;


