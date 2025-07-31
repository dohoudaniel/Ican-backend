const express = require('express');
const { query, param, validationResult } = require('express-validator');
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

// Mock events data
const mockEvents = [
  {
    id: '1',
    title: 'Annual ICAN Conference 2024',
    description: 'Join us for the premier accounting conference featuring industry leaders and cutting-edge insights.',
    date: '2024-06-15',
    time: '09:00',
    location: 'Lagos Continental Hotel, Victoria Island',
    type: 'conference',
    cpdPoints: 8,
    fee: 50000,
    isRegistered: false,
    capacity: 500,
    registeredCount: 342,
    imageUrl: 'https://example.com/conference2024.jpg',
    organizer: 'ICAN National Secretariat',
    agenda: [
      { time: '09:00', title: 'Registration & Welcome Coffee' },
      { time: '10:00', title: 'Keynote: Future of Accounting' },
      { time: '11:30', title: 'Panel: Digital Transformation' }
    ]
  },
  {
    id: '2',
    title: 'Financial Reporting Workshop',
    description: 'Hands-on workshop covering the latest financial reporting standards and best practices.',
    date: '2024-04-20',
    time: '14:00',
    location: 'ICAN House, Abuja',
    type: 'workshop',
    cpdPoints: 5,
    fee: 25000,
    isRegistered: true,
    capacity: 50,
    registeredCount: 38,
    organizer: 'ICAN Abuja District',
    level: 'Intermediate'
  },
  {
    id: '3',
    title: 'Tax Law Updates Seminar',
    description: 'Stay current with the latest changes in Nigerian tax laws and regulations.',
    date: '2024-05-10',
    time: '10:00',
    location: 'Online (Zoom)',
    type: 'seminar',
    cpdPoints: 3,
    fee: 15000,
    isRegistered: false,
    capacity: 200,
    registeredCount: 156,
    organizer: 'ICAN Tax Committee',
    isOnline: true
  }
];

// @route   GET /api/events
// @desc    Get events with filtering and pagination
// @access  Private
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['seminar', 'workshop', 'conference', 'webinar']).withMessage('Invalid event type'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    type,
    dateFrom,
    dateTo,
    search,
    registered
  } = req.query;

  let filteredEvents = [...mockEvents];

  // Apply filters
  if (type) {
    filteredEvents = filteredEvents.filter(event => event.type === type);
  }

  if (dateFrom) {
    filteredEvents = filteredEvents.filter(event => new Date(event.date) >= new Date(dateFrom));
  }

  if (dateTo) {
    filteredEvents = filteredEvents.filter(event => new Date(event.date) <= new Date(dateTo));
  }

  if (search) {
    filteredEvents = filteredEvents.filter(event =>
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (registered !== undefined) {
    const isRegistered = registered === 'true';
    filteredEvents = filteredEvents.filter(event => event.isRegistered === isRegistered);
  }

  // Sort by date (upcoming first)
  filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Pagination
  const total = filteredEvents.length;
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const endIndex = startIndex + parseInt(limit);
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  const totalPages = Math.ceil(total / parseInt(limit));

  res.json({
    success: true,
    data: paginatedEvents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    }
  });
}));

// @route   GET /api/events/:id
// @desc    Get specific event
// @access  Private
router.get('/:id', [
  param('id').notEmpty().withMessage('Event ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const event = mockEvents.find(e => e.id === req.params.id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  res.json({
    success: true,
    data: event
  });
}));

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Private
router.post('/:id/register', [
  param('id').notEmpty().withMessage('Event ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const event = mockEvents.find(e => e.id === req.params.id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (event.isRegistered) {
    throw new AppError('Already registered for this event', 400);
  }

  if (event.registeredCount >= event.capacity) {
    throw new AppError('Event is fully booked', 400);
  }

  // Check if event date has passed
  const eventDate = new Date(event.date);
  if (eventDate < new Date()) {
    throw new AppError('Cannot register for past events', 400);
  }

  // In a real application, you would:
  // 1. Create a registration record
  // 2. Process payment if required
  // 3. Send confirmation email
  // 4. Update event registration count

  event.isRegistered = true;
  event.registeredCount += 1;

  res.json({
    success: true,
    message: 'Successfully registered for event',
    data: {
      eventId: event.id,
      eventTitle: event.title,
      registrationDate: new Date(),
      fee: event.fee,
      cpdPoints: event.cpdPoints
    }
  });
}));

