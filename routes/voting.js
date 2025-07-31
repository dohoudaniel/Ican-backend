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

// Mock polls data
const mockPolls = [
  {
    id: '1',
    title: 'Professional Development Priorities for 2024',
    description: 'Help us understand what professional development areas are most important to you.',
    options: [
      { id: 'opt1', text: 'Digital Skills & Technology', votes: 145 },
      { id: 'opt2', text: 'Leadership & Management', votes: 98 },
      { id: 'opt3', text: 'Regulatory Updates', votes: 167 },
      { id: 'opt4', text: 'Ethics & Professional Conduct', votes: 89 }
    ],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    hasVoted: false,
    totalVotes: 499,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    category: 'professional-development',
    isActive: true
  },
  {
    id: '2',
    title: 'Preferred Format for CPD Programs',
    description: 'Which format do you prefer for continuing professional development programs?',
    options: [
      { id: 'opt1', text: 'In-person workshops', votes: 234 },
      { id: 'opt2', text: 'Online webinars', votes: 189 },
      { id: 'opt3', text: 'Hybrid (both online and in-person)', votes: 156 },
      { id: 'opt4', text: 'Self-paced online modules', votes: 98 }
    ],
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    hasVoted: true,
    totalVotes: 677,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    category: 'cpd',
    isActive: true,
    userVote: 'opt2'
  },
  {
    id: '3',
    title: 'Annual Conference Theme Selection',
    description: 'Vote for the theme of the 2024 Annual ICAN Conference.',
    options: [
      { id: 'opt1', text: 'Sustainability in Accounting', votes: 78 },
      { id: 'opt2', text: 'AI and the Future of Finance', votes: 134 },
      { id: 'opt3', text: 'Ethical Leadership in Business', votes: 92 },
      { id: 'opt4', text: 'Digital Transformation Journey', votes: 67 }
    ],
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Ended 5 days ago
    hasVoted: true,
    totalVotes: 371,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    category: 'events',
    isActive: false,
    userVote: 'opt2'
  }
];

// @route   GET /api/voting/polls
// @desc    Get polls with filtering and pagination
// @access  Private
router.get('/polls', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().trim(),
  query('status').optional().isIn(['active', 'ended', 'all']).withMessage('Invalid status'),
  query('hasVoted').optional().isBoolean().withMessage('hasVoted must be a boolean')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    status = 'all',
    hasVoted,
    search
  } = req.query;

  let filteredPolls = [...mockPolls];

  // Apply filters
  if (category) {
    filteredPolls = filteredPolls.filter(poll => poll.category === category);
  }

  if (status !== 'all') {
    const now = new Date();
    if (status === 'active') {
      filteredPolls = filteredPolls.filter(poll => poll.endDate > now);
    } else if (status === 'ended') {
      filteredPolls = filteredPolls.filter(poll => poll.endDate <= now);
    }
  }

  if (hasVoted !== undefined) {
    const voted = hasVoted === 'true';
    filteredPolls = filteredPolls.filter(poll => poll.hasVoted === voted);
  }

  if (search) {
    filteredPolls = filteredPolls.filter(poll =>
      poll.title.toLowerCase().includes(search.toLowerCase()) ||
      poll.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sort by creation date (newest first)
  filteredPolls.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Pagination
  const total = filteredPolls.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedPolls = filteredPolls.slice(startIndex, endIndex);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: paginatedPolls,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    }
  });
}));

// @route   GET /api/voting/polls/:id
// @desc    Get specific poll
// @access  Private
router.get('/polls/:id', [
  param('id').notEmpty().withMessage('Poll ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const poll = mockPolls.find(p => p.id === req.params.id);

  if (!poll) {
    throw new AppError('Poll not found', 404);
  }

  res.json({
    success: true,
    data: poll
  });
}));

