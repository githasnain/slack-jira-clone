# API Documentation

## 🚀 Overview

The Slack + Jira Clone API provides endpoints for messaging, project management, user authentication, and real-time features.

## 🔗 Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## 🔐 Authentication

All API endpoints (except auth) require authentication via NextAuth.js session.

### Headers
```http
Authorization: Bearer <session_token>
Content-Type: application/json
```

## 📨 Messaging API

### Get Messages
```http
GET /api/messages?channelId=123&limit=50&offset=0
```

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_123",
      "content": "Hello world!",
      "userId": "user_456",
      "channelId": "channel_123",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z",
      "user": {
        "id": "user_456",
        "name": "John Doe",
        "avatar": "JD",
        "status": "online"
      },
      "reactions": [
        {
          "emoji": "👍",
          "count": 3,
          "users": ["user_456", "user_789"]
        }
      ]
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Send Message
```http
POST /api/messages
```

**Request Body:**
```json
{
  "content": "Hello team!",
  "channelId": "channel_123",
  "type": "text"
}
```

**Response:**
```json
{
  "id": "msg_123",
  "content": "Hello team!",
  "userId": "user_456",
  "channelId": "channel_123",
  "createdAt": "2024-01-15T10:30:00Z",
  "user": {
    "id": "user_456",
    "name": "John Doe",
    "avatar": "JD",
    "status": "online"
  }
}
```

### Add Reaction
```http
POST /api/messages/{messageId}/reactions
```

**Request Body:**
```json
{
  "emoji": "👍"
}
```

**Response:**
```json
{
  "success": true,
  "reaction": {
    "emoji": "👍",
    "count": 4,
    "users": ["user_456", "user_789", "user_101", "user_202"]
  }
}
```

## 📁 Channels API

### Get Channels
```http
GET /api/channels
```

**Response:**
```json
{
  "channels": [
    {
      "id": "channel_123",
      "name": "general",
      "description": "General discussion",
      "type": "public",
      "memberCount": 15,
      "unreadCount": 3,
      "lastMessage": {
        "id": "msg_123",
        "content": "Hello world!",
        "user": {
          "name": "John Doe",
          "avatar": "JD"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    }
  ]
}
```

### Create Channel
```http
POST /api/channels
```

**Request Body:**
```json
{
  "name": "new-channel",
  "description": "Channel description",
  "type": "public"
}
```

