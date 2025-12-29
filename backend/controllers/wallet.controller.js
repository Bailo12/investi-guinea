import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
import crypto from 'crypto';

// Calculate transaction fee (5-10%)
const calculateFee = (amount) => {
  const feePercentage = amount >= 1000000 ? 0.05 : 0.10; // 5% for large, 10% for small
  return Math.round(amount * feePercentage);
};

export const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        balance: 0,
        currency: 'GNF'
      });
    }

    res.json({
      success: true,
      wallet: {
        id: wallet._id,
        balance: wallet.balance,
        currency: wallet.currency
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deposit = async (req, res) => {
  try {
    const { amount, paymentMethod, reference } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        balance: 0,
        currency: 'GNF'
      });
    }

    const fee = calculateFee(amount);
    const totalAmount = amount - fee;

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      walletId: wallet._id,
      type: 'deposit',
      amount: totalAmount,
      fee,
      currency: wallet.currency,
      paymentMethod,
      reference: reference || `DEP-${crypto.randomUUID()}`,
      status: 'pending',
      description: `Deposit via ${paymentMethod}`
    });

    // In production, integrate with Orange Money/MTN API here
    // For now, we'll simulate success after a delay

    setTimeout(async () => {
      // Update wallet balance
      wallet.balance += totalAmount;
      await wallet.save();

      // Update transaction status
      transaction.status = 'completed';
      await transaction.save();
    }, 2000);

    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        amount: totalAmount,
        fee,
        total: amount,
        status: transaction.status,
        reference: transaction.reference
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const withdraw = async (req, res) => {
  try {
    const { amount, paymentMethod, reference } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    const fee = calculateFee(amount);
    const totalAmount = amount + fee;

    if (wallet.balance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      walletId: wallet._id,
      type: 'withdraw',
      amount: amount,
      fee,
      currency: wallet.currency,
      paymentMethod,
      reference: reference || `WTH-${crypto.randomUUID()}`,
      status: 'pending',
      description: `Withdrawal via ${paymentMethod}`
    });

    // Update wallet balance
    wallet.balance -= totalAmount;
    await wallet.save();

    // In production, integrate with Orange Money/MTN API here
    setTimeout(async () => {
      transaction.status = 'completed';
      await transaction.save();
    }, 2000);

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

export const getTransactions = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.json({ success: true, transactions: [] });
    }

    const transactions = await Transaction.find({ walletId: wallet._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        fee: t.fee,
        currency: t.currency,
        paymentMethod: t.paymentMethod,
        status: t.status,
        reference: t.reference,
        description: t.description,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

