import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { encryptTransaction } from '../middleware/encryption.middleware.js';
import {
  getWallet,
  deposit,
  withdraw,
  getTransactions
} from '../controllers/wallet.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);
router.use(encryptTransaction);

router.get('/', getWallet);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.get('/transactions', getTransactions);

export default router;

