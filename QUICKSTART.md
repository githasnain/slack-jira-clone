# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Git installed

### 2. Clone & Install
```bash
git clone <your-repo-url>
cd slack-jira-clone
npm install
```

### 3. Environment Setup
```bash
cp env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/slack_jira_clone"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Start Development
```bash
npm run dev
```

### 6. Login & Explore
- Open [http://localhost:3000](http://localhost:3000)
- Login as admin: `admin@workspace.com` / `admin123`
- Or as user: `user1@workspace.com` / `user123`

## 🎯 What You Can Do

### As Admin:
- ✅ Create projects and channels
- ✅ Manage users and teams
- ✅ View system logs
- ✅ Access all features

### As User:
- ✅ View assigned tasks
- ✅ Update task status
- ✅ Send messages in channels
- ✅ View analytics dashboard

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Reset database
npm run db:push --force-reset
npm run db:seed
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
npm run dev
```

### Environment Variables
Make sure all required variables are set in `.env.local`:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

## 📱 Mobile Testing
- Open Chrome DevTools
- Toggle device toolbar
- Test responsive design
- Check mobile navigation

## 🎨 Customization
- Edit colors in `tailwind.config.js`
- Modify theme in `app/globals.css`
- Update branding in `components/MainLayout.tsx`

## 🚀 Next Steps
1. Create your first project
2. Add team members
3. Create tasks and assign them
4. Start messaging in channels
5. Monitor progress in analytics

Happy coding! 🎉