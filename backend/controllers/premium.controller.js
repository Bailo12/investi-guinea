import { PremiumAccount, PremiumProject } from '../models/Premium.model.js';
import User from '../models/User.model.js';
import Wallet from '../models/Wallet.model.js';
import Transaction from '../models/Transaction.model.js';
import crypto from 'crypto';

// Calculate investment fee (5-10%)
const calculateFee = (amount) => {
  const feePercentage = amount >= 1000000 ? 0.05 : 0.10;
  return Math.round(amount * feePercentage);
};

export const getAccount = async (req, res) => {
  try {
    const account = await PremiumAccount.findOne({ userId: req.user._id });

    if (!account) {
      return res.json({ success: true, account: null });
    }

    // Check if expired
    if (account.endDate < new Date() && account.status === 'active') {
      account.status = 'expired';
      await account.save();
    }

    res.json({
      success: true,
      account: {
        id: account._id,
        plan: account.plan,
        status: account.status,
        startDate: account.startDate,
        endDate: account.endDate,
        autoRenew: account.autoRenew,
        benefits: account.benefits
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPlans = async (req, res) => {
  try {
    // In production, fetch from database
    const plans = [
      {
        id: 'basic',
        name: 'Basic',
        plan: 'basic',
        price: 50000,
        currency: 'GNF',
        duration: 1,
        features: [
          'Accès aux projets de base',
          'Support standard',
          'Frais réduits (8%)'
        ],
        benefits: [
          {
            name: 'Projets de base',
            description: 'Accès aux projets standard',
            type: 'exclusive-projects',
            enabled: true
          }
        ]
      },
      {
        id: 'premium',
        name: 'Premium',
        plan: 'premium',
        price: 150000,
        currency: 'GNF',
        duration: 1,
        features: [
          'Accès aux projets premium',
          'Immobilier et Or',
          'Support prioritaire',
          'Frais réduits (5%)',
          'Analyses avancées'
        ],
        benefits: [
          {
            name: 'Projets exclusifs',
            description: 'Immobilier et Or',
            type: 'exclusive-projects',
            enabled: true
          },
          {
            name: 'Frais réduits',
            description: '5% au lieu de 10%',
            type: 'lower-fees',
            enabled: true
          },
          {
            name: 'Support prioritaire',
            description: 'Support client prioritaire',
            type: 'priority-support',
            enabled: true
          }
        ]
      },
      {
        id: 'vip',
        name: 'VIP',
        plan: 'vip',
        price: 300000,
        currency: 'GNF',
        duration: 1,
        features: [
          'Tous les avantages Premium',
          'Accès anticipé',
          'Support dédié',
          'Frais réduits (3%)',
          'Analyses personnalisées'
        ],
        benefits: [
          {
            name: 'Tous les projets',
            description: 'Accès à tous les projets',
            type: 'exclusive-projects',
            enabled: true
          },
          {
            name: 'Frais réduits',
            description: '3% au lieu de 10%',
            type: 'lower-fees',
            enabled: true
          },
          {
            name: 'Support dédié',
            description: 'Support client dédié',
            type: 'priority-support',
            enabled: true
          },
          {
            name: 'Analyses avancées',
            description: 'Rapports personnalisés',
            type: 'advanced-analytics',
            enabled: true
          },
          {
            name: 'Accès anticipé',
            description: 'Accès en avant-première',
            type: 'early-access',
            enabled: true
          }
        ]
      }
    ];

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const subscribe = async (req, res) => {
  try {
    const { planId, paymentMethod, autoRenew } = req.body;

    // Get plan details (in production, fetch from database)
    const plans = {
      'basic': { plan: 'basic', duration: 1 },
      'premium': { plan: 'premium', duration: 1 },
      'vip': { plan: 'vip', duration: 1 }
    };

    const plan = plans[planId];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan' });
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    // Get or create premium account
    let account = await PremiumAccount.findOne({ userId: req.user._id });

    if (account && account.status === 'active') {
      return res.status(400).json({ message: 'Active subscription already exists' });
    }

    // In production, process payment here
    // For now, create account directly

    const benefits = await getBenefitsForPlan(plan.plan);

    if (account) {
      account.plan = plan.plan;
      account.status = 'active';
      account.startDate = startDate;
      account.endDate = endDate;
      account.autoRenew = autoRenew || false;
      account.benefits = benefits;
      await account.save();
    } else {
      account = await PremiumAccount.create({
        userId: req.user._id,
        plan: plan.plan,
        status: 'active',
        startDate,
        endDate,
        autoRenew: autoRenew || false,
        benefits
      });
    }

    // Update user premium status
    await User.findByIdAndUpdate(req.user._id, {
      premiumStatus: plan.plan,
      premiumExpiry: endDate
    });

    res.json({
      success: true,
      account: {
        id: account._id,
        plan: account.plan,
        status: account.status,
        startDate: account.startDate,
        endDate: account.endDate,
        autoRenew: account.autoRenew,
        benefits: account.benefits
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const account = await PremiumAccount.findOne({ userId: req.user._id });

    if (!account) {
      return res.status(404).json({ message: 'No active subscription' });
    }

    account.status = 'cancelled';
    account.autoRenew = false;
    await account.save();

    // Update user premium status
    await User.findByIdAndUpdate(req.user._id, {
      premiumStatus: 'none',
      premiumExpiry: null
    });

    res.json({
      success: true,
      message: 'Subscription cancelled'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const renewSubscription = async (req, res) => {
  try {
    const account = await PremiumAccount.findOne({ userId: req.user._id });

    if (!account) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    const endDate = new Date(account.endDate);
    endDate.setMonth(endDate.getMonth() + 1);

    account.endDate = endDate;
    account.status = 'active';
    await account.save();

    // Update user premium expiry
    await User.findByIdAndUpdate(req.user._id, {
      premiumExpiry: endDate
    });

    res.json({
      success: true,
      account: {
        id: account._id,
        plan: account.plan,
        status: account.status,
        endDate: account.endDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const isPremiumUser = async (req, res) => {
  try {
    const account = await PremiumAccount.findOne({ userId: req.user._id });
    const isPremium = account && account.status === 'active' && account.endDate > new Date();

    res.json({
      success: true,
      isPremium: !!isPremium
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPremiumProjects = async (req, res) => {
  try {
    const account = await PremiumAccount.findOne({ userId: req.user._id });
    const isPremium = account && account.status === 'active' && account.endDate > new Date();

    if (!isPremium) {
      return res.status(403).json({ message: 'Premium account required' });
    }

    const filter = { premiumOnly: true };
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const projects = await PremiumProject.find(filter).sort({ createdAt: -1 });

    res.json({
      success: true,
      projects: projects.map(p => ({
        id: p._id,
        name: p.name,
        type: p.type,
        category: p.category,
        description: p.description,
        minInvestment: p.minInvestment,
        maxInvestment: p.maxInvestment,
        expectedReturn: p.expectedReturn,
        riskLevel: p.riskLevel,
        location: p.location,
        imageUrl: p.imageUrl,
        status: p.status,
        premiumOnly: p.premiumOnly,
        createdAt: p.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getPremiumProject = async (req, res) => {
  try {
    const account = await PremiumAccount.findOne({ userId: req.user._id });
    const isPremium = account && account.status === 'active' && account.endDate > new Date();

    if (!isPremium) {
      return res.status(403).json({ message: 'Premium account required' });
    }

    const project = await PremiumProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      success: true,
      project: {
        id: project._id,
        name: project.name,
        type: project.type,
        category: project.category,
        description: project.description,
        minInvestment: project.minInvestment,
        maxInvestment: project.maxInvestment,
        expectedReturn: project.expectedReturn,
        riskLevel: project.riskLevel,
        location: project.location,
        imageUrl: project.imageUrl,
        documents: project.documents,
        status: project.status,
        createdAt: project.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const investInPremiumProject = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    const account = await PremiumAccount.findOne({ userId: req.user._id });
    const isPremium = account && account.status === 'active' && account.endDate > new Date();

    if (!isPremium) {
      return res.status(403).json({ message: 'Premium account required' });
    }

    const project = await PremiumProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.status !== 'active') {
      return res.status(400).json({ message: 'Project is not active' });
    }

    if (amount < project.minInvestment) {
      return res.status(400).json({ 
        message: `Minimum investment is ${project.minInvestment}` 
      });
    }

    if (project.maxInvestment && amount > project.maxInvestment) {
      return res.status(400).json({ 
        message: `Maximum investment is ${project.maxInvestment}` 
      });
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Premium users get lower fees
    const feePercentage = account.plan === 'vip' ? 0.03 : account.plan === 'premium' ? 0.05 : 0.08;
    const fee = Math.round(amount * feePercentage);
    const totalAmount = amount + fee;

    if (paymentMethod === 'wallet' && wallet.balance < totalAmount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      walletId: wallet._id,
      type: 'investment',
      amount: amount,
      fee,
      currency: wallet.currency,
      paymentMethod,
      reference: `PREMIUM-${crypto.randomUUID()}`,
      status: 'pending',
      description: `Premium investment in ${project.name}`,
      metadata: { projectId: project._id, premium: true }
    });

    if (paymentMethod === 'wallet') {
      wallet.balance -= totalAmount;
      await wallet.save();
    }

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

// Helper function
async function getBenefitsForPlan(plan) {
  const benefitsMap = {
    'basic': [
      { name: 'Projets de base', description: 'Accès aux projets standard', type: 'exclusive-projects', enabled: true }
    ],
    'premium': [
      { name: 'Projets exclusifs', description: 'Immobilier et Or', type: 'exclusive-projects', enabled: true },
      { name: 'Frais réduits', description: '5% au lieu de 10%', type: 'lower-fees', enabled: true },
      { name: 'Support prioritaire', description: 'Support client prioritaire', type: 'priority-support', enabled: true }
    ],
    'vip': [
      { name: 'Tous les projets', description: 'Accès à tous les projets', type: 'exclusive-projects', enabled: true },
      { name: 'Frais réduits', description: '3% au lieu de 10%', type: 'lower-fees', enabled: true },
      { name: 'Support dédié', description: 'Support client dédié', type: 'priority-support', enabled: true },
      { name: 'Analyses avancées', description: 'Rapports personnalisés', type: 'advanced-analytics', enabled: true },
      { name: 'Accès anticipé', description: 'Accès en avant-première', type: 'early-access', enabled: true }
    ]
  };

  return benefitsMap[plan] || [];
}


