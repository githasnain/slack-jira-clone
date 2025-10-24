#!/bin/bash

# Slack-Jira Clone - Quick Start Script
# This script sets up the project for development

echo "🚀 Starting Slack-Jira Clone Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available"
    exit 1
fi

echo "✅ npm $(npm -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.template .env
    echo "✅ .env file created from template"
    echo "⚠️  Please edit .env file with your database configuration"
else
    echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"

# Check if database is accessible
echo "🔍 Checking database connection..."
npm run db:push --dry-run > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
    
    # Push schema to database
    echo "🗄️  Pushing database schema..."
    npm run db:push
    
    if [ $? -eq 0 ]; then
        echo "✅ Database schema pushed successfully"
        
        # Seed database
        echo "🌱 Seeding database..."
        npm run db:seed
        
        if [ $? -eq 0 ]; then
            echo "✅ Database seeded successfully"
        else
            echo "⚠️  Database seeding failed, but you can continue"
        fi
    else
        echo "⚠️  Failed to push schema, but you can continue"
    fi
else
    echo "⚠️  Database connection failed. Please check your DATABASE_URL in .env"
    echo "   You can continue with the setup and configure the database later"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your database configuration"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "🔐 Default admin credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "📚 For detailed setup instructions, see SETUP_GUIDE.md"
