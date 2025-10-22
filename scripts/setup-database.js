#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️  Setting up PostgreSQL database...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found. Please run "npm run setup-env" first.');
  process.exit(1);
}

console.log('📋 Database setup steps:');
console.log('1. Make sure PostgreSQL is running on your system');
console.log('2. Create a database named "slack_jira_clone"');
console.log('3. Update DATABASE_URL in .env.local file');
console.log('4. Run the following commands:\n');

console.log('🔧 Commands to run:');
console.log('npm run db:generate');
console.log('npm run db:push');
console.log('npm run db:seed');

console.log('\n📝 Example DATABASE_URL for .env.local:');
console.log('DATABASE_URL="postgresql://username:password@localhost:5432/slack_jira_clone"');

console.log('\n🎯 After setup, you can:');
console.log('- Create tickets with user assignment');
console.log('- Edit/delete only your own tickets');
console.log('- View all tickets (but only edit your own)');
console.log('- Use PostgreSQL for persistent data storage');

console.log('\n✅ Database setup guide complete!');
