import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getCryptoWallets,
  getCryptoPrices,
  createCryptoTrade,
  getCryptoTrades,
  getForexAccount,
  getForexPairs,
  createForexTrade,
  getForexTrades,
  createForexAlert
} from '../controllers/trading.controller.js';

const router = express.Router();

router.use(protect);

// Crypto routes
router.get('/crypto/wallets', getCryptoWallets);
router.get('/crypto/prices', getCryptoPrices);
router.post('/crypto/trades', createCryptoTrade);
router.get('/crypto/trades', getCryptoTrades);

// Forex routes
router.get('/forex/account', getForexAccount);
router.get('/forex/pairs', getForexPairs);
router.post('/forex/trades', createForexTrade);
router.get('/forex/trades', getForexTrades);
router.post('/forex/alerts', createForexAlert);

export default router;


