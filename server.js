const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const dashboardRoutes = require("./routes/dashboard");
const cpdRoutes = require("./routes/cpd");
const eventsRoutes = require("./routes/events");
const financialRoutes = require("./routes/financial");
const votingRoutes = require("./routes/voting");
const chatRoutes = require("./routes/chat");
const notificationRoutes = require("./routes/notifications");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const { authenticateToken } = require("./middleware/auth");

const app = express();

// Trust proxy for production deployment (Render, Heroku, etc.)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/ican-hackathon";

// Rate limiting with proper configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path === "/health",
});

// Auth-specific rate limiting (more restrictive)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(limiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ICAN API Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", authenticateToken, userRoutes);
app.use("/api/dashboard", authenticateToken, dashboardRoutes);
app.use("/api/cpd", authenticateToken, cpdRoutes);
app.use("/api/events", authenticateToken, eventsRoutes);
app.use("/api/financial", authenticateToken, financialRoutes);
app.use("/api/voting", authenticateToken, votingRoutes);
app.use("/api/chat", authenticateToken, chatRoutes);
app.use("/api/notifications", authenticateToken, notificationRoutes);

// Socket.IO for real-time features
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    // Verify JWT token here
    // For now, we'll skip verification in development
    next();
  } else {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user to their personal room
  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined their personal room`);
  });

  // Join chat room
  socket.on("join-chat-room", (roomId) => {
    socket.join(`chat-${roomId}`);
    console.log(`User joined chat room: ${roomId}`);
  });

  // Handle chat messages
  socket.on("send-message", (data) => {
    // Broadcast message to chat room
    socket.to(`chat-${data.roomId}`).emit("new-message", data);
  });

  // Handle notifications
  socket.on("send-notification", (data) => {
    // Send notification to specific user
    socket.to(`user-${data.userId}`).emit("new-notification", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Database connection
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    startServer();
  })
  .catch((error) => {
    console.error("Database connection error:", error.message);
    console.log("Starting server without database connection...");
    startServer();
  });

function startServer() {
  server.listen(PORT, () => {
    console.log(`ICAN API Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = { app, io };