// @route   DELETE /api/events/:id/unregister
// @desc    Unregister from an event
// @access  Private
router.delete('/:id/unregister', [
  param('id').notEmpty().withMessage('Event ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const event = mockEvents.find(e => e.id === req.params.id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  if (!event.isRegistered) {
    throw new AppError('Not registered for this event', 400);
  }

  // Check if event is within 24 hours (cancellation policy)
  const eventDate = new Date(event.date);
  const now = new Date();
  const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);

  if (hoursUntilEvent < 24) {
    throw new AppError('Cannot unregister within 24 hours of event', 400);
  }

  // In a real application, you would:
  // 1. Delete registration record
  // 2. Process refund if applicable
  // 3. Send cancellation confirmation
  // 4. Update event registration count

  event.isRegistered = false;
  event.registeredCount -= 1;

  res.json({
    success: true,
    message: 'Successfully unregistered from event'
  });
}));

// @route   GET /api/events/my-registrations
// @desc    Get user's event registrations
// @access  Private
router.get('/my/registrations', asyncHandler(async (req, res) => {
  const registeredEvents = mockEvents.filter(event => event.isRegistered);

  // Separate into upcoming and past events
  const now = new Date();
  const upcomingEvents = registeredEvents.filter(event => new Date(event.date) >= now);
  const pastEvents = registeredEvents.filter(event => new Date(event.date) < now);

  res.json({
    success: true,
    data: {
      upcoming: upcomingEvents,
      past: pastEvents,
      totalRegistrations: registeredEvents.length
    }
  });
}));

// @route   GET /api/events/categories
// @desc    Get event categories/types
// @access  Private
router.get('/meta/categories', asyncHandler(async (req, res) => {
  const categories = [
    { type: 'conference', name: 'Conferences', count: 5, description: 'Large-scale professional gatherings' },
    { type: 'workshop', name: 'Workshops', count: 12, description: 'Hands-on learning sessions' },
    { type: 'seminar', name: 'Seminars', count: 8, description: 'Educational presentations' },
    { type: 'webinar', name: 'Webinars', count: 15, description: 'Online learning sessions' }
  ];

  res.json({
    success: true,
    data: categories
  });
}));

// @route   GET /api/events/upcoming
// @desc    Get upcoming events (next 30 days)
// @access  Private
router.get('/filter/upcoming', asyncHandler(async (req, res) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const upcomingEvents = mockEvents.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= now && eventDate <= thirtyDaysFromNow;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json({
    success: true,
    data: upcomingEvents
  });
}));

// @route   GET /api/events/:id/attendees
// @desc    Get event attendees (for organizers/admins)
// @access  Private (would need admin role check)
router.get('/:id/attendees', [
  param('id').notEmpty().withMessage('Event ID is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const event = mockEvents.find(e => e.id === req.params.id);

  if (!event) {
    throw new AppError('Event not found', 404);
  }

  // In a real application, you would check if user has permission to view attendees
  // and fetch actual attendee data from registration records

  const mockAttendees = [
    { id: '1', name: 'John Doe', email: 'john@example.com', registrationDate: '2024-03-01' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', registrationDate: '2024-03-02' }
  ];

  res.json({
    success: true,
    data: {
      event: event.title,
      totalAttendees: event.registeredCount,
      attendees: mockAttendees
    }
  });
}));

module.exports = router;
