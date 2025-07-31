const express = require("express");
const { query, param, validationResult } = require("express-validator");
const Notification = require("../models/Notification");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

const router = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Validation rules
const getNotificationsValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("type")
    .optional()
    .isIn(["cpd", "financial", "event", "general", "chat", "system"])
    .withMessage("Invalid notification type"),
  query("isRead")
    .optional()
    .isBoolean()
    .withMessage("isRead must be a boolean"),
  query("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Invalid priority level"),
];

// @route   GET /api/notifications
// @desc    Get user notifications with pagination and filtering
// @access  Private
router.get(
  "/",
  getNotificationsValidation,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      type,
      isRead,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = { userId: req.user._id };

    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === "true";
    if (priority) filter.priority = priority;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userId", "name email"),
      Notification.countDocuments(filter),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  })
);

// @route   GET /api/notifications/unread-count
// @desc    Get count of unread notifications
// @access  Private
router.get(
  "/unread-count",
  asyncHandler(async (req, res) => {
    const count = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: { count },
    });
  })
);

// @route   GET /api/notifications/summary
// @desc    Get notification summary by type
// @access  Private
router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Aggregate notifications by type
    const summary = await Notification.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: 1 },
          unread: {
            $sum: {
              $cond: [{ $eq: ["$isRead", false] }, 1, 0],
            },
          },
          urgent: {
            $sum: {
              $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          type: "$_id",
          total: 1,
          unread: 1,
          urgent: 1,
          _id: 0,
        },
      },
    ]);

    // Convert array to object for easier frontend consumption
    const summaryObject = summary.reduce((acc, item) => {
      acc[item.type] = {
        total: item.total,
        unread: item.unread,
        urgent: item.urgent,
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: summaryObject,
    });
  })
);

// @route   GET /api/notifications/:id
// @desc    Get specific notification
// @access  Private
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid notification ID")],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("userId", "name email");

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    res.json({
      success: true,
      data: notification,
    });
  })
);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put(
  "/:id/read",
  [param("id").isMongoId().withMessage("Invalid notification ID")],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  })
);

// @route   PUT /api/notifications/:id/unread
// @desc    Mark notification as unread
// @access  Private
router.put(
  "/:id/unread",
  [param("id").isMongoId().withMessage("Invalid notification ID")],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    await notification.markAsUnread();

    res.json({
      success: true,
      message: "Notification marked as unread",
      data: notification,
    });
  })
);

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put(
  "/mark-all-read",
  asyncHandler(async (req, res) => {
    const result = await Notification.markAllAsReadForUser(req.user._id);

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
    });
  })
);

// @route   DELETE /api/notifications/clear-read
// @desc    Delete all read notifications
// @access  Private
router.delete(
  "/clear-read",
  asyncHandler(async (req, res) => {
    const result = await Notification.deleteMany({
      userId: req.user._id,
      isRead: true,
    });

    res.json({
      success: true,
      message: `${result.deletedCount} read notifications deleted`,
    });
  })
);

// @route   GET /api/notifications/recent/:type
// @desc    Get recent notifications by type
// @access  Private
router.get(
  "/recent/:type",
  [
    param("type")
      .isIn(["cpd", "financial", "event", "general", "chat", "system"])
      .withMessage("Invalid notification type"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { type } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const notifications = await Notification.getByTypeForUser(
      req.user._id,
      type,
      limit
    );

    res.json({
      success: true,
      data: notifications,
    });
  })
);

// @route   DELETE /api/notifications/:id
// @desc    Delete specific notification
// @access  Private
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid notification ID")],
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    res.json({
      success: true,
      message: "Notification deleted successfully",
    });
  })
);

module.exports = router;
