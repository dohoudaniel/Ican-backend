# ICAN API Documentation

## Overview

The ICAN API is a comprehensive RESTful API built with Node.js and Express.js, designed to serve the Institute of Chartered Accountants of Nigeria (ICAN) member portal. This API provides authentication, user management, CPD tracking, event management, financial services, voting, chat, and notification features.

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://team1-ican-hackathon-api.onrender.com`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## API Endpoints

### Health Check

#### GET /health

Check API server status.

**Request:**

```bash
curl -X GET http://localhost:5000/health
```

**Response:**

```json
{
  "success": true,
  "message": "ICAN API Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## Authentication Endpoints

### Register User

#### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "phone": "08012345678",
  "membershipId": "ICAN/2024/001" // Optional
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123",
    "phone": "08012345678"
  }'
```

**Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "08012345678",
      "membershipId": "ICAN/2024/001",
      "role": "member",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login User

#### POST /api/auth/login

Authenticate user and get access token.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123"
  }'
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "member",
      "lastLogin": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Refresh Token

#### POST /api/auth/refresh

Get new access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Forgot Password

#### POST /api/auth/forgot-password

Request password reset email.

**Request Body:**

```json
{
  "email": "john.doe@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset email sent successfully"
}
```

### Reset Password

#### POST /api/auth/reset-password

Reset password using reset token.

**Request Body:**

