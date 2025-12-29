import Transaction from '../models/Transaction.model.js';
import Wallet from '../models/Wallet.model.js';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const wallet = await Wallet.findOne({ userId });
    const transactions = await Transaction.find({ userId });
    
    const totalDeposits = transactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalWithdrawals = transactions
      .filter(t => t.type === 'withdraw' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalInvestments = transactions
      .filter(t => t.type === 'investment' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalFees = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.fee || 0), 0);

    res.json({
      success: true,
      stats: {
        walletBalance: wallet?.balance || 0,
        totalDeposits,
        totalWithdrawals,
        totalInvestments,
        totalFees,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getTransactionReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, type } = req.query;
    
    const filter = { userId };
    if (startDate) filter.createdAt = { $gte: new Date(startDate) };
    if (endDate) {
      filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };
    }
    if (type) filter.type = type;

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        fee: t.fee,
        currency: t.currency,
        status: t.status,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getFeeReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ userId, status: 'completed' });

    const feesByType = {};
    let totalFees = 0;

    transactions.forEach(t => {
      const fee = t.fee || 0;
      totalFees += fee;
      
      if (!feesByType[t.type]) {
        feesByType[t.type] = 0;
      }
      feesByType[t.type] += fee;
    });

    res.json({
      success: true,
      report: {
        totalFees,
        feesByType,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const wallet = await Wallet.findOne({ userId });
    const transactions = await Transaction.find({ userId });

    res.json({
      success: true,
      report: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          kycStatus: user.kycStatus,
          premiumStatus: user.premiumStatus
        },
        wallet: {
          balance: wallet?.balance || 0,
          currency: wallet?.currency || 'GNF'
        },
        statistics: {
          totalTransactions: transactions.length,
          totalDeposits: transactions.filter(t => t.type === 'deposit').length,
          totalInvestments: transactions.filter(t => t.type === 'investment').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


