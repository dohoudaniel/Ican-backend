const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['cpd', 'financial', 'event', 'general', 'chat', 'system'],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionText: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index for automatic deletion
  },
  channels: [{
    type: String,
    enum: ['in-app', 'email', 'sms', 'push'],
    default: ['in-app']
  }],
  sentChannels: [{
    channel: {
      type: String,
      enum: ['in-app', 'email', 'sms', 'push']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    error: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });

// Virtual for time since creation
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// Pre-save middleware to set expiration date if not provided
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Default expiration: 30 days for general notifications, 7 days for system notifications
    const daysToExpire = this.type === 'system' ? 7 : 30;
    this.expiresAt = new Date(Date.now() + daysToExpire * 24 * 60 * 60 * 1000);
  }
  next();
});

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

// Instance method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = undefined;
  return this.save();
};

// Static method to create notification for user
notificationSchema.statics.createForUser = function(userId, notificationData) {
  return this.create({
    userId,
    ...notificationData
  });
};

// Static method to create notification for multiple users
notificationSchema.statics.createForUsers = function(userIds, notificationData) {
  const notifications = userIds.map(userId => ({
    userId,
    ...notificationData
  }));
  return this.insertMany(notifications);
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsReadForUser = function(userId) {
  return this.updateMany(
    { userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date() 
    }
  );
};

// Static method to get notifications by type for user
notificationSchema.statics.getByTypeForUser = function(userId, type, limit = 10) {
  return this.find({ userId, type })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email');
};

// Static method to cleanup old notifications
notificationSchema.statics.cleanup = function() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    createdAt: { $lt: thirtyDaysAgo },
    isRead: true
  });
};

module.exports = mongoose.model('Notification', notificationSchema);
