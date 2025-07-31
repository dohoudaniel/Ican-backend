# ICAN ExamHack - Backend API

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
</div>

<div align="center">
  <h3>🏆 ICAN Hackathon 2024 - Team 1 Backend API</h3>
  <p><strong>A Comprehensive RESTful API for the Institute of Chartered Accountants of Nigeria Member Portal</strong></p>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication & Security](#authentication--security)
- [Real-Time Features](#real-time-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring & Logging](#monitoring--logging)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 Overview

The ICAN ExamHack Backend API is a robust, scalable Node.js application built with Express.js and MongoDB. It serves as the comprehensive backend infrastructure for the ICAN member portal, providing secure authentication, real-time communication, financial services, educational content management, and administrative functionality.

### 🌟 Key Highlights

- **RESTful API Design**: Clean, intuitive API endpoints following REST principles
- **Microservices Architecture**: Modular design for scalability and maintainability
- **Real-Time Communication**: WebSocket support for live chat and notifications
- **Enterprise Security**: JWT authentication, rate limiting, and data encryption
- **Production-Ready**: Comprehensive error handling, logging, and monitoring
- **Scalable Infrastructure**: Designed for high availability and performance

### 🚀 Live API

- **Production URL**: [https://team1-ican-hackathon-api.onrender.com](https://team1-ican-hackathon-api.onrender.com)
- **Health Check**: [https://team1-ican-hackathon-api.onrender.com/health](https://team1-ican-hackathon-api.onrender.com/health)
- **API Documentation**: [API-DOCS.md](API-DOCS.md)

---

## ✨ Features

### 🔐 Authentication & Authorization

- **JWT-Based Authentication**: Secure token-based authentication system
- **Refresh Token Support**: Automatic token refresh for seamless user experience
- **Role-Based Access Control**: Different permission levels for users and administrators
- **Password Security**: Bcrypt hashing with salt rounds for password protection
- **Account Lockout**: Brute force protection with progressive delays
- **Password Reset**: Secure password reset via email verification
- **Session Management**: Comprehensive session tracking and management

### 👤 User Management

- **Profile Management**: Complete user profile CRUD operations
- **Membership Tracking**: ICAN membership ID validation and tracking
- **Preference Settings**: Customizable user preferences and notifications
- **Account Verification**: Email verification for new accounts
- **Data Privacy**: GDPR-compliant data handling and user consent
- **Audit Logging**: Complete audit trail for user activities

### 📊 Dashboard & Analytics

- **Real-Time Statistics**: Live dashboard data with caching
- **Activity Tracking**: Comprehensive user activity monitoring
- **Performance Metrics**: System performance and usage analytics
- **Custom Reports**: Flexible reporting system for administrators
- **Data Visualization**: API endpoints for charts and graphs
- **Export Functionality**: Data export in multiple formats

### 💰 Financial Services

- **Payment Processing**: Integration with multiple payment gateways
- **Transaction Management**: Complete transaction lifecycle tracking
- **Invoice Generation**: Automated invoice creation and management
- **Payment Verification**: Real-time payment status verification
- **Financial Reporting**: Comprehensive financial reports and analytics
- **Refund Processing**: Automated refund handling and tracking
- **Audit Trail**: Complete financial audit trail for compliance

### 📚 CPD Management

- **Module Management**: CRUD operations for CPD modules and content
- **Enrollment System**: Course enrollment and progress tracking
- **Progress Monitoring**: Real-time progress updates and analytics
- **Certification**: Digital certificate generation and verification
- **Requirements Tracking**: Annual CPD requirement monitoring
- **Content Delivery**: Secure content delivery and access control
- **Assessment System**: Quiz and assessment functionality

### 🎉 Event Management

- **Event CRUD**: Complete event lifecycle management
- **Registration System**: Event registration with capacity management
- **Payment Integration**: Seamless payment processing for events
- **Calendar Integration**: Calendar API for event scheduling
- **Notification System**: Automated event reminders and updates
- **Attendance Tracking**: Check-in/check-out functionality
- **Feedback Collection**: Post-event feedback and rating system

### 🗳️ Voting & Surveys

- **Poll Management**: Create and manage polls and surveys
- **Voting System**: Secure, anonymous voting with fraud prevention
- **Results Analytics**: Real-time voting results and analytics
- **Survey Builder**: Flexible survey creation with multiple question types
- **Response Tracking**: Comprehensive response tracking and analysis
- **Export Functionality**: Results export in multiple formats
- **Audit Trail**: Complete voting audit trail for transparency

### 💬 Communication & Chat

- **Real-Time Messaging**: WebSocket-based chat system
- **Room Management**: Create and manage chat rooms and channels
- **Message History**: Persistent message storage and retrieval
- **File Sharing**: Secure file upload and sharing functionality
- **Moderation Tools**: Message moderation and user management
- **Notification Integration**: Real-time message notifications
- **Search Functionality**: Message search and filtering

### 🔔 Notification System

- **Multi-Channel Notifications**: Email, SMS, and push notifications
- **Template Management**: Customizable notification templates
- **Scheduling**: Scheduled and recurring notifications
- **Preference Management**: User notification preferences
- **Delivery Tracking**: Notification delivery status tracking
- **Analytics**: Notification engagement analytics
- **Integration APIs**: Third-party notification service integration

---

## 🛠️ Technology Stack

### **Core Framework**

- **Node.js**: 18.x - JavaScript runtime environment
- **Express.js**: 4.x - Web application framework
- **TypeScript**: 5.x - Type-safe JavaScript (optional)

### **Database & ODM**

- **MongoDB**: 6.x - NoSQL document database
- **Mongoose**: 7.x - MongoDB object modeling for Node.js
- **MongoDB Atlas**: Cloud database hosting (production)

### **Authentication & Security**

- **JSON Web Tokens (JWT)**: Token-based authentication
- **bcryptjs**: Password hashing and salting
- **express-rate-limit**: Rate limiting middleware
- **helmet**: Security headers middleware
- **cors**: Cross-Origin Resource Sharing
- **express-validator**: Input validation and sanitization

### **Real-Time Communication**

- **Socket.io**: WebSocket library for real-time communication
- **Redis**: Session store and caching (optional)

### **File Handling & Storage**

- **Multer**: File upload middleware
- **Cloudinary**: Cloud-based image and video management
- **AWS S3**: File storage service (alternative)

### **Email & Notifications**

- **Nodemailer**: Email sending library
- **SendGrid**: Email delivery service
- **Twilio**: SMS notification service

### **Development & Testing**

- **Nodemon**: Development server with auto-restart
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library for testing
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting

### **Monitoring & Logging**

- **Morgan**: HTTP request logger
- **Winston**: Logging library
- **New Relic**: Application performance monitoring (optional)

### **Deployment & DevOps**

- **Docker**: Containerization
- **PM2**: Process manager for Node.js
- **Nginx**: Reverse proxy and load balancer
- **GitHub Actions**: CI/CD pipeline

---

## 🏗️ Architecture

### **Project Structure**

```
Ican-backend/
├── 📄 server.js              # Application entry point
├── 📦 package.json           # Dependencies and scripts
├── 🔧 .env.example           # Environment variables template
├── 📚 API-DOCS.md            # Comprehensive API documentation
├── 📝 QUICK-TEST.md          # Quick testing guide
├── 🧪 test-api.js            # Automated API testing script
├── 📂 config/                # Configuration files
│   ├── database.js           # Database connection configuration
│   ├── jwt.js                # JWT configuration
│   └── email.js              # Email service configuration
├── 📂 models/                # Mongoose data models
│   ├── User.js               # User model with authentication
│   ├── CPDModule.js          # CPD module model
│   ├── Event.js              # Event model
│   ├── Transaction.js        # Financial transaction model
│   ├── Poll.js               # Voting and survey model
│   ├── ChatRoom.js           # Chat room model
│   ├── Message.js            # Chat message model
│   └── Notification.js       # Notification model
├── 📂 routes/                # API route definitions
│   ├── auth.js               # Authentication routes
│   ├── user.js               # User management routes
│   ├── dashboard.js          # Dashboard data routes
│   ├── cpd.js                # CPD management routes
│   ├── events.js             # Event management routes
│   ├── financial.js          # Financial service routes
│   ├── voting.js             # Voting and survey routes
│   ├── chat.js               # Chat and messaging routes
│   └── notifications.js      # Notification routes
├── 📂 middleware/            # Custom middleware functions
│   ├── auth.js               # Authentication middleware
│   ├── validation.js         # Input validation middleware
│   ├── errorHandler.js       # Global error handling
│   ├── rateLimiter.js        # Rate limiting configuration
│   └── logger.js             # Request logging middleware
├── 📂 services/              # Business logic services
│   ├── authService.js        # Authentication business logic
│   ├── emailService.js       # Email sending service
│   ├── paymentService.js     # Payment processing service
│   ├── notificationService.js # Notification service
│   └── fileService.js        # File handling service
├── 📂 utils/                 # Utility functions
│   ├── helpers.js            # General helper functions
│   ├── constants.js          # Application constants
│   ├── validators.js         # Custom validation functions
│   └── encryption.js         # Encryption utilities
├── 📂 tests/                 # Test files
│   ├── auth.test.js          # Authentication tests
│   ├── user.test.js          # User management tests
│   ├── cpd.test.js           # CPD functionality tests
│   └── integration.test.js   # Integration tests
└── 📂 docs/                  # Documentation files
    ├── DEPLOYMENT.md         # Deployment guide
    ├── CONTRIBUTING.md       # Contribution guidelines
    └── CHANGELOG.md          # Version history
```

### **API Architecture**

#### **RESTful Design Principles**

- **Resource-Based URLs**: Clear, intuitive endpoint naming
- **HTTP Methods**: Proper use of GET, POST, PUT, DELETE
- **Status Codes**: Appropriate HTTP status codes for all responses
- **Consistent Response Format**: Standardized JSON response structure
- **Versioning**: API versioning strategy for backward compatibility

#### **Middleware Stack**

```javascript
// server.js middleware stack
app.use(helmet()); // Security headers
app.use(cors()); // CORS configuration
app.use(morgan("combined")); // Request logging
app.use(rateLimiter); // Rate limiting
app.use(express.json()); // JSON parsing
app.use(express.urlencoded()); // URL encoding
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/user", authMiddleware, userRoutes); // Protected routes
// ... other routes
app.use(errorHandler); // Global error handling
```

#### **Database Design**

- **Document-Based**: MongoDB collections for flexible data storage
- **Indexing Strategy**: Optimized indexes for query performance
- **Data Validation**: Mongoose schema validation
- **Relationships**: Proper referencing between collections
- **Aggregation**: Complex queries using MongoDB aggregation pipeline

---

## 📋 Prerequisites

### **System Requirements**

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **MongoDB**: Version 6.x or higher (local or cloud)
- **Git**: Latest version for version control

### **Development Environment Setup**

```bash
# Check Node.js version
node --version  # Should be 18.x or higher

# Check npm version
npm --version   # Should be 8.x or higher

# Check MongoDB installation (if running locally)
mongod --version

# Verify Git installation
git --version
```

### **Cloud Services (Optional)**

- **MongoDB Atlas**: Cloud database hosting
- **SendGrid**: Email delivery service
- **Cloudinary**: Image and file storage
- **Render/Heroku**: Application hosting platform

---

## 🚀 Installation

### **1. Clone the Repository**

```bash
# Clone the main repository
git clone https://github.com/your-organization/ican-hackathon.git

# Navigate to the backend directory
cd ican-hackathon/Ican-backend
```

### **2. Install Dependencies**

```bash
# Install all project dependencies
npm install

# Install development dependencies
npm install --only=dev

# Verify installation
npm list --depth=0
```

### **3. Database Setup**

#### **Option A: Local MongoDB**

```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
mongo --eval "db.adminCommand('ismaster')"
```

#### **Option B: MongoDB Atlas (Cloud)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Add to environment variables

### **4. Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

---

## ⚙️ Configuration

### **Environment Variables**

Create a `.env` file in the root directory with the following configuration:

```env
# Application Configuration
NODE_ENV=development
PORT=5000
APP_NAME=ICAN API
APP_VERSION=1.0.0

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ican_hackathon
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ican_hackathon

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-characters
JWT_EXPIRE=24h
JWT_REFRESH_EXPIRE=7d

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@ican.ng
FROM_NAME=ICAN Portal

# Alternative Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage Configuration (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Configuration (Paystack)
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Security Configuration
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Feature Flags
ENABLE_EMAIL_VERIFICATION=true
ENABLE_SMS_NOTIFICATIONS=false
ENABLE_FILE_UPLOAD=true
ENABLE_REAL_TIME_CHAT=true

# Development Configuration
DEBUG_MODE=true
ENABLE_CORS=true
TRUST_PROXY=false
```

---

## 🏃‍♂️ Running the Application

### **Development Mode**

#### **Start the Development Server**
```bash
# Start with nodemon (auto-restart on changes)
npm run dev

# Start with basic node
npm start

# Start with PM2 (process manager)
npm run pm2:dev
```

#### **Development Workflow**
```bash
# Terminal 1: Start MongoDB (if local)
mongod

# Terminal 2: Start the API server
npm run dev

# Terminal 3: Run tests (optional)
npm run test:watch
```

### **Production Mode**

#### **Build and Start**
```bash
# Install production dependencies only
npm ci --only=production

# Start production server
NODE_ENV=production npm start

# Start with PM2 (recommended)
npm run pm2:start
```

### **Health Checks**

#### **Application Health**
```bash
# Check API health
curl http://localhost:5000/health

# Expected response:
{
  "success": true,
  "message": "ICAN API Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

---

## 📚 API Documentation

### **Comprehensive API Reference**

The API provides 70+ endpoints across multiple domains. See [API-DOCS.md](API-DOCS.md) for complete documentation.

#### **Quick Start Examples**

##### **Authentication**
```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "08012345678"
  }'

# Login user
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

##### **Protected Endpoints**
```bash
# Get user profile (requires authentication)
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get dashboard stats
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **API Testing**

#### **Automated Testing Script**
```bash
# Run comprehensive API tests
node test-api.js

# Expected output:
🚀 Starting ICAN API Tests
✅ Health Check: PASSED
✅ User Registration: PASSED
✅ User Login: PASSED
✅ Dashboard Stats: PASSED
📊 Success Rate: 100%
```

#### **Manual Testing**
```bash
# Test individual endpoints
curl -X GET http://localhost:5000/health
curl -X GET http://localhost:5000/api/cpd/modules
curl -X GET http://localhost:5000/api/events
```

---

## 🗄️ Database Schema

### **Core Collections**

#### **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  membershipId: String (optional),
  role: String (default: 'member'),
  isActive: Boolean (default: true),
  balance: Number (default: 0),
  cpdPoints: Number (default: 0),
  requiredPoints: Number (default: 40),
  profilePicture: String (optional),
  preferences: {
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    privacy: {
      showProfile: Boolean,
      showActivity: Boolean
    }
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### **CPD Modules Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  duration: Number, // minutes
  points: Number,
  difficulty: String,
  instructor: String,
  price: Number,
  thumbnail: String,
  content: [{
    type: String, // 'video', 'document', 'quiz'
    title: String,
    url: String,
    duration: Number
  }],
  enrollments: [{
    userId: ObjectId,
    enrolledAt: Date,
    progress: Number,
    completedAt: Date
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### **Events Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  category: String,
  startDate: Date,
  endDate: Date,
  location: String,
  price: Number,
  capacity: Number,
  registered: Number,
  cpdPoints: Number,
  organizer: String,
  thumbnail: String,
  registrations: [{
    userId: ObjectId,
    registeredAt: Date,
    status: String, // 'confirmed', 'pending', 'cancelled'
    paymentStatus: String,
    specialRequirements: String
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication & Security

### **JWT Implementation**

#### **Token Structure**
```javascript
// JWT Payload
{
  userId: "64f8a1b2c3d4e5f6a7b8c9d0",
  email: "user@example.com",
  role: "member",
  iat: 1642248000,
  exp: 1642334400,
  iss: "ican-api",
  aud: "ican-members"
}
```

#### **Authentication Middleware**
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};
```

### **Security Features**

#### **Password Security**
- **Bcrypt Hashing**: 12 salt rounds for password encryption
- **Password Validation**: Strong password requirements
- **Password Reset**: Secure token-based password reset

#### **Rate Limiting**
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **IP-based**: Tracks requests by IP address

#### **Input Validation**
```javascript
// Example: User registration validation
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must meet security requirements'),
];
```

---

## ⚡ Real-Time Features

### **Socket.io Implementation**

#### **Connection Management**
```javascript
// server.js
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = user;
    next();
  });
});
```

#### **Real-Time Events**
- **chat:message** - New chat message
- **notification:new** - New notification
- **user:online** - User came online
- **user:offline** - User went offline
- **poll:update** - Voting results update
- **event:reminder** - Event reminder

### **Chat System**
```javascript
// Chat message handling
io.on('connection', (socket) => {
  socket.on('join:room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('chat:message', async (data) => {
    const message = await Message.create({
      text: data.text,
      sender: socket.user.userId,
      room: data.roomId
    });

    io.to(data.roomId).emit('chat:message', message);
  });
});
```

---

## 🧪 Testing

### **Testing Strategy**

#### **Unit Tests**
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test auth.test.js
```

#### **Integration Tests**
```javascript
// Example: Authentication integration test
describe('Authentication API', () => {
  test('should register new user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecurePass123!',
      phone: '08012345678'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
    expect(response.body.data.token).toBeDefined();
  });
});
```

#### **API Testing**
```bash
# Automated API testing
node test-api.js

# Load testing with Artillery
npm run test:load

# Security testing
npm run test:security
```

---

## 🚀 Deployment

### **Production Deployment**

#### **Environment Setup**
```bash
# Production environment variables
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ican_prod
JWT_SECRET=production-secret-key
TRUST_PROXY=true
```

#### **Render Deployment**
1. Connect GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy automatically on git push

#### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### **Monitoring & Health Checks**

#### **Health Endpoints**
- `GET /health` - Basic health check
- `GET /health/db` - Database connectivity
- `GET /health/detailed` - Comprehensive system status

#### **Logging**
```javascript
// Winston logging configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});
```

---

## 🤝 Contributing

### **Development Guidelines**

#### **Code Standards**
- Follow ESLint configuration
- Use meaningful commit messages
- Write comprehensive tests
- Document new features
- Follow REST API conventions

#### **Git Workflow**
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and test
npm test
npm run lint

# Commit with conventional format
git commit -m "feat: add new authentication feature"

# Push and create PR
git push origin feature/new-feature
```

#### **Pull Request Process**
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request
6. Address review feedback

---

## 🔧 Troubleshooting

### **Common Issues**

#### **Database Connection**
```bash
# Check MongoDB connection
mongo --eval "db.adminCommand('ismaster')"

# Verify connection string
echo $MONGODB_URI
```

#### **Authentication Issues**
```bash
# Verify JWT secret
echo $JWT_SECRET

# Check token expiration
node -e "console.log(require('jsonwebtoken').decode('YOUR_TOKEN'))"
```

#### **Port Conflicts**
```bash
# Check port usage
lsof -i :5000

# Kill process on port
kill -9 $(lsof -t -i:5000)
```

### **Performance Optimization**

#### **Database Optimization**
```javascript
// Add indexes for better query performance
db.users.createIndex({ email: 1 }, { unique: true });
db.events.createIndex({ startDate: 1, category: 1 });
db.messages.createIndex({ room: 1, createdAt: -1 });
```

#### **Caching Strategy**
```javascript
// Redis caching for frequently accessed data
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const getCachedData = async (key) => {
  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
};
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

### **Getting Help**

- **Documentation**: [API-DOCS.md](API-DOCS.md) and [QUICK-TEST.md](QUICK-TEST.md)
- **Issues**: Create GitHub issue for bugs or feature requests
- **Testing**: Use `node test-api.js` for comprehensive API testing

### **Contact Information**

- **Team Lead**: [Your Name](mailto:your.email@example.com)
- **Project Repository**: [GitHub Repository](https://github.com/your-org/ican-hackathon)
- **Live API**: [https://team1-ican-hackathon-api.onrender.com](https://team1-ican-hackathon-api.onrender.com)

---

<div align="center">
  <p><strong>Built with ❤️ for ICAN Hackathon 2024</strong></p>
  <p>© 2024 Team 1 - All Rights Reserved</p>
</div>
