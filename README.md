# 🚀 Slack + Jira Clone

A modern collaborative workspace platform that combines Slack's messaging capabilities with Jira's project management features. Built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎫 **Ticket Management System**
- **Create, Read, Update, Delete** tickets with full CRUD operations
- **Real-time status updates** with visual feedback
- **Priority levels**: Low, Medium, High, Urgent
- **Status tracking**: To Do, In Progress, Review, Done
- **User permissions**: Only ticket creators can edit/delete their tickets
- **Persistent storage** using localStorage
- **Visual indicators** for recently updated tickets

### 💬 **Messaging System**
- Real-time messaging interface
- User authentication and session management
- Message history and persistence

### 📊 **Project Management**
- Kanban-style project boards
- Team collaboration features
- Task assignment and tracking

### 🎨 **Modern UI/UX**
- **Responsive design** for all screen sizes
- **Dark/Light theme** support
- **Clean, elegant interface** with Tailwind CSS
- **Smooth animations** and transitions
- **Accessible components** with proper ARIA labels

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **State Management**: React Hooks + Context

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd slack-jira-clone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/slack_jira_clone"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
slack-jira-clone/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── auth/             # Authentication components
│   │   ├── features/         # Feature-specific components
│   │   │   ├── messaging/    # Messaging components
│   │   │   ├── projects/     # Project management
│   │   │   ├── teams/        # Team management
│   │   │   └── tickets/      # Ticket system
│   │   ├── layout/           # Layout components
│   │   ├── providers/        # Context providers
│   │   ├── theme/            # Theme components
│   │   └── ui/               # Reusable UI components
│   ├── lib/                  # Utility functions
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── data-persistence.ts # Ticket persistence
│   │   ├── prisma.ts        # Database client
│   │   └── utils.ts         # Helper functions
│   └── middleware.ts        # Next.js middleware
├── prisma/                   # Database schema and migrations
├── public/                   # Static assets
├── docs/                     # Documentation
└── scripts/                  # Setup and utility scripts
```

## 🎫 Ticket System Usage

### Creating Tickets
1. Click the **"Create Ticket"** button (available in header or empty state)
2. Fill in the ticket details:
   - **Title** (required)
   - **Description** (optional)
   - **Priority** (Low, Medium, High, Urgent)
   - **Assignee** (optional)
   - **Due Date** (optional)
3. Click **"Create Ticket"** to save

### Managing Tickets
- **View**: Click the eye icon to view ticket details
- **Edit**: Click the edit icon (only for tickets you created)
- **Delete**: Click the trash icon (only for tickets you created)
- **Status Update**: Use the dropdown to change status (only for tickets you created)

### Visual Indicators
- **Purple border**: Tickets you created
- **Pink highlight**: Recently updated tickets (visible to all users)
- **"Updated" badge**: Shows on recently modified tickets

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run type-check   # TypeScript type checking
```

### Database Operations
```bash
npx prisma studio           # Open database GUI
npx prisma db push         # Push schema changes
npx prisma generate        # Generate Prisma client
npx prisma db seed         # Seed database
```

### Code Quality
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting
- **Jest** for testing

## 🎨 Customization

### Colors and Theming
The application uses a custom color palette defined in `tailwind.config.js`:
- **Primary Purple**: `#8C00FF`
- **Primary Pink**: `#FF90BB`
- **Primary Dark**: `#1A1A1A`

### Component Styling
- All components use Tailwind CSS classes
- Custom components in `src/components/ui/`
- Theme provider supports dark/light mode

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t slack-jira-clone .

# Run with Docker Compose
docker-compose up -d
```

### Environment Variables
Ensure these are set in production:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your domain URL
- `NEXTAUTH_SECRET`: Random secret key

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check `DATABASE_URL` in `.env.local`
   - Run `npx prisma db push` to sync schema

2. **Authentication Issues**
   - Ensure `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain

3. **Build Issues**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

### Performance Optimization
- **Lazy loading** for heavy components
- **Image optimization** with Next.js Image component
- **Bundle splitting** for optimal loading
- **Critical CSS** inlining for faster initial render

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Color System](docs/COLORS.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `docs/` folder
- Review the troubleshooting section above

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**