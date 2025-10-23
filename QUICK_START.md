# Quick Start Guide - VertexAi Tec Project Management

## 🚀 Get Started in 5 Minutes

This guide will help you get the VertexAi Tec Project Management System running quickly.

## ⚡ Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- Git installed

## 🔧 Installation Steps

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd slack-jira-clone

# Install dependencies
npm install
```

### 2. Environment Setup
```bash
# Copy environment file
cp env.example .env.local

# Edit .env.local with your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/slack_jira_clone"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup
```bash
# Push schema to database
npx prisma db push

# Seed with sample data
npx prisma db seed
```

### 4. Start the Application
```bash
npm run dev
```

### 5. Access the Application
Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Login Credentials

### Admin Access (Full System Access)
- **Email**: `admin@workspace.com`
- **Password**: `admin123`
- **Access**: All projects, teams, tickets, admin dashboard

### User Access (Limited Access)
- **Email**: `user1@workspace.com` to `user5@workspace.com`
- **Password**: `user123`
- **Access**: Assigned projects and teams only

## 🎯 Quick Test

### Test Admin Access
1. Login with admin credentials
2. Navigate to `/admin`
3. Verify you can see all projects and tickets

### Test User Access
1. Login with user credentials
2. Navigate to `/dashboard`
3. Verify limited access to assigned projects

### Test Ticket Creation
1. Login as any user
2. Go to `/tickets`
3. Click "Create Task"
4. Fill out the form and submit
5. Verify ticket appears in the list

## 📊 What You'll See

### Projects
- **Cup Streaming**: Live streaming platform
- **Tiptok**: Social media platform

### Teams (per project)
- **Designing**: UI/UX design
- **Frontend**: React/Next.js development
- **Backend**: API and server development

### Sample Tickets
- 6 pre-created tickets across projects
- Different statuses and priorities
- Assigned to various users

## 🔍 Key Features to Test

### Admin Features
- [ ] Admin dashboard at `/admin`
- [ ] View all projects and teams
- [ ] Assign tickets to users
- [ ] Monitor audit trail

### User Features
- [ ] User dashboard at `/dashboard`
- [ ] Create new tickets
- [ ] Edit own tickets
- [ ] View assigned projects

### Access Control
- [ ] Users cannot access admin features
- [ ] Users only see assigned data
- [ ] Proper permission enforcement

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check if PostgreSQL is running
# Verify DATABASE_URL in .env.local
# Try: npx prisma db push
```

#### Login Issues
```bash
# Reset database and reseed
npx prisma db push
npx prisma db seed
```

#### Permission Errors
```bash
# Check user roles in database
# Verify session data
# Clear browser cache
```

### Reset Everything
```bash
# Reset database
npx prisma db push --force-reset
npx prisma db seed
```

## 📚 Next Steps

1. **Read the Full Documentation**: Check `README.md` for detailed information
2. **Explore the System**: Try different features and workflows
3. **Test Access Control**: Verify role-based permissions
4. **Customize**: Modify projects, teams, and users as needed

## 🆘 Need Help?

- **Documentation**: Check `PROJECT_DOCUMENTATION.md`
- **Testing**: Follow `TESTING_GUIDE.md`
- **Issues**: Create an issue in the repository
- **Support**: Contact the development team

---

**Quick Start Guide Version**: 1.0  
**Last Updated**: October 2024  
**Maintained by**: VertexAi Tec Development Team

