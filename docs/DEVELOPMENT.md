# 🛠️ Development Guide

This guide covers the development workflow, architecture, and best practices for the Slack + Jira Clone project.

## 🏗️ Architecture Overview

### Core Technologies
- **Next.js 15** with App Router for server-side rendering and routing
- **TypeScript** for type safety and better developer experience
- **Tailwind CSS** for utility-first styling
- **NextAuth.js** for authentication
- **Prisma** for database operations
- **PostgreSQL** for data persistence

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── features/         # Feature-specific components
│   ├── layout/           # Layout components
│   ├── providers/        # Context providers
│   ├── theme/            # Theme components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions and configurations
└── middleware.ts         # Next.js middleware
```

## 🎫 Ticket System Architecture

### Data Flow
1. **User Action** → Component Event Handler
2. **Component** → Data Persistence Layer (`data-persistence.ts`)
3. **Persistence Layer** → localStorage
4. **UI Update** → React State Management

### Key Components
- **`TicketList`**: Main container for ticket display and management
- **`TicketForm`**: Modal form for creating new tickets
- **`TicketEditForm`**: Modal form for editing existing tickets
- **`data-persistence.ts`**: Client-side data management

### Data Persistence Strategy
```typescript
// Client-side localStorage persistence
interface Ticket {
  id: string
  serialNumber: number
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignee?: { id: string; name: string; image?: string }
  createdBy?: { id: string; name: string; image?: string }
  project?: { id: string; name: string }
  dueDate?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  isUpdated: boolean
}
```

## 🔧 Development Workflow

### 1. Local Development Setup
```bash
# Clone and setup
git clone <repository-url>
cd slack-jira-clone
npm install

# Environment setup
cp env.example .env.local
# Edit .env.local with your database credentials

# Database setup
npx prisma generate
npx prisma db push
npx prisma db seed

# Start development
npm run dev
```

### 2. Code Quality Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js rules
- **Prettier**: Code formatting (configured in VS Code)
- **Component Structure**: Functional components with hooks

### 3. Component Development Guidelines

#### Component Structure
```typescript
'use client' // For client components

import { useState, useEffect } from 'react'
import { ComponentProps } from '@/types'

interface ComponentNameProps {
  // Props interface
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // Component logic
  return (
    // JSX
  )
}
```

#### State Management
- Use `useState` for local component state
- Use `useContext` for global state (user, theme)
- Use custom hooks for complex logic

#### Styling Guidelines
- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Use CSS variables for theme colors
- Maintain consistent spacing and typography

## 🎨 UI/UX Development

### Design System
- **Colors**: Defined in `tailwind.config.js`
- **Typography**: Using Geist font family
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components in `src/components/ui/`

### Theme System
```typescript
// Theme provider with dark/light mode support
const themeConfig = {
  light: {
    primary: '#8C00FF',
    secondary: '#FF90BB',
    background: '#FFFFFF',
    text: '#1A1A1A'
  },
  dark: {
    primary: '#8C00FF',
    secondary: '#FF90BB',
    background: '#1A1A1A',
    text: '#FFFFFF'
  }
}
```

### Responsive Design
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🔐 Authentication System

### NextAuth.js Configuration
```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // Custom authentication logic
    })
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      // JWT token handling
    },
    session: ({ session, token }) => {
      // Session handling
    }
  }
}
```

### User Management
- **User Context**: Global user state management
- **Permission System**: Role-based access control
- **Session Handling**: Automatic session management

## 🗄️ Database Development

### Prisma Schema
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  password      String?
  // ... other fields
}
```

### Database Operations
- **Migrations**: `npx prisma db push`
- **Studio**: `npx prisma studio`
- **Seed**: `npx prisma db seed`

## 🧪 Testing Strategy

### Test Structure
```
src/__tests__/
├── api/              # API route tests
├── components/       # Component tests
└── integration/      # Integration tests
```

### Testing Tools
- **Jest**: Test runner
- **React Testing Library**: Component testing
- **MSW**: API mocking

### Running Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 🚀 Performance Optimization

### Build Optimization
- **Bundle Analysis**: `npm run analyze`
- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Preloaded fonts

### Runtime Optimization
- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo for expensive components
- **State Optimization**: Minimal re-renders

## 🐛 Debugging Guide

### Common Issues

#### 1. Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

#### 2. Database Connection
```bash
# Check database connection
npx prisma db push
npx prisma studio
```

#### 3. Authentication Issues
- Check `NEXTAUTH_SECRET` in `.env.local`
- Verify `NEXTAUTH_URL` matches your domain
- Clear browser cookies and localStorage

#### 4. TypeScript Errors
```bash
# Type check
npx tsc --noEmit

# Fix common issues
npm run lint -- --fix
```

### Debug Tools
- **React DevTools**: Component inspection
- **Next.js DevTools**: Performance monitoring
- **Browser DevTools**: Network and console debugging

## 📦 Build and Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```bash
# Required for production
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key
```

### Docker Deployment
```bash
# Build image
docker build -t slack-jira-clone .

# Run container
docker run -p 3000:3000 slack-jira-clone
```

## 🔄 Git Workflow

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/**: New features
- **bugfix/**: Bug fixes
- **hotfix/**: Critical fixes

### Commit Convention
```
feat: add new ticket creation form
fix: resolve authentication issue
docs: update README
style: improve button styling
refactor: optimize data persistence
test: add component tests
```

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)

### Tools
- **VS Code Extensions**: ES7+ React/Redux/React-Native snippets
- **Browser Extensions**: React Developer Tools
- **Database Tools**: Prisma Studio, pgAdmin

---

**Happy coding! 🚀**