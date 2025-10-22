#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up environment variables...\n');

// Create .env.local file
const envContent = `# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Database (optional for now)
DATABASE_URL="postgresql://postgres:password@localhost:5432/slack_jira_clone"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Development
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
`;

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local file already exists');
}

console.log('\n🎉 Environment setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Start the development server: npm run dev');
console.log('2. Visit http://localhost:3000');
console.log('3. Use demo credentials:');
console.log('   - Email: john@example.com');
console.log('   - Password: password123');
console.log('\n🔑 Available demo accounts:');
console.log('- john@example.com / password123');
console.log('- jane@example.com / password123');
console.log('- bob@example.com / password123');
console.log('- alice@example.com / password123');
