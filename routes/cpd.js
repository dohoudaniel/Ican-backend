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

// Mock CPD modules data
const mockCPDModules = [
  {
    id: '1',
    title: 'Digital Transformation in Accounting',
    description: 'Learn about the latest digital tools and technologies transforming the accounting profession.',
    duration: 120, // minutes
    points: 5,
    category: 'Technology',
    status: 'available',
    imageUrl: 'https://example.com/digital-transformation.jpg',
    videoUrl: 'https://example.com/video1.mp4',
    documentsUrl: ['https://example.com/doc1.pdf'],
    instructor: 'Dr. Sarah Johnson',
    level: 'Intermediate'
  },
  {
    id: '2',
    title: 'Financial Reporting Standards Update',
    description: 'Stay current with the latest changes in financial reporting standards and regulations.',
    duration: 90,
    points: 4,
    category: 'Standards',
    status: 'available',
    imageUrl: 'https://example.com/financial-reporting.jpg',
    instructor: 'Prof. Michael Chen',
    level: 'Advanced'
  },
  {
    id: '3',
    title: 'Ethics in Professional Practice',
    description: 'Explore ethical considerations and best practices in professional accounting.',
    duration: 60,
    points: 3,
    category: 'Ethics',
    status: 'completed',
    progress: 100,
    completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    instructor: 'Dr. Amina Hassan',
    level: 'Beginner'
  }
];

// @route   GET /api/cpd/modules
// @desc    Get CPD modules with filtering and pagination
// @access  Private
router.get('/modules', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().trim(),
  query('status').optional().isIn(['available', 'in_progress', 'completed']).withMessage('Invalid status'),
  query('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    status,
    level,
    search
  } = req.query;

  let filteredModules = [...mockCPDModules];

  // Apply filters
  if (category) {
    filteredModules = filteredModules.filter(module => 
      module.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  if (status) {
    filteredModules = filteredModules.filter(module => module.status === status);
  }

  if (level) {
    filteredModules = filteredModules.filter(module => module.level === level);
  }

  if (search) {
    filteredModules = filteredModules.filter(module =>
      module.title.toLowerCase().includes(search.toLowerCase()) ||
      module.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Pagination
  const total = filteredModules.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedModules = filteredModules.slice(startIndex, endIndex);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: paginatedModules,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    }
  });
}));

// @route   GET /api/cpd/modules/:id
// @desc    Get specific CPD module
// @access  Private
router.get('/modules/:id', [
  param('id').notEmpty().withMessage('Module ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const module = mockCPDModules.find(m => m.id === req.params.id);

  if (!module) {
    throw new AppError('CPD module not found', 404);
  }

  res.json({
    success: true,
    data: module
  });
}));

// @route   POST /api/cpd/modules/:id/enroll
// @desc    Enroll in a CPD module
// @access  Private
router.post('/modules/:id/enroll', [
  param('id').notEmpty().withMessage('Module ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const module = mockCPDModules.find(m => m.id === req.params.id);

  if (!module) {
    throw new AppError('CPD module not found', 404);
  }

  if (module.status === 'completed') {
    throw new AppError('Module already completed', 400);
  }

  // In a real application, you would create an enrollment record
  // For now, we'll just update the module status
  module.status = 'in_progress';
  module.progress = 0;

  res.json({
    success: true,
    message: 'Successfully enrolled in CPD module',
    data: module
  });
}));

// @route   PUT /api/cpd/modules/:id/progress
// @desc    Update CPD module progress
// @access  Private
router.put('/modules/:id/progress', [
  param('id').notEmpty().withMessage('Module ID is required'),
  body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { progress } = req.body;
  const module = mockCPDModules.find(m => m.id === req.params.id);

  if (!module) {
    throw new AppError('CPD module not found', 404);
  }

  if (module.status === 'available') {
    throw new AppError('Must enroll in module first', 400);
  }

  // Update progress
  module.progress = progress;

  // Mark as completed if progress is 100%
  if (progress === 100) {
    module.status = 'completed';
    module.completedAt = new Date();
    
    // In a real application, you would also update user's CPD points
    // await User.findByIdAndUpdate(req.user._id, { $inc: { cpdPoints: module.points } });
  }

  res.json({
    success: true,
    message: 'Progress updated successfully',
    data: module
  });
}));

// @route   GET /api/cpd/my-progress
// @desc    Get user's CPD progress summary
// @access  Private
router.get('/my-progress', asyncHandler(async (req, res) => {
  // In a real application, this would be calculated from user's enrollment records
  const progress = {
    totalPoints: req.user.cpdPoints,
    requiredPoints: 40, // Annual requirement
    completedModules: mockCPDModules.filter(m => m.status === 'completed').length,
    inProgressModules: mockCPDModules.filter(m => m.status === 'in_progress').length,
    availableModules: mockCPDModules.filter(m => m.status === 'available').length,
    categories: {
      'Technology': 15,
      'Standards': 12,
      'Ethics': 8,
      'Leadership': 5
    },
    recentCompletions: mockCPDModules
      .filter(m => m.status === 'completed' && m.completedAt)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 5)
  };

  res.json({
    success: true,
    data: progress
  });
}));

// @route   GET /api/cpd/categories
// @desc    Get available CPD categories
// @access  Private
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = [
    { name: 'Technology', count: 15, description: 'Digital tools and emerging technologies' },
    { name: 'Standards', count: 12, description: 'Accounting standards and regulations' },
    { name: 'Ethics', count: 8, description: 'Professional ethics and conduct' },
    { name: 'Leadership', count: 6, description: 'Leadership and management skills' },
    { name: 'Taxation', count: 10, description: 'Tax laws and compliance' },
    { name: 'Audit', count: 9, description: 'Auditing principles and practices' }
  ];

  res.json({
    success: true,
    data: categories
  });
}));

// @route   GET /api/cpd/certificates/:moduleId
// @desc    Get CPD completion certificate
// @access  Private
router.get('/certificates/:moduleId', [
  param('moduleId').notEmpty().withMessage('Module ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const module = mockCPDModules.find(m => m.id === req.params.moduleId);

  if (!module) {
    throw new AppError('CPD module not found', 404);
  }

  if (module.status !== 'completed') {
    throw new AppError('Module not completed yet', 400);
  }

  // In a real application, you would generate a PDF certificate
  const certificate = {
    moduleId: module.id,
    moduleTitle: module.title,
    userName: req.user.name,
    completionDate: module.completedAt,
    points: module.points,
    certificateId: `ICAN-CPD-${module.id}-${req.user._id}`,
    downloadUrl: `https://example.com/certificates/${module.id}-${req.user._id}.pdf`
  };

  res.json({
    success: true,
    data: certificate
  });
}));

module.exports = router;