**Response:**
```json
{
  "id": "channel_456",
  "name": "new-channel",
  "description": "Channel description",
  "type": "public",
  "memberCount": 1,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## 👥 Users API

### Get Users
```http
GET /api/users
```

**Response:**
```json
{
  "users": [
    {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "JD",
      "status": "online",
      "role": "member",
      "lastActive": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get User Profile
```http
GET /api/users/{userId}
```

**Response:**
```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "JD",
  "status": "online",
  "role": "member",
  "bio": "Software Developer",
  "lastActive": "2024-01-15T10:30:00Z",
  "joinedAt": "2024-01-01T00:00:00Z"
}
```

## 📋 Projects API

### Get Projects
```http
GET /api/projects
```

**Response:**
```json
{
  "projects": [
    {
      "id": "project_123",
      "name": "Web Application",
      "description": "Main web application project",
      "status": "active",
      "progress": 75,
      "dueDate": "2024-02-15T00:00:00Z",
      "members": [
        {
          "id": "user_123",
          "name": "John Doe",
          "role": "developer"
        }
      ],
      "taskCount": {
        "total": 25,
        "completed": 18,
        "inProgress": 5,
        "todo": 2
      }
    }
  ]
}
```

### Create Project
```http
POST /api/projects
```

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "dueDate": "2024-03-15T00:00:00Z"
}
```

**Response:**
```json
{
  "id": "project_456",
  "name": "New Project",
  "description": "Project description",
  "status": "active",
  "progress": 0,
  "dueDate": "2024-03-15T00:00:00Z",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## 📝 Tasks API

### Get Tasks
```http
GET /api/tasks?projectId=123&status=todo&assigneeId=456
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "task_123",
      "title": "Design landing page",
      "description": "Create modern landing page design",
      "status": "todo",
      "priority": "high",
      "assignee": {
        "id": "user_456",
        "name": "Jane Smith",
        "avatar": "JS"
      },
      "project": {
        "id": "project_123",
        "name": "Web Application"
      },
      "dueDate": "2024-01-20T00:00:00Z",
      "tags": ["design", "frontend"],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Task
```http
POST /api/tasks
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "projectId": "project_123",
  "assigneeId": "user_456",
  "priority": "medium",
  "dueDate": "2024-01-25T00:00:00Z",
  "tags": ["frontend", "bug"]
}
```

**Response:**
```json
{
  "id": "task_456",
  "title": "New Task",
  "description": "Task description",
  "status": "todo",
  "priority": "medium",
  "assignee": {
    "id": "user_456",
    "name": "Jane Smith",
    "avatar": "JS"
  },
  "project": {
    "id": "project_123",
    "name": "Web Application"
  },
  "dueDate": "2024-01-25T00:00:00Z",
  "tags": ["frontend", "bug"],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Update Task Status
```http
PATCH /api/tasks/{taskId}
```

**Request Body:**
```json
{
  "status": "in-progress"
}
```

**Response:**
```json
{
  "id": "task_123",
  "status": "in-progress",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## 🔍 Search API

### Search Messages
```http
GET /api/search/messages?q=hello&channelId=123&limit=20
```

**Response:**
```json
{
  "results": [
    {
      "id": "msg_123",
      "content": "Hello team!",
      "channel": {
        "id": "channel_123",
        "name": "general"
      },
      "user": {
        "name": "John Doe",
        "avatar": "JD"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 5,
  "query": "hello"
}
```

### Search Tasks
```http
GET /api/search/tasks?q=bug&projectId=123&status=todo
```

**Response:**
```json
{
  "results": [
    {
      "id": "task_123",
      "title": "Fix login bug",
      "description": "User cannot login with email",
      "status": "todo",
      "priority": "high",
      "project": {
        "id": "project_123",
        "name": "Web Application"
      },
      "assignee": {
        "name": "Jane Smith",
        "avatar": "JS"
      }
    }
  ],
  "total": 3,
  "query": "bug"
}
```

## 📊 Analytics API

### Get Dashboard Stats
```http
GET /api/analytics/dashboard
```

**Response:**
```json
{
  "messages": {
    "total": 1234,
    "today": 45,
    "thisWeek": 234,
    "growth": 12.5
  },
  "projects": {
    "total": 8,
    "active": 5,
    "completed": 3,
    "overdue": 1
  },
  "tasks": {
    "total": 156,
    "completed": 98,
    "inProgress": 35,
    "todo": 23
  },
  "users": {
    "total": 24,
    "online": 18,
    "away": 4,
    "offline": 2
  }
}
```

### Get Project Analytics
```http
GET /api/analytics/projects/{projectId}
```

**Response:**
```json
{
  "project": {
    "id": "project_123",
    "name": "Web Application",
    "status": "active",
    "progress": 75
  },
  "tasks": {
    "total": 25,
    "completed": 18,
    "inProgress": 5,
    "todo": 2
  },
  "timeline": [
    {
      "date": "2024-01-15",
      "completed": 3,
      "created": 2
    }
  ],
  "members": [
    {
      "id": "user_123",
      "name": "John Doe",
      "tasksCompleted": 8,
      "tasksAssigned": 12
    }
  ]
}
```

## 🔄 Real-time Events

### WebSocket Connection
```javascript
const socket = io('http://localhost:3000');

// Listen for new messages
socket.on('message:new', (message) => {
  console.log('New message:', message);
});

// Listen for task updates
socket.on('task:updated', (task) => {
  console.log('Task updated:', task);
});

// Listen for user status changes
socket.on('user:status', (user) => {
  console.log('User status changed:', user);
});
```

### Event Types
- `message:new` - New message received
- `message:updated` - Message updated
- `message:deleted` - Message deleted
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `user:status` - User status changed
- `project:updated` - Project updated

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request body",
  "code": "INVALID_REQUEST"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions",
  "code": "INSUFFICIENT_PERMISSIONS"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found",
  "code": "RESOURCE_NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "code": "INTERNAL_ERROR"
}
```

## 📝 Rate Limiting

- **General API**: 100 requests per minute
- **Search API**: 20 requests per minute
- **Real-time**: 1000 events per minute

## 🔒 Security

### Authentication
- JWT tokens for API authentication
- Session-based authentication for web
- OAuth integration for social login

### Authorization
- Role-based access control
- Resource-level permissions
- Team-based access restrictions

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

## 📚 SDK Examples

### JavaScript/TypeScript
```typescript
// Initialize API client
const api = new SlackJiraAPI({
  baseURL: 'http://localhost:3000/api',
  token: 'your-session-token'
});

// Send message
const message = await api.messages.send({
  content: 'Hello team!',
  channelId: 'channel_123'
});

// Get tasks
const tasks = await api.tasks.list({
  projectId: 'project_123',
  status: 'todo'
});
```

### Python
```python
import requests

# Initialize client
api = SlackJiraAPI(
    base_url='http://localhost:3000/api',
    token='your-session-token'
)

# Send message
message = api.messages.send({
    'content': 'Hello team!',
    'channelId': 'channel_123'
})

# Get tasks
tasks = api.tasks.list(
    projectId='project_123',
    status='todo'
)
```

## 🧪 Testing

### Postman Collection
Import the provided Postman collection for easy API testing.

### cURL Examples
```bash
# Get messages
curl -X GET "http://localhost:3000/api/messages?channelId=123" \
  -H "Authorization: Bearer your-token"

# Send message
curl -X POST "http://localhost:3000/api/messages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{"content": "Hello!", "channelId": "123"}'
```

---

**API Version**: 1.0.0  
**Last Updated**: 2024-01-15  
**Contact**: api-support@yourdomain.com
