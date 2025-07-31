const express = require("express");
const User = require("../models/User");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // In a real application, these would be calculated from various models
    // For now, we'll return mock data with some real user data
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Mock statistics - in production, these would be calculated from actual data
    const stats = {
      totalMembers: await User.countDocuments({ isActive: true }),
      upcomingEvents: Math.floor(Math.random() * 10) + 1, // Mock data
      activeCPDModules: Math.floor(Math.random() * 15) + 5, // Mock data
      pendingPayments: Math.floor(Math.random() * 3), // Mock data
      unreadNotifications: Math.floor(Math.random() * 8) + 1, // Mock data
      userStats: {
        cpdPoints: user.cpdPoints,
        balance: user.balance,
        membershipLevel: user.membershipLevel,
        memberSince: user.dateJoined,
        completedCPDModules: Math.floor(Math.random() * 20), // Mock data
        attendedEvents: Math.floor(Math.random() * 15), // Mock data
        totalTransactions: Math.floor(Math.random() * 25) + 5, // Mock data
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  })
);

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent user activity
// @access  Private
router.get(
  "/recent-activity",
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    // Mock recent activity data
    // In production, this would come from an activity log model
    const activities = [
      {
        id: "1",
        type: "cpd",
        title: "Completed CPD Module",
        description: "Digital Transformation in Accounting",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        points: 5,
      },
      {
        id: "2",
        type: "payment",
        title: "Payment Successful",
        description: "Annual membership dues",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        amount: 25000,
      },
      {
        id: "3",
        type: "event",
        title: "Event Registration",
        description: "Registered for Financial Reporting Workshop",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: "4",
        type: "profile",
        title: "Profile Updated",
        description: "Updated contact information",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: "5",
        type: "voting",
        title: "Participated in Survey",
        description: "Professional Development Needs Assessment",
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      },
    ].slice(0, limit);

    res.json({
      success: true,
      data: activities,
    });
  })
);

// @route   GET /api/dashboard/quick-stats
// @desc    Get quick statistics for dashboard cards
// @access  Private
router.get(
  "/quick-stats",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Quick stats for dashboard cards
    const quickStats = [
      {
        title: "CPD Points",
        value: user.cpdPoints,
        icon: "school",
        color: "#38a169",
        trend: "+12%",
        subtitle: "This month",
      },
      {
        title: "Account Balance",
        value: `₦${user.balance.toLocaleString()}`,
        icon: "wallet",
        color: "#3182ce",
        trend: null,
        subtitle: "Available balance",
      },
      {
        title: "Events Attended",
        value: Math.floor(Math.random() * 15) + 5, // Mock data
        icon: "calendar",
        color: "#d69e2e",
        trend: "+3",
        subtitle: "This year",
      },
      {
        title: "Membership Level",
        value: user.membershipLevel,
        icon: "star",
        color: "#9f7aea",
        trend: null,
        subtitle: `Since ${user.dateJoined.getFullYear()}`,
      },
    ];

    res.json({
      success: true,
      data: quickStats,
    });
  })
);

// @route   GET /api/dashboard/announcements
// @desc    Get important announcements
// @access  Private
router.get(
  "/announcements",
  asyncHandler(async (req, res) => {
    // Mock announcements data
    // In production, this would come from an announcements model
    const announcements = [
      {
        id: "1",
        title: "New CPD Requirements",
        message:
          "Updated CPD requirements for 2024 are now available. Please review the new guidelines.",
        type: "important",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isRead: false,
      },
      {
        id: "2",
        title: "Annual Conference Registration",
        message:
          "Early bird registration for the 2024 Annual Conference is now open. Register before March 31st for discounted rates.",
        type: "event",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isRead: false,
      },
      {
        id: "3",
        title: "System Maintenance",
        message:
          "Scheduled maintenance on Sunday, March 15th from 2:00 AM to 4:00 AM. Some services may be temporarily unavailable.",
        type: "maintenance",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isRead: true,
      },
    ];

    res.json({
      success: true,
      data: announcements,
    });
  })
);

// @route   GET /api/dashboard/upcoming-deadlines
// @desc    Get upcoming deadlines and important dates
// @access  Private
router.get(
  "/upcoming-deadlines",
  asyncHandler(async (req, res) => {
    // Mock deadlines data
    // In production, this would be calculated from various models
    const deadlines = [
      {
        id: "1",
        title: "CPD Submission Deadline",
        description: "Submit your CPD hours for Q1 2024",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        type: "cpd",
        priority: "high",
      },
      {
        id: "2",
        title: "Annual Membership Renewal",
        description: "Renew your membership for 2024",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
        type: "membership",
        priority: "medium",
      },
      {
        id: "3",
        title: "Professional Ethics Course",
        description: "Complete mandatory ethics training",
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        type: "training",
        priority: "medium",
      },
    ];

    res.json({
      success: true,
      data: deadlines,
    });
  })
);

// @route   POST /api/dashboard/mark-announcement-read/:id
// @desc    Mark announcement as read
// @access  Private
router.post(
  "/mark-announcement-read/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // In production, you would update the announcement read status in the database
    // For now, we'll just return success

    res.json({
      success: true,
      message: "Announcement marked as read",
    });
  })
);

// @route   GET /api/dashboard/weather
// @desc    Get weather information (for location-based features)
// @access  Private
router.get(
  "/weather",
  asyncHandler(async (req, res) => {
    // Mock weather data
    // In production, you might integrate with a weather API
    const weather = {
      location: "Lagos, Nigeria",
      temperature: Math.floor(Math.random() * 10) + 25, // 25-35°C
      condition: "Partly Cloudy",
      humidity: Math.floor(Math.random() * 30) + 60, // 60-90%
      icon: "partly-cloudy",
    };

    res.json({
      success: true,
      data: weather,
    });
  })
);

module.exports = router;
