# ⚡ Quick Start Guide

Get the Slack + Jira Clone running in 5 minutes!

## 🚀 One-Command Setup

```bash
# Clone and setup everything
git clone <repository-url> && cd slack-jira-clone && npm run setup
```

## 📋 Manual Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
# Copy environment file
cp env.example .env.local

# Edit .env.local with your database credentials
# DATABASE_URL="postgresql://postgres:1122@localhost:5432/slack_jira_clone"
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your-secret-key-here"
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🎫 Test the Ticket System

1. **Create a ticket**: Click "Create Ticket" button
2. **Edit a ticket**: Click the edit icon (pencil)
3. **Change status**: Use the dropdown to update status
4. **View details**: Click the eye icon to see full details

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues
npm run type-check      # TypeScript type checking

# Testing
npm run test            # Run tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio

# Utilities
npm run setup           # Complete setup
npm run clean           # Clean build files
npm run fresh-install   # Clean install
```

## 🎨 Features to Try

### Ticket Management
- ✅ Create tickets with title, description, priority
- ✅ Assign tickets to team members
- ✅ Set due dates and project associations
- ✅ Update ticket status (To Do → In Progress → Review → Done)
- ✅ Visual indicators for recently updated tickets
- ✅ User permissions (only creators can edit/delete)

### Visual Design
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/Light theme toggle
- ✅ Smooth animations and transitions
- ✅ Clean, modern interface

### Data Persistence
- ✅ All tickets saved to localStorage
- ✅ Persists across browser refreshes
- ✅ No server required for ticket management

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check if PostgreSQL is running
# Update DATABASE_URL in .env.local
npm run db:push
```

**Build Errors**
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

**Authentication Issues**
```bash
# Check NEXTAUTH_SECRET in .env.local
# Clear browser localStorage
```

## 📚 Next Steps

- Read the [Full Documentation](README.md)
- Check [Development Guide](docs/DEVELOPMENT.md)
- Learn about [Deployment](docs/DEPLOYMENT.md)

## 🆘 Need Help?

- Check the [troubleshooting section](#-troubleshooting)
- Review the [documentation](docs/)
- Create an issue in the repository

---

**Happy coding! 🚀**
