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

// Mock chat rooms data
const mockChatRooms = [
  {
    id: '1',
    name: 'General Discussion',
    description: 'General discussions about accounting and professional topics',
    type: 'general',
    memberCount: 1247,
    isJoined: true,
    lastMessage: {
      id: 'msg1',
      senderId: 'user123',
      senderName: 'John Doe',
      message: 'Has anyone attended the new digital accounting workshop?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'text'
    }
  },
  {
    id: '2',
    name: 'CPD Study Group',
    description: 'Collaborative learning and CPD discussions',
    type: 'cpd',
    memberCount: 456,
    isJoined: true,
    lastMessage: {
      id: 'msg2',
      senderId: 'user456',
      senderName: 'Jane Smith',
      message: 'Sharing notes from the ethics module',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: 'text'
    }
  },
  {
    id: '3',
    name: 'Lagos Regional Chapter',
    description: 'Discussions for Lagos chapter members',
    type: 'regional',
    memberCount: 789,
    isJoined: false,
    lastMessage: {
      id: 'msg3',
      senderId: 'user789',
      senderName: 'Mike Johnson',
      message: 'Next chapter meeting scheduled for Friday',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      type: 'text'
    }
  }
];

// Mock messages data
const mockMessages = {
  '1': [
    {
      id: 'msg1',
      senderId: 'user123',
      senderName: 'John Doe',
      message: 'Has anyone attended the new digital accounting workshop?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'text'
    },
    {
      id: 'msg2',
      senderId: 'user456',
      senderName: 'Jane Smith',
      message: 'Yes, it was very informative! Highly recommend it.',
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      type: 'text'
    },
    {
      id: 'msg3',
      senderId: 'current-user',
      senderName: 'You',
      message: 'Thanks for the recommendation! I\'ll sign up.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: 'text'
    }
  ]
};

// @route   GET /api/chat/rooms
// @desc    Get chat rooms
// @access  Private
router.get('/rooms', asyncHandler(async (req, res) => {
  const { type, joined } = req.query;

  let filteredRooms = [...mockChatRooms];

  // Apply filters
  if (type) {
    filteredRooms = filteredRooms.filter(room => room.type === type);
  }

  if (joined !== undefined) {
    const isJoined = joined === 'true';
    filteredRooms = filteredRooms.filter(room => room.isJoined === isJoined);
  }

  // Sort by last message timestamp
  filteredRooms.sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(0);
    const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(0);
    return bTime - aTime;
  });

  res.json({
    success: true,
    data: filteredRooms
  });
}));

// @route   GET /api/chat/rooms/:id/messages
// @desc    Get messages from a chat room
// @access  Private
router.get('/rooms/:id/messages', [
  param('id').notEmpty().withMessage('Room ID is required'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Check if room exists
  const room = mockChatRooms.find(r => r.id === id);
  if (!room) {
    throw new AppError('Chat room not found', 404);
  }

  // Check if user is a member of the room
  if (!room.isJoined) {
    throw new AppError('You must join the room to view messages', 403);
  }

  // Get messages for the room
  const messages = mockMessages[id] || [];

  // Sort by timestamp (newest first for pagination, but reverse for display)
  const sortedMessages = [...messages].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Pagination
  const total = sortedMessages.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedMessages = sortedMessages.slice(startIndex, endIndex);

  // Reverse for chronological order (oldest first)
  paginatedMessages.reverse();

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: paginatedMessages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    }
  });
}));

// @route   POST /api/chat/rooms/:id/messages
// @desc    Send a message to a chat room
// @access  Private
router.post('/rooms/:id/messages', [
  param('id').notEmpty().withMessage('Room ID is required'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters'),
  body('type').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message, type = 'text', fileUrl, fileName } = req.body;

  // Check if room exists
  const room = mockChatRooms.find(r => r.id === id);
  if (!room) {
    throw new AppError('Chat room not found', 404);
  }

  // Check if user is a member of the room
  if (!room.isJoined) {
    throw new AppError('You must join the room to send messages', 403);
  }

  // Create new message
  const newMessage = {
    id: `msg-${Date.now()}`,
    senderId: req.user._id.toString(),
    senderName: req.user.name,
    message,
    timestamp: new Date(),
    type,
    ...(fileUrl && { fileUrl }),
    ...(fileName && { fileName })
  };

  // Add message to mock data
  if (!mockMessages[id]) {
    mockMessages[id] = [];
  }
  mockMessages[id].push(newMessage);

  // Update room's last message
  room.lastMessage = newMessage;

  // In a real application, you would:
  // 1. Save message to database
  // 2. Emit message to all room members via Socket.IO
  // 3. Send push notifications if needed

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: newMessage
  });
}));

