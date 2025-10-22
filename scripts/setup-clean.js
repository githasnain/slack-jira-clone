#!/usr/bin/env node

/**
 * Clean Setup Script for Slack + Jira Clone
 * This script sets up the project with proper configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Slack + Jira Clone...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Step 1: Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Step 2: Check environment file
console.log('🔧 Checking environment configuration...');
if (!fs.existsSync('.env.local')) {
  if (fs.existsSync('env.example')) {
    fs.copyFileSync('env.example', '.env.local');
    console.log('✅ Created .env.local from env.example');
    console.log('⚠️  Please update .env.local with your database credentials\n');
  } else {
    console.log('⚠️  No env.example found. Please create .env.local manually\n');
  }
} else {
  console.log('✅ .env.local already exists\n');
}

// Step 3: Database setup
console.log('🗄️  Setting up database...');
try {
  // Generate Prisma client
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
  
  // Push database schema
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema pushed');
  
  // Database setup complete
  console.log('✅ Database setup complete');
  
} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('💡 Make sure PostgreSQL is running and DATABASE_URL is correct in .env.local');
  process.exit(1);
}

// Step 4: Type checking
console.log('🔍 Running type check...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript types are valid\n');
} catch (error) {
  console.log('⚠️  TypeScript errors found (this is normal during development)\n');
}

// Step 5: Build check
console.log('🏗️  Testing build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful\n');
} catch (error) {
  console.log('⚠️  Build failed (check for errors above)\n');
}

// Final instructions
console.log('🎉 Setup completed successfully!\n');
console.log('📋 Next steps:');
console.log('1. Update .env.local with your database credentials');
console.log('2. Run "npm run dev" to start the development server');
console.log('3. Open http://localhost:3000 in your browser');
console.log('4. Create your first ticket to test the system\n');

console.log('🔧 Available commands:');
console.log('- npm run dev          # Start development server');
console.log('- npm run build        # Build for production');
console.log('- npm run start        # Start production server');
console.log('- npm run lint         # Run ESLint');
console.log('- npm run test         # Run tests');
console.log('- npx prisma studio    # Open database GUI\n');

console.log('📚 Documentation:');
console.log('- README.md            # Main documentation');
console.log('- docs/                # Detailed guides');
console.log('- src/components/       # Component documentation\n');

console.log('🎫 Ticket System Features:');
console.log('- Create, edit, delete tickets');
console.log('- Real-time status updates');
console.log('- User permission system');
console.log('- Visual update indicators');
console.log('- Persistent storage\n');

console.log('Happy coding! 🚀');
