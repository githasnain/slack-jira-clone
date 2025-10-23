# VertexAi Tec - Project Management System

A comprehensive project management platform built with Next.js 16, featuring role-based access control, team collaboration, and ticket management.

## 🚀 Features

- **Role-Based Access Control (RBAC)**: Admin and User roles with different permissions
- **Project Management**: Create and manage multiple projects (Cup Streaming, Tiptok)
- **Team Collaboration**: Organize teams within projects (Designing, Frontend, Backend)
- **Ticket Management**: Create, assign, and track tickets with status updates
- **Real-time Updates**: Live data synchronization across the platform
- **Admin Dashboard**: Comprehensive oversight and management capabilities
- **User Management**: Admin can manage users, change passwords, and assign roles
- **Document Requests**: Admin can create document requests for users to upload files
- **File Upload System**: Secure file upload with validation and organized storage
- **Performance Optimized**: Memoized components and efficient data loading
- **Security First**: Server-side validation and audit trail
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with dark mode support

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── admin/              # Admin dashboard
│   ├── api/                # API routes
│   ├── dashboard/          # User dashboard
│   ├── tickets/            # Ticket management
│   └── projects/           # Project management
├── components/             # Reusable components
├── lib/                    # Utility functions
├── prisma/                 # Database schema and migrations
└── public/                 # Static assets
```

## 👥 User Roles & Permissions

### 🔑 Admin Role
**Login Credentials:**
- **Email**: `admin@workspace.com`
- **Password**: `admin123`

**Permissions:**
- ✅ View all projects, teams, and tickets
- ✅ Create, edit, and delete any ticket
- ✅ Assign tickets to any user or team
- ✅ Manage project and team assignments
- ✅ Access admin dashboard with full oversight
- ✅ View audit trail of all actions
- ✅ Monitor system-wide activity
- ✅ Create document requests for users
- ✅ View and download all uploaded files

### 👤 User Role
**Login Credentials:**
- **Email**: `user1@workspace.com` to `user5@workspace.com`
- **Password**: `user123`

**Permissions:**
- ✅ View only assigned projects and teams
- ✅ Create tickets in accessible projects/teams
- ✅ Edit and delete only their own tickets
- ✅ View tickets from their projects/teams
- ✅ Upload documents for admin requests
- ❌ Cannot access admin dashboard
- ❌ Cannot view other users' tickets
- ❌ Cannot assign tickets to others

## 🗄️ Database Schema

### Core Models
- **User**: Authentication and role management
- **Project**: Project containers (Cup Streaming, Tiptok)
- **Team**: Teams within projects (Designing, Frontend, Backend)
- **Task**: Tickets/tasks with assignments
- **ProjectMember**: User-project relationships
- **TeamMember**: User-team relationships

### Access Control
```typescript
// User can only see:
- Their assigned projects
- Their assigned teams
- Tickets from their projects/teams
- Tickets assigned to them personally

// Admin can see:
- All projects and teams
- All tickets across all projects
- All user assignments
- Complete audit trail
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd slack-jira-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your database URL:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/slack_jira_clone"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Push schema to database
   npx prisma db push
   
   # Seed with sample data
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Login with admin or user credentials

## 🔐 Authentication Flow

### Admin Login
1. Navigate to `/login`
2. Enter admin credentials:
   - Email: `admin@workspace.com`
   - Password: `admin123`
3. Access admin dashboard at `/admin`
4. Full system access and management capabilities

### User Login
1. Navigate to `/login`
2. Enter user credentials:
   - Email: `user1@workspace.com` (or user2-5)
   - Password: `user123`
3. Access user dashboard at `/dashboard`
4. Limited access to assigned projects/teams

### User Registration
1. Navigate to `/signup`
2. Fill in registration form
3. New users are assigned `MEMBER` role by default
4. Admin can assign users to projects/teams

## 📊 Project Structure

### Cup Streaming Project
- **Designing Team**: UI/UX design for streaming platform
- **Frontend Team**: React/Next.js development
- **Backend Team**: API and server development

