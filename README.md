# Slack-Jira Clone

A modern, full-featured project management and team collaboration platform built with Next.js, featuring authentication, ticketing, messaging, and analytics.

## 🚀 Features

### ✅ Core Functionalities
- **Authentication System**: Sign up, login, and password reset with OTP verification
- **Admin Panel**: Create channels, projects, and manage teams
- **Project Structure**: Frontend, Backend, and Design teams for each project
- **Ticket System**: Create, update, and track tasks with real-time status updates
- **Messaging System**: Team collaboration through channels with reactions
- **Analytics Dashboard**: Project metrics, progress tracking, and team performance

### 🎨 Design & UX
- **Color Scheme**: Primary pink (#FF3F7F) and purple (#8C00FF)
- **Light/Dark Mode**: Fully responsive theme switching
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with smooth animations

### 🔧 Technical Features
- **Next.js 15**: Latest Next.js with App Router
- **NextAuth**: Secure authentication with credentials provider
- **Prisma**: Type-safe database ORM with PostgreSQL
- **Tailwind CSS**: Utility-first styling with custom color palette
- **TypeScript**: Full type safety throughout the application
- **Real-time Updates**: Dynamic status changes and live messaging

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker-ready with docker-compose

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Setup Steps

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
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/slack_jira_clone"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:push
   
   # Seed the database with sample data
   npm run db:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Use the seeded credentials to login

## 🔑 Default Credentials

After running the seed script, you can use these credentials:

### Admin Account
- **Email**: admin@workspace.com
- **Password**: admin123
- **Access**: Full admin panel, user management, project creation

### Regular User Accounts
- **Email**: user1@workspace.com (password: user123)
- **Email**: user2@workspace.com (password: user123)
- **Email**: user3@workspace.com (password: user123)
- **Email**: user4@workspace.com (password: user123)
- **Email**: user5@workspace.com (password: user123)
- **Access**: Dashboard, tickets, messaging, analytics

## 🏗️ Project Structure

```
slack-jira-clone/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel pages
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── forgot-password/
│   ├── tickets/           # Task management
│   ├── messages/          # Messaging system
│   └── analytics/         # Analytics dashboard
├── components/            # Reusable React components
├── lib/                   # Utility libraries
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🎯 Key Features Walkthrough

### 1. Authentication System
- **Sign Up**: Create new accounts with email verification
- **Login**: Secure authentication with role-based access
- **Password Reset**: OTP-based password recovery via email
- **Session Management**: Persistent sessions with NextAuth

### 2. Admin Panel
- **User Management**: View, edit, and manage user accounts
- **Project Creation**: Create projects with automatic team setup
- **Channel Management**: Create public/private channels
- **System Logs**: Monitor system activity and user actions

### 3. Project Structure
- **Automatic Teams**: Each project gets Frontend, Backend, and Design teams
- **Team Members**: Assign users to specific teams
- **Project Roles**: Owner, Admin, Member, and Viewer roles
- **Progress Tracking**: Visual progress indicators and completion rates

### 4. Ticket System
- **Task Creation**: Create tasks with priority, assignee, and due dates
- **Status Updates**: Real-time status changes (To Do → In Progress → Review → Done)
- **Filtering**: Filter by project, team, status, and priority
- **Team Visibility**: Users can only see tasks assigned to them or their teams

### 5. Messaging System
- **Channel-based**: Organized communication through channels
- **Real-time**: Live messaging with instant updates
- **Reactions**: Emoji reactions on messages
- **Mobile-friendly**: Responsive design for all devices

### 6. Analytics Dashboard
- **Project Metrics**: Task completion rates and progress tracking
- **Team Performance**: Individual team statistics and workload
- **Recent Activity**: Timeline of recent actions and updates
- **Visual Charts**: Status and priority distribution charts

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t slack-jira-clone .
docker run -p 3000:3000 slack-jira-clone
```

### Production Environment Variables
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🎨 Customization

### Color Scheme
The app uses a custom color palette defined in `tailwind.config.js`:
- Primary Pink: #FF3F7F
- Primary Purple: #8C00FF
- Status colors for different task states
- Priority colors for task priorities

### Theme Customization
- Light/Dark mode toggle
- CSS custom properties for easy color changes
- Responsive design breakpoints
- Custom animations and transitions

## 📱 Mobile Responsiveness

- **Mobile-first design**: Optimized for mobile devices
- **Responsive grids**: Adaptive layouts for all screen sizes
- **Touch-friendly**: Large touch targets and intuitive gestures
- **Sidebar navigation**: Collapsible sidebar for mobile
- **Modal dialogs**: Mobile-optimized forms and dialogs

## 🔒 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **Session Management**: Secure JWT-based sessions
- **Role-based Access**: Admin and user role separation
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: React's built-in XSS protection

## 🚀 Performance Optimizations

- **Next.js Optimizations**: Built-in performance features
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic code splitting
- **Caching**: Efficient caching strategies
- **Database Indexing**: Optimized database queries
- **Lazy Loading**: Components loaded on demand

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include steps to reproduce the problem
4. Provide your environment details

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database powered by [Prisma](https://prisma.io/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)
- Icons by [Heroicons](https://heroicons.com/)

---

**Happy coding! 🚀**