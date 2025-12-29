import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import {
  submitKYC,
  getKYC,
  updateKYC,
  verifyIDDocument,
  runAMLChecks,
  getComplianceReport
} from '../controllers/kyc.controller.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }
});

router.use(protect);

router.post('/submit', upload.fields([
  { name: 'idDocumentFront', maxCount: 1 },
  { name: 'idDocumentBack', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), submitKYC);

router.get('/', getKYC);
router.put('/', updateKYC);
router.post('/verify-id', upload.fields([
  { name: 'documentFront', maxCount: 1 },
  { name: 'documentBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), verifyIDDocument);
router.post('/aml-checks', runAMLChecks);
router.get('/compliance-report', getComplianceReport);

export default router;