### Tiptok Project
- **Designing Team**: UI/UX design for social platform
- **Frontend Team**: React/Next.js development
- **Backend Team**: API and server development

## 🎯 Usage Guide

### For Admins
1. **Dashboard Access**: Navigate to `/admin` for full system overview
2. **Project Management**: View all projects with team assignments
3. **Ticket Assignment**: Assign tickets to specific users or teams
4. **User Management**: Monitor user activities and assignments
5. **Audit Trail**: Track all system changes and actions

### For Users
1. **Dashboard**: View personal tickets and project status
2. **Ticket Creation**: Create tickets in assigned projects/teams
3. **Ticket Management**: Edit/delete only your own tickets
4. **Project View**: See only your assigned projects and teams

## 🔧 API Endpoints

### Public Endpoints
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Password reset

### Protected Endpoints
- `GET /api/tasks` - Get user's accessible tickets
- `POST /api/tasks` - Create new ticket
- `PUT /api/tasks/[id]` - Update ticket
- `DELETE /api/tasks/[id]` - Delete ticket
- `GET /api/projects` - Get user's projects
- `GET /api/teams` - Get user's teams

### Admin Endpoints
- `GET /api/admin` - Admin dashboard data
- `POST /api/admin` - Admin actions (assignments)
- `GET /api/document-requests` - Get all document requests
- `POST /api/document-requests` - Create document request
- `PUT /api/document-requests/[id]` - Update document request
- `DELETE /api/document-requests/[id]` - Delete document request

### Document Upload Endpoints
- `POST /api/document-uploads` - Upload document for a request

## 📄 Document Request System

### Admin Features
- **Create Document Requests**: Admin can create requests for specific documents
- **Set Due Dates**: Optional due dates for document submissions
- **View All Uploads**: See all uploaded files organized by request and user
- **Download Files**: Download individual files or all files from a request
- **Manage Requests**: Edit, activate/deactivate, or delete document requests

### User Features
- **View Active Requests**: See all active document requests
- **Upload Documents**: Upload files for specific requests (one file per request)
- **File Validation**: Automatic validation of file types and sizes
- **View Upload Status**: See which requests they've completed
- **Download Own Files**: View and download their own uploaded files

### File Security
- **File Type Validation**: Only allowed file types (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, JPG, PNG, GIF, WEBP)
- **Size Limits**: Maximum 10MB per file
- **Secure Storage**: Files stored in organized directory structure
- **Access Control**: Users can only upload to active requests

## 🛡️ Security Features

- **Server-side Validation**: All permissions checked on API level
- **Role-based Access**: Strict separation between admin and user access
- **Audit Logging**: All admin actions tracked and logged
- **Session Management**: Secure authentication with NextAuth.js
- **Data Isolation**: Users only see their assigned data
- **File Upload Security**: Validated file types and size limits

## 🧪 Testing

### Test Admin Access
1. Login with admin credentials
2. Navigate to `/admin`
3. Verify access to all projects, teams, and tickets
4. Test ticket assignment functionality

### Test User Access
1. Login with user credentials
2. Navigate to `/dashboard`
3. Verify limited access to assigned projects/teams
4. Test ticket creation and management

### Test Access Control
1. Try accessing admin features as regular user
2. Verify proper error messages and redirects
3. Test ticket permissions (edit/delete only own tickets)

## 📈 Performance

- **Optimized Queries**: Efficient database queries with proper indexing
- **Caching**: Next.js built-in caching for improved performance
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Optimized for all device sizes

## 🔮 Future Improvements

- **Real-time Notifications**: WebSocket integration for live updates
- **Advanced Analytics**: Detailed project and team analytics
- **File Attachments**: Support for ticket file attachments
- **Mobile App**: React Native mobile application
- **Advanced Permissions**: Granular permission system
- **Integration APIs**: Third-party service integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common issues

---

**Built with ❤️ by VertexAi Tec**