// @route   POST /api/chat/rooms/:id/join
// @desc    Join a chat room
// @access  Private
router.post('/rooms/:id/join', [
  param('id').notEmpty().withMessage('Room ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if room exists
  const room = mockChatRooms.find(r => r.id === id);
  if (!room) {
    throw new AppError('Chat room not found', 404);
  }

  // Check if already joined
  if (room.isJoined) {
    throw new AppError('Already a member of this room', 400);
  }

  // Join room
  room.isJoined = true;
  room.memberCount += 1;

  // In a real application, you would:
  // 1. Create a room membership record
  // 2. Add user to Socket.IO room
  // 3. Send welcome message or notification

  res.json({
    success: true,
    message: 'Successfully joined the chat room',
    data: room
  });
}));

// @route   DELETE /api/chat/rooms/:id/leave
// @desc    Leave a chat room
// @access  Private
router.delete('/rooms/:id/leave', [
  param('id').notEmpty().withMessage('Room ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if room exists
  const room = mockChatRooms.find(r => r.id === id);
  if (!room) {
    throw new AppError('Chat room not found', 404);
  }

  // Check if user is a member
  if (!room.isJoined) {
    throw new AppError('Not a member of this room', 400);
  }

  // Leave room
  room.isJoined = false;
  room.memberCount -= 1;

  // In a real application, you would:
  // 1. Delete room membership record
  // 2. Remove user from Socket.IO room
  // 3. Send leave notification if needed

  res.json({
    success: true,
    message: 'Successfully left the chat room'
  });
}));

// @route   GET /api/chat/my-rooms
// @desc    Get rooms user has joined
// @access  Private
router.get('/my-rooms', asyncHandler(async (req, res) => {
  const joinedRooms = mockChatRooms.filter(room => room.isJoined);

  // Sort by last message timestamp
  joinedRooms.sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp) : new Date(0);
    const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp) : new Date(0);
    return bTime - aTime;
  });

  res.json({
    success: true,
    data: joinedRooms
  });
}));

// @route   GET /api/chat/room-types
// @desc    Get available room types
// @access  Private
router.get('/room-types', asyncHandler(async (req, res) => {
  const roomTypes = [
    {
      type: 'general',
      name: 'General',
      description: 'Open discussions for all members',
      count: mockChatRooms.filter(r => r.type === 'general').length
    },
    {
      type: 'cpd',
      name: 'CPD Study Groups',
      description: 'Collaborative learning and study groups',
      count: mockChatRooms.filter(r => r.type === 'cpd').length
    },
    {
      type: 'regional',
      name: 'Regional Chapters',
      description: 'Location-based chapter discussions',
      count: mockChatRooms.filter(r => r.type === 'regional').length
    },
    {
      type: 'private',
      name: 'Private Groups',
      description: 'Invitation-only private discussions',
      count: mockChatRooms.filter(r => r.type === 'private').length
    }
  ];

  res.json({
    success: true,
    data: roomTypes
  });
}));

// @route   GET /api/chat/search
// @desc    Search messages across rooms
// @access  Private
router.get('/search', [
  query('q').trim().isLength({ min: 1 }).withMessage('Search query is required'),
  query('roomId').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { q, roomId, limit = 20 } = req.query;

  let searchResults = [];

  // Search in specific room or all joined rooms
  const roomsToSearch = roomId 
    ? [roomId] 
    : mockChatRooms.filter(r => r.isJoined).map(r => r.id);

  roomsToSearch.forEach(rId => {
    const messages = mockMessages[rId] || [];
    const matchingMessages = messages.filter(msg =>
      msg.message.toLowerCase().includes(q.toLowerCase())
    );

    matchingMessages.forEach(msg => {
      const room = mockChatRooms.find(r => r.id === rId);
      searchResults.push({
        ...msg,
        roomId: rId,
        roomName: room?.name
      });
    });
  });

  // Sort by timestamp (newest first)
  searchResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Limit results
  searchResults = searchResults.slice(0, parseInt(limit));

  res.json({
    success: true,
    data: {
      query: q,
      results: searchResults,
      totalFound: searchResults.length
    }
  });
}));

module.exports = router;
