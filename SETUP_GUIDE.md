# 🚀 Slack-Jira Clone - Complete Setup Guide

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

### Required Software:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **PostgreSQL** database
- **Git** for version control

### Optional (for production):
- **Docker** and **Docker Compose**
- **Azure CLI** (for Azure deployment)

---

## 🛠️ Installation & Setup

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd slack-jira-clone
```

### Step 2: Install Dependencies
```bash
# Using npm (recommended)
npm install

# OR using yarn
yarn install
```

### Step 3: Environment Configuration
```bash
# Copy environment template
cp azure.env .env

# Edit the .env file with your configuration
nano .env  # or use your preferred editor
```

### Step 4: Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database with initial data
npm run db:seed
```

### Step 5: Start Development Server
```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

---

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/slack_jira_clone"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Redis (for caching)
REDIS_URL="redis://localhost:6379"

# Optional: Azure Integration
AZURE_CLIENT_ID=""
AZURE_CLIENT_SECRET=""
AZURE_TENANT_ID=""

# File Upload
MAX_FILE_SIZE="10485760"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf,text/plain"

# Monitoring
SENTRY_DSN=""
LOG_LEVEL="info"
```

---

## 🗄️ Database Setup

### Option 1: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database:
   ```sql
   CREATE DATABASE slack_jira_clone;
   ```
3. Update your `DATABASE_URL` in `.env`

### Option 2: Docker PostgreSQL
```bash
# Run PostgreSQL in Docker
docker run --name postgres-db \
  -e POSTGRES_DB=slack_jira_clone \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15
```

### Option 3: Cloud Database
- **Azure Database for PostgreSQL**
- **Supabase**
- **PlanetScale**
- **Railway**

---

## 🚀 Running the Project

### Development Mode
```bash
# Install dependencies
npm install

# Setup database
npm run db:generate
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Mode
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

---

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with data |
| `npm run db:studio` | Open Prisma Studio |

---

## 🔍 Troubleshooting

### Common Issues:

#### 1. **Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

#### 2. **Database Connection Issues**
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify database credentials

#### 3. **Prisma Issues**
```bash
# Reset Prisma client
rm -rf node_modules/.prisma
npm run db:generate
```

#### 4. **Node Modules Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 5. **Build Issues**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 🐳 Docker Setup

### Using Docker Compose (Recommended)
```bash
# Start all services
docker-compose up --build

# Start in background
docker-compose up -d --build

# Stop services
docker-compose down
```

### Using Docker directly
```bash
# Build image
docker build -t slack-jira-clone .

# Run container
docker run -p 3000:3000 --env-file .env slack-jira-clone
```

---

## ☁️ Azure Deployment

### Prerequisites:
1. Azure account
2. Azure CLI installed
3. Docker installed

### Deploy to Azure:
```bash
# Make deployment script executable
chmod +x deploy-azure-production.sh

# Run deployment
./deploy-azure-production.sh
```

### Manual Azure Setup:
1. Create Azure Container Registry
2. Create Azure Database for PostgreSQL
3. Create Azure Cache for Redis
4. Update environment variables
5. Deploy container

---

## 📁 Project Structure

```
slack-jira-clone/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   ├── api/                # API routes
│   ├── dashboard/          # Dashboard pages
│   └── ...
├── components/             # React components
├── lib/                    # Utilities and configs
├── prisma/                 # Database schema
├── public/                 # Static assets
├── types/                  # TypeScript types
├── docker-compose.yml      # Docker configuration
├── Dockerfile              # Docker image
├── package.json            # Dependencies
└── README.md               # Documentation
```

---

## 🔐 Default Admin Account

After seeding the database, you can log in with:
- **Email**: admin@example.com
- **Password**: admin123

**⚠️ Change these credentials in production!**

---

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check database connection
5. Review the logs for error messages

---

## 🎯 Quick Start Commands

```bash
# Complete setup in one go
git clone <repo-url>
cd slack-jira-clone
npm install
cp azure.env .env
# Edit .env with your database URL
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

**Your application will be running at http://localhost:3000** 🚀