// @route   POST /api/voting/polls/:id/vote
// @desc    Vote in a poll
// @access  Private
router.post('/polls/:id/vote', [
  param('id').notEmpty().withMessage('Poll ID is required'),
  body('optionId').notEmpty().withMessage('Option ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { optionId } = req.body;
  const poll = mockPolls.find(p => p.id === req.params.id);

  if (!poll) {
    throw new AppError('Poll not found', 404);
  }

  // Check if poll is still active
  if (new Date() > poll.endDate) {
    throw new AppError('Poll has ended', 400);
  }

  // Check if user has already voted
  if (poll.hasVoted) {
    throw new AppError('You have already voted in this poll', 400);
  }

  // Find the selected option
  const selectedOption = poll.options.find(opt => opt.id === optionId);
  if (!selectedOption) {
    throw new AppError('Invalid option selected', 400);
  }

  // In a real application, you would:
  // 1. Create a vote record in the database
  // 2. Update poll statistics
  // 3. Ensure vote anonymity and integrity

  // Update mock data
  selectedOption.votes += 1;
  poll.totalVotes += 1;
  poll.hasVoted = true;
  poll.userVote = optionId;

  res.json({
    success: true,
    message: 'Vote recorded successfully',
    data: {
      pollId: poll.id,
      selectedOption: optionId,
      votedAt: new Date()
    }
  });
}));

// @route   GET /api/voting/my-votes
// @desc    Get user's voting history
// @access  Private
router.get('/my-votes', asyncHandler(async (req, res) => {
  const votedPolls = mockPolls.filter(poll => poll.hasVoted);

  const votingHistory = votedPolls.map(poll => ({
    pollId: poll.id,
    pollTitle: poll.title,
    selectedOption: poll.options.find(opt => opt.id === poll.userVote),
    votedAt: poll.createdAt, // In real app, this would be the actual vote date
    pollStatus: new Date() > poll.endDate ? 'ended' : 'active'
  }));

  res.json({
    success: true,
    data: {
      totalVotes: votingHistory.length,
      votes: votingHistory
    }
  });
}));

// @route   GET /api/voting/categories
// @desc    Get voting categories
// @access  Private
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = [
    { 
      id: 'professional-development', 
      name: 'Professional Development', 
      count: 5,
      description: 'Polls about CPD and skill development'
    },
    { 
      id: 'cpd', 
      name: 'CPD Programs', 
      count: 3,
      description: 'Feedback on CPD program formats and content'
    },
    { 
      id: 'events', 
      name: 'Events & Conferences', 
      count: 4,
      description: 'Input on event themes and formats'
    },
    { 
      id: 'governance', 
      name: 'Institute Governance', 
      count: 2,
      description: 'Polls about ICAN policies and governance'
    },
    { 
      id: 'general', 
      name: 'General Feedback', 
      count: 6,
      description: 'General surveys and feedback requests'
    }
  ];

  res.json({
    success: true,
    data: categories
  });
}));

// @route   GET /api/voting/stats
// @desc    Get voting statistics
// @access  Private
router.get('/stats', asyncHandler(async (req, res) => {
  const now = new Date();
  const activePolls = mockPolls.filter(poll => poll.endDate > now);
  const endedPolls = mockPolls.filter(poll => poll.endDate <= now);
  const userVotes = mockPolls.filter(poll => poll.hasVoted);

  const stats = {
    totalPolls: mockPolls.length,
    activePolls: activePolls.length,
    endedPolls: endedPolls.length,
    userParticipation: {
      totalVotes: userVotes.length,
      participationRate: Math.round((userVotes.length / mockPolls.length) * 100)
    },
    recentActivity: {
      newPollsThisMonth: mockPolls.filter(poll => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return poll.createdAt > monthAgo;
      }).length,
      votesThisMonth: userVotes.filter(poll => {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return poll.createdAt > monthAgo; // In real app, this would be vote date
      }).length
    }
  };

  res.json({
    success: true,
    data: stats
  });
}));

// @route   GET /api/voting/polls/:id/results
// @desc    Get poll results (detailed)
// @access  Private
router.get('/polls/:id/results', [
  param('id').notEmpty().withMessage('Poll ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const poll = mockPolls.find(p => p.id === req.params.id);

  if (!poll) {
    throw new AppError('Poll not found', 404);
  }

  // Calculate percentages
  const results = poll.options.map(option => ({
    ...option,
    percentage: poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0
  }));

  // Sort by votes (highest first)
  results.sort((a, b) => b.votes - a.votes);

  const pollResults = {
    pollId: poll.id,
    title: poll.title,
    description: poll.description,
    totalVotes: poll.totalVotes,
    endDate: poll.endDate,
    isEnded: new Date() > poll.endDate,
    hasVoted: poll.hasVoted,
    userVote: poll.userVote,
    results,
    winner: results[0] // Option with most votes
  };

  res.json({
    success: true,
    data: pollResults
  });
}));

module.exports = router;
