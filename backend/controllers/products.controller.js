import Product from '../models/Product.model.js';
import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
import crypto from 'crypto';

// Calculate investment fee (5-10%)
const calculateFee = (amount) => {
  const feePercentage = amount >= 1000000 ? 0.05 : 0.10;
  return Math.round(amount * feePercentage);
};

export const getProducts = async (req, res) => {
  try {
    const filter = {};
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter premium products based on user premium status
    const user = req.user;
    if (!user || user.premiumStatus === 'none') {
      filter.premiumOnly = { $ne: true };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      products: products.map(p => ({
        id: p._id,
        type: p.type,
        name: p.name,
        description: p.description,
        status: p.status,
        minInvestment: p.minInvestment,
        maxInvestment: p.maxInvestment,
        currentInvestment: p.currentInvestment,
        targetAmount: p.targetAmount,
        interestRate: p.interestRate,
        duration: p.duration,
        currency: p.currency,
        category: p.category,
        location: p.location,
        expectedReturn: p.expectedReturn,
        riskLevel: p.riskLevel,
        startDate: p.startDate,
        endDate: p.endDate,
        accountType: p.accountType,
        withdrawalTerms: p.withdrawalTerms,
        premiumOnly: p.premiumOnly,
        premiumPlan: p.premiumPlan,
        imageUrl: p.imageUrl,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check premium access
    if (product.premiumOnly && (!req.user || req.user.premiumStatus === 'none')) {
      return res.status(403).json({ message: 'Premium account required' });
    }

    res.json({
      success: true,
      product: {
        id: product._id,
        type: product.type,
        name: product.name,
        description: product.description,
        status: product.status,
        minInvestment: product.minInvestment,
        maxInvestment: product.maxInvestment,
        currentInvestment: product.currentInvestment,
        targetAmount: product.targetAmount,
        interestRate: product.interestRate,
        duration: product.duration,
        currency: product.currency,
        category: product.category,
        location: product.location,
        expectedReturn: product.expectedReturn,
        riskLevel: product.riskLevel,
        startDate: product.startDate,
        endDate: product.endDate,
        accountType: product.accountType,
        withdrawalTerms: product.withdrawalTerms,
        premiumOnly: product.premiumOnly,
        premiumPlan: product.premiumPlan,
        imageUrl: product.imageUrl,
        documents: product.documents,
        createdAt: product.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const investInProduct = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status !== 'active') {
      return res.status(400).json({ message: 'Product is not active' });
    }

    // Check premium access
    if (product.premiumOnly && req.user.premiumStatus === 'none') {
      return res.status(403).json({ message: 'Premium account required' });
    }

    // Validate amount
    if (amount < product.minInvestment) {
      return res.status(400).json({ 
        message: `Minimum investment is ${product.minInvestment}` 
      });
    }

    if (product.maxInvestment && amount > product.maxInvestment) {
      return res.status(400).json({ 
        message: `Maximum investment is ${product.maxInvestment}` 
      });
    }

    // Get wallet
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const fee = calculateFee(amount);
    const totalAmount = amount + fee;

    if (paymentMethod === 'wallet' && wallet.balance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      walletId: wallet._id,
      type: 'investment',
      amount: amount,
      fee,
      currency: wallet.currency,
      paymentMethod,
      reference: `INV-${crypto.randomUUID()}`,
      status: 'pending',
      description: `Investment in ${product.name}`,
      metadata: { productId: product._id }
    });

    // Update wallet if using wallet payment
    if (paymentMethod === 'wallet') {
      wallet.balance -= totalAmount;
      await wallet.save();
    }

    // Update product investment
    product.currentInvestment = (product.currentInvestment || 0) + amount;
    if (product.targetAmount && product.currentInvestment >= product.targetAmount) {
      product.status = 'sold-out';
    }
    await product.save();

    // Update transaction status
    transaction.status = 'completed';
    await transaction.save();

    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        amount: amount,
        fee,
        total: totalAmount,
        status: transaction.status,
        reference: transaction.reference
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


