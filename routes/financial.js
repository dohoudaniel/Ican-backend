const express = require('express');
const { query, param, body, validationResult } = require('express-validator');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Mock transactions data
const mockTransactions = [
  {
    id: '1',
    type: 'dues',
    amount: 25000,
    description: 'Annual membership dues 2024',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'ICAN-2024-001',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: '2',
    type: 'event',
    amount: 15000,
    description: 'Tax Law Updates Seminar',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    status: 'completed',
    reference: 'ICAN-2024-002',
    paymentMethod: 'Card'
  },
  {
    id: '3',
    type: 'cpd',
    amount: 5000,
    description: 'Digital Transformation CPD Module',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
    status: 'pending',
    reference: 'ICAN-2024-003',
    paymentMethod: 'Paystack'
  }
];

// @route   GET /api/financial/transactions
// @desc    Get user transactions with filtering and pagination
// @access  Private
router.get('/transactions', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('type').optional().isIn(['payment', 'refund', 'fee', 'dues']).withMessage('Invalid transaction type'),
  query('status').optional().isIn(['pending', 'completed', 'failed']).withMessage('Invalid status'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    status,
    dateFrom,
    dateTo
  } = req.query;

  let filteredTransactions = [...mockTransactions];

  // Apply filters
  if (type) {
    filteredTransactions = filteredTransactions.filter(t => t.type === type);
  }

  if (status) {
    filteredTransactions = filteredTransactions.filter(t => t.status === status);
  }

  if (dateFrom) {
    filteredTransactions = filteredTransactions.filter(t => new Date(t.date) >= new Date(dateFrom));
  }

  if (dateTo) {
    filteredTransactions = filteredTransactions.filter(t => new Date(t.date) <= new Date(dateTo));
  }

  // Sort by date (newest first)
  filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination
  const total = filteredTransactions.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: paginatedTransactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    }
  });
}));

// @route   GET /api/financial/balance
// @desc    Get user account balance and summary
// @access  Private
router.get('/balance', asyncHandler(async (req, res) => {
  const balance = {
    currentBalance: req.user.balance,
    pendingTransactions: mockTransactions.filter(t => t.status === 'pending').length,
    totalSpentThisYear: mockTransactions
      .filter(t => t.status === 'completed' && new Date(t.date).getFullYear() === new Date().getFullYear())
      .reduce((sum, t) => sum + t.amount, 0),
    lastTransaction: mockTransactions
      .filter(t => t.status === 'completed')
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
  };

  res.json({
    success: true,
    data: balance
  });
}));

// @route   POST /api/financial/payment
// @desc    Initiate a payment
// @access  Private
router.post('/payment', [
  body('type').isIn(['dues', 'event', 'cpd']).withMessage('Invalid payment type'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('description').trim().isLength({ min: 1, max: 200 }).withMessage('Description is required'),
  body('eventId').optional().trim(),
  body('cpdModuleId').optional().trim()
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { type, amount, description, eventId, cpdModuleId } = req.body;

  // Generate payment reference
  const reference = `ICAN-${new Date().getFullYear()}-${Date.now()}`;

  // In a real application, you would:
  // 1. Validate the payment request
  // 2. Initialize payment with Paystack or other payment provider
  // 3. Create a transaction record
  // 4. Return payment URL for redirect

  const paymentData = {
    reference,
    amount,
    description,
    type,
    paymentUrl: `https://checkout.paystack.com/pay/${reference}`,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
  };

  // Add to mock transactions
  mockTransactions.push({
    id: reference,
    type,
    amount,
    description,
    date: new Date(),
    status: 'pending',
    reference,
    paymentMethod: 'Paystack'
  });

  res.json({
    success: true,
    message: 'Payment initialized successfully',
    data: paymentData
  });
}));

// @route   GET /api/financial/payment/verify/:reference
// @desc    Verify payment status
// @access  Private
router.get('/payment/verify/:reference', [
  param('reference').notEmpty().withMessage('Payment reference is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { reference } = req.params;

  // Find transaction
  const transaction = mockTransactions.find(t => t.reference === reference);

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  // In a real application, you would verify with payment provider
  // For demo purposes, we'll randomly mark as completed or failed
  if (transaction.status === 'pending') {
    transaction.status = Math.random() > 0.2 ? 'completed' : 'failed';
    
    if (transaction.status === 'completed') {
      // Update user balance (in a real app, this would be more complex)
      // req.user.balance += transaction.amount;
      // await req.user.save();
    }
  }

  res.json({
    success: true,
    data: transaction
  });
}));

// @route   GET /api/financial/dues-status
// @desc    Get membership dues status
// @access  Private
router.get('/dues-status', asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  
  // Check if dues are paid for current year
  const duesTransaction = mockTransactions.find(t => 
    t.type === 'dues' && 
    t.status === 'completed' && 
    new Date(t.date).getFullYear() === currentYear
  );

  const duesStatus = {
    year: currentYear,
    isPaid: !!duesTransaction,
    amount: 25000, // Standard dues amount
    dueDate: new Date(currentYear, 11, 31), // December 31st
    paymentDate: duesTransaction?.date || null,
    daysUntilDue: Math.ceil((new Date(currentYear, 11, 31) - new Date()) / (1000 * 60 * 60 * 24))
  };

  res.json({
    success: true,
    data: duesStatus
  });
}));

// @route   GET /api/financial/payment-methods
// @desc    Get available payment methods
// @access  Private
router.get('/payment-methods', asyncHandler(async (req, res) => {
  const paymentMethods = [
    {
      id: 'paystack',
      name: 'Paystack',
      description: 'Pay with card, bank transfer, or USSD',
      fees: '1.5% + ₦100',
      isActive: true
    },
    {
      id: 'bank-transfer',
      name: 'Direct Bank Transfer',
      description: 'Transfer directly to ICAN account',
      fees: 'Bank charges apply',
      isActive: true,
      bankDetails: {
        accountName: 'Institute of Chartered Accountants of Nigeria',
        accountNumber: '1234567890',
        bankName: 'First Bank of Nigeria',
        sortCode: '011151003'
      }
    },
    {
      id: 'pos',
      name: 'POS Payment',
      description: 'Pay at any ICAN office',
      fees: 'No additional fees',
      isActive: true
    }
  ];

  res.json({
    success: true,
    data: paymentMethods
  });
}));

// @route   GET /api/financial/receipts/:transactionId
// @desc    Get payment receipt
// @access  Private
router.get('/receipts/:transactionId', [
  param('transactionId').notEmpty().withMessage('Transaction ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const transaction = mockTransactions.find(t => t.id === req.params.transactionId);

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  if (transaction.status !== 'completed') {
    throw new AppError('Receipt not available for incomplete transactions', 400);
  }

  // In a real application, you would generate a PDF receipt
  const receipt = {
    transactionId: transaction.id,
    reference: transaction.reference,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    paymentMethod: transaction.paymentMethod,
    userName: req.user.name,
    userEmail: req.user.email,
    membershipId: req.user.membershipId,
    receiptUrl: `https://example.com/receipts/${transaction.id}.pdf`
  };

  res.json({
    success: true,
    data: receipt
  });
}));

module.exports = router;
