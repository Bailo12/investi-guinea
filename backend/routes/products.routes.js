import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getProducts,
  getProduct,
  investInProduct
} from '../controllers/products.controller.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/:id/invest', protect, investInProduct);

export default router;