```json
{
  "token": "reset-token-here",
  "newPassword": "NewSecurePassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## User Management Endpoints

### Get User Profile

#### GET /api/user/profile

Get current user's profile information.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "08012345678",
      "membershipId": "ICAN/2024/001",
      "role": "member",
      "isActive": true,
      "balance": 50000,
      "cpdPoints": 25,
      "requiredPoints": 40,
      "profilePicture": null,
      "preferences": {
        "notifications": {
          "email": true,
          "sms": false,
          "push": true
        },
        "privacy": {
          "showProfile": true,
          "showActivity": false
        }
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Update User Profile

#### PUT /api/user/profile

Update user profile information.

**Headers:**

```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Updated Doe",
  "phone": "08087654321",
  "preferences": {
    "notifications": {
      "email": true,
      "sms": true,
      "push": true
    }
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "name": "John Updated Doe",
      "phone": "08087654321"
      // ... other fields
    }
  }
}
```

### Change Password

#### POST /api/user/change-password

Change user password.

**Request Body:**

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Dashboard Endpoints

### Get Dashboard Stats

#### GET /api/dashboard/stats

Get user dashboard statistics.

**Headers:**

```
Authorization: Bearer <jwt-token>
```

**Response (200):**

```json
{
  "success": true,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "stats": {
      "cpdPoints": 25,
      "requiredPoints": 40,
      "completedModules": 5,
      "upcomingEvents": 3,
      "balance": 50000,
      "pendingTransactions": 1,
      "unreadNotifications": 7,
      "activePolls": 2
    },
    "recentActivity": [
      {
        "id": "activity1",
        "type": "cpd_completed",
        "title": "Completed Financial Reporting Module",
        "date": "2024-01-14T15:30:00.000Z"
      }
    ],
    "quickActions": [
      {
        "id": "pay_dues",
        "title": "Pay Annual Dues",
        "description": "₦25,000 due",
        "action": "payment",
        "urgent": true
      }
    ]
  }
}
```

### Get Recent Activity

#### GET /api/dashboard/recent-activity

Get user's recent activities.

**Query Parameters:**

- `limit` (optional): Number of activities to return (default: 10)
- `offset` (optional): Number of activities to skip (default: 0)

**Response (200):**

```json
{
  "success": true,
  "message": "Recent activity retrieved successfully",
  "data": {
    "activities": [
      {
        "id": "activity1",
        "type": "cpd_completed",
        "title": "Completed Financial Reporting Module",
        "description": "Earned 5 CPD points",
        "date": "2024-01-14T15:30:00.000Z",
        "metadata": {
          "moduleId": "mod123",
          "pointsEarned": 5
        }
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

## CPD (Continuing Professional Development) Endpoints

### Get CPD Modules

#### GET /api/cpd/modules

Get available CPD modules.

**Query Parameters:**

- `category` (optional): Filter by category
- `status` (optional): Filter by status (available, enrolled, completed)
- `limit` (optional): Number of modules to return (default: 20)
- `offset` (optional): Number of modules to skip (default: 0)

**cURL Example:**

```bash
curl -X GET "http://localhost:5000/api/cpd/modules?category=financial&limit=5" \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200):**

```json
{
  "success": true,
  "message": "CPD modules retrieved successfully",
  "data": {
    "data": [
      {
        "id": "mod123",
        "title": "Advanced Financial Reporting",
        "description": "Comprehensive course on IFRS implementation",
        "category": "Financial Reporting",
        "duration": 120,
        "points": 8,
        "difficulty": "Advanced",
        "instructor": "Prof. Jane Smith",
        "status": "available",
        "progress": 0,
        "price": 15000,
        "thumbnail": "https://example.com/thumbnail.jpg",
        "createdAt": "2024-01-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### Enroll in CPD Module

#### POST /api/cpd/modules/:id/enroll

Enroll in a specific CPD module.

**Path Parameters:**

- `id`: Module ID

**cURL Example:**

```bash
curl -X POST http://localhost:5000/api/cpd/modules/mod123/enroll \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response (200):**

```json
{
  "success": true,
  "message": "Successfully enrolled in module",
  "data": {
    "enrollment": {
      "moduleId": "mod123",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "enrolledAt": "2024-01-15T10:30:00.000Z",
      "status": "enrolled",
      "progress": 0
    }
  }
}
```

### Update Module Progress

#### PUT /api/cpd/modules/:id/progress

Update progress for an enrolled module.

**Path Parameters:**

- `id`: Module ID

**Request Body:**

```json
{
  "progress": 75,
  "timeSpent": 90,
  "lastActivity": "2024-01-15T10:30:00.000Z"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "progress": 75,
    "pointsEarned": 6,
    "completed": false
  }
}
```

### Get My CPD Progress

#### GET /api/cpd/my-progress

Get user's overall CPD progress.

**Response (200):**

```json
{
  "success": true,
  "message": "CPD progress retrieved successfully",
  "data": {
    "totalPoints": 25,
    "requiredPoints": 40,
    "completedModules": 5,
    "enrolledModules": 8,
    "progressPercentage": 62.5,
    "modules": [
      {
        "moduleId": "mod123",
        "title": "Advanced Financial Reporting",
        "progress": 100,
        "pointsEarned": 8,
        "completedAt": "2024-01-14T15:30:00.000Z"
      }
    ]
  }
}
```

---

## Events Management Endpoints

### Get Events

#### GET /api/events

Get list of available events.

**Query Parameters:**

- `category` (optional): Filter by category
- `status` (optional): Filter by status (upcoming, ongoing, completed)
- `limit` (optional): Number of events to return (default: 20)
- `offset` (optional): Number of events to skip (default: 0)

**Response (200):**

```json
{
  "success": true,
  "message": "Events retrieved successfully",
  "data": {
    "data": [
      {
        "id": "evt123",
        "title": "Annual ICAN Conference 2024",
        "description": "Premier accounting conference in Nigeria",
        "category": "Conference",
        "startDate": "2024-03-15T09:00:00.000Z",
        "endDate": "2024-03-17T17:00:00.000Z",
        "location": "Lagos Continental Hotel",
        "price": 50000,
        "capacity": 500,
        "registered": 245,
        "status": "upcoming",
        "isRegistered": false,
        "cpdPoints": 15,
        "organizer": "ICAN Lagos District",
        "thumbnail": "https://example.com/event-thumb.jpg"
      }
    ],
    "pagination": {
      "total": 12,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Register for Event

#### POST /api/events/:id/register

Register for a specific event.

**Path Parameters:**

- `id`: Event ID

**Request Body:**

```json
{
  "paymentMethod": "card",
  "specialRequirements": "Vegetarian meal"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Successfully registered for event",
  "data": {
    "registration": {
      "eventId": "evt123",
      "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "registeredAt": "2024-01-15T10:30:00.000Z",
      "status": "confirmed",
      "paymentStatus": "pending",
      "registrationCode": "REG-2024-001"
    }
  }
}
```

### Unregister from Event

#### DELETE /api/events/:id/unregister

Unregister from a specific event.

**Path Parameters:**

- `id`: Event ID

**Response (200):**

```json
{
  "success": true,
  "message": "Successfully unregistered from event"
}
```

---

## Financial Services Endpoints

### Get Transactions

#### GET /api/financial/transactions

Get user's transaction history.

**Query Parameters:**

- `type` (optional): Filter by transaction type (payment, refund, dues)
- `status` (optional): Filter by status (pending, completed, failed)
- `limit` (optional): Number of transactions to return (default: 20)
- `offset` (optional): Number of transactions to skip (default: 0)

**Response (200):**

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "data": [
      {
        "id": "txn123",
        "type": "payment",
        "description": "Annual membership dues 2024",
        "amount": 25000,
        "status": "completed",
        "reference": "PAY-2024-001",
        "paymentMethod": "card",
        "date": "2024-01-14T10:30:00.000Z",
        "metadata": {
          "eventId": null,
          "moduleId": null,
          "duesYear": "2024"
        }
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Get Account Balance

#### GET /api/financial/balance

Get user's account balance and financial summary.

**Response (200):**

```json
{
  "success": true,
  "message": "Balance retrieved successfully",
  "data": {
    "currentBalance": 50000,
    "pendingTransactions": 1,
    "totalSpent": 75000,
    "totalRefunds": 5000,
    "lastTransaction": {
      "id": "txn123",
      "amount": 25000,
      "date": "2024-01-14T10:30:00.000Z",
      "description": "Annual membership dues 2024"
    }
  }
}
```

### Initiate Payment

#### POST /api/financial/payment

Initiate a new payment transaction.

**Request Body:**

```json
{
  "type": "dues",
  "amount": 25000,
  "description": "Annual membership dues 2024",
  "paymentMethod": "card",
  "metadata": {
    "duesYear": "2024"
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "transaction": {
      "id": "txn124",
      "reference": "PAY-2024-002",
      "amount": 25000,
      "status": "pending"
    },
    "paymentUrl": "https://checkout.paystack.com/xyz123",
    "accessCode": "xyz123abc"
  }
}
```

### Verify Payment

#### GET /api/financial/payment/verify/:reference

Verify payment status using transaction reference.

**Path Parameters:**

- `reference`: Payment reference

**Response (200):**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "transaction": {
      "id": "txn124",
      "reference": "PAY-2024-002",
      "amount": 25000,
      "status": "completed",
      "paidAt": "2024-01-15T10:35:00.000Z"
    },
    "verified": true
  }
}
```

---

## Voting & Surveys Endpoints

### Get Polls

#### GET /api/voting/polls

Get available polls and surveys.

**Query Parameters:**

- `status` (optional): Filter by status (active, closed, upcoming)
- `category` (optional): Filter by category
- `limit` (optional): Number of polls to return (default: 20)

**Response (200):**

```json
{
  "success": true,
  "message": "Polls retrieved successfully",
  "data": {
    "data": [
      {
        "id": "poll123",
        "title": "ICAN Council Election 2024",
        "description": "Vote for your preferred candidates",
        "category": "Election",
        "type": "poll",
        "status": "active",
        "startDate": "2024-01-10T00:00:00.000Z",
        "endDate": "2024-01-20T23:59:59.000Z",
        "totalVotes": 1250,
        "hasVoted": false,
        "options": [
          {
            "id": "opt1",
            "text": "Candidate A",
            "votes": 650
          },
          {
            "id": "opt2",
            "text": "Candidate B",
            "votes": 600
          }
        ]
      }
    ]
  }
}
```

### Cast Vote

#### POST /api/voting/polls/:id/vote

Cast vote in a specific poll.

**Path Parameters:**

- `id`: Poll ID

**Request Body:**

```json
{
  "optionId": "opt1",
  "comment": "Best candidate for the role"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Vote cast successfully",
  "data": {
    "vote": {
      "pollId": "poll123",
      "optionId": "opt1",
      "votedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Get Voting History

#### GET /api/voting/my-votes

Get user's voting history.

**Response (200):**

```json
{
  "success": true,
  "message": "Voting history retrieved successfully",
  "data": {
    "votes": [
      {
        "pollId": "poll123",
        "pollTitle": "ICAN Council Election 2024",
        "optionSelected": "Candidate A",
        "votedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Chat & Communication Endpoints

### Get Chat Rooms

#### GET /api/chat/rooms

Get available chat rooms.

**Query Parameters:**

- `type` (optional): Filter by room type (general, study-group, regional)
- `limit` (optional): Number of rooms to return (default: 20)

**Response (200):**

```json
{
  "success": true,
  "message": "Chat rooms retrieved successfully",
  "data": {
    "data": [
      {
        "id": "room123",
        "name": "General Discussion",
        "description": "General chat for all members",
        "type": "general",
        "memberCount": 245,
        "isJoined": true,
        "lastMessage": {
          "text": "Welcome to the general discussion room",
          "sender": "Admin",
          "timestamp": "2024-01-15T09:30:00.000Z"
        },
        "unreadCount": 5
      }
    ]
  }
}
```

### Get Room Messages

#### GET /api/chat/rooms/:id/messages

Get messages from a specific chat room.

**Path Parameters:**

- `id`: Room ID

**Query Parameters:**

- `limit` (optional): Number of messages to return (default: 50)
- `before` (optional): Get messages before this timestamp

**Response (200):**

```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "id": "msg123",
        "text": "Hello everyone!",
        "sender": {
          "id": "64f8a1b2c3d4e5f6a7b8c9d0",
          "name": "John Doe",
          "avatar": null
        },
        "timestamp": "2024-01-15T10:30:00.000Z",
        "edited": false,
        "reactions": []
      }
    ],
    "hasMore": true
  }
}
```

### Send Message

#### POST /api/chat/rooms/:id/messages

Send a message to a chat room.

**Path Parameters:**

- `id`: Room ID

**Request Body:**

```json
{
  "text": "Hello everyone! Great to be here.",
  "replyTo": null
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "id": "msg124",
      "text": "Hello everyone! Great to be here.",
      "sender": {
        "id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe"
      },
      "timestamp": "2024-01-15T10:35:00.000Z"
    }
  }
}
```

### Join Chat Room

#### POST /api/chat/rooms/:id/join

Join a specific chat room.

**Path Parameters:**

- `id`: Room ID

**Response (200):**

```json
{
  "success": true,
  "message": "Successfully joined chat room"
}
```

---

## Notifications Endpoints

### Get Notifications

#### GET /api/notifications

Get user notifications.

**Query Parameters:**

- `status` (optional): Filter by status (read, unread)
- `type` (optional): Filter by type (system, payment, event, cpd)
- `limit` (optional): Number of notifications to return (default: 20)

**Response (200):**

```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "data": [
      {
        "id": "notif123",
        "title": "Payment Successful",
        "message": "Your annual dues payment of ₦25,000 has been processed successfully",
        "type": "payment",
        "status": "unread",
        "priority": "normal",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "metadata": {
          "transactionId": "txn123",
          "amount": 25000
        }
      }
    ],
    "unreadCount": 7
  }
}
```

### Mark Notification as Read

#### PUT /api/notifications/:id/read

Mark a specific notification as read.

**Path Parameters:**

- `id`: Notification ID

**Response (200):**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All Notifications as Read

#### PUT /api/notifications/mark-all-read

Mark all notifications as read.

**Response (200):**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Error Codes

| Status Code | Description                              |
| ----------- | ---------------------------------------- |
| 200         | OK - Request successful                  |
| 201         | Created - Resource created successfully  |
| 400         | Bad Request - Invalid request data       |
| 401         | Unauthorized - Authentication required   |
| 403         | Forbidden - Insufficient permissions     |
| 404         | Not Found - Resource not found           |
| 409         | Conflict - Resource already exists       |
| 422         | Unprocessable Entity - Validation errors |
| 429         | Too Many Requests - Rate limit exceeded  |
| 500         | Internal Server Error - Server error     |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Chat endpoints**: 50 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## Testing the API

### Using cURL

1. **Register a new user:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "phone": "08012345678"
  }'
```

2. **Login and get token:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

3. **Use token for authenticated requests:**

```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Using Postman

1. Import the API collection (if available)
2. Set up environment variables:
   - `baseUrl`: `http://localhost:5000`
   - `token`: Your JWT token after login
3. Use `{{baseUrl}}` and `{{token}}` in your requests

### Using the Test Script

Run the provided test script:

```bash
cd Ican-backend
node test-api.js
```

## WebSocket Events (Real-time Features)

The API supports real-time communication via Socket.io:

### Connection

```javascript
const socket = io("http://localhost:5000", {
  auth: {
    token: "your-jwt-token",
  },
});
```

### Events

- `chat:message` - New chat message
- `notification:new` - New notification
- `user:online` - User came online
- `user:offline` - User went offline

## Support

For API support and questions:

- Check the error response messages
- Verify authentication tokens
- Ensure request body format is correct
- Contact the development team

---

**API Version**: 1.0.0
**Last Updated**: January 2024
**Environment**: Development/Production Ready

```

```
