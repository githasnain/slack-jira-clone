#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Slack + Jira Clone...\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required');
  console.error(`   Current version: ${nodeVersion}`);
  process.exit(1);
}

console.log('✅ Node.js version check passed');

// Create .env.local file if it doesn't exist
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/slack_jira_clone"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  console.log('   Please update the database URL and other environment variables');
} else {
  console.log('✅ .env.local file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies');
  console.error(error.message);
  process.exit(1);
}

// Create docs directory if it doesn't exist
const docsDir = path.join(process.cwd(), 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
  console.log('✅ Created docs directory');
}

// Create scripts directory if it doesn't exist
const scriptsDir = path.join(process.cwd(), 'scripts');
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
  console.log('✅ Created scripts directory');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Update your .env.local file with your database URL');
console.log('2. Set up your PostgreSQL database');
console.log('3. Run: npm run dev');
console.log('4. Visit http://localhost:3000');

console.log('\n📚 Documentation:');
console.log('- README.md - Project overview and setup');
console.log('- docs/DEVELOPMENT.md - Development guide');
console.log('- docs/COLORS.md - Color scheme documentation');

console.log('\n🎨 Color Scheme:');
console.log('- Primary Purple: #8C00FF');
console.log('- Primary Pink: #FF3F7F');
console.log('- Primary Dark: #450693');
console.log('- Neutral Dark: #423F3E');
console.log('- Neutral Light: #FFFFFF');

console.log('\n🔧 Available commands:');
console.log('- npm run dev - Start development server');
console.log('- npm run build - Build for production');
console.log('- npm run start - Start production server');
console.log('- npm run lint - Run ESLint');
console.log('- npm test - Run tests');

console.log('\nHappy coding! 🚀');
