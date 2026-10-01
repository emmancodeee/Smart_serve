const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load existing .env if it exists
dotenv.config();

const envFilePath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Check if .env exists
if (!fs.existsSync(envFilePath)) {
  console.log('❌ .env file not found!');
  console.log('\n📋 Please create a .env file with the following required variables:');
  console.log('   JWT_SECRET=supersecretkey123 # Change this to a strong random key');
  console.log('\n💡 You can copy .env.example to .env and fill in the values');
  console.log('   cp .env.example .env');
  process.exit(1);
}

// Check if JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.log('❌ JWT_SECRET is not set in .env file!');
  console.log('\n📋 Please add the following to your .env file:');
  console.log('   JWT_SECRET=your-super-secret-jwt-key-here');
  console.log('\n💡 Generate a secure random key using:');
  console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}

// Check if EMAIL_USER is set
if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
  console.log('⚠️  EMAIL_USER is not set or using placeholder!');
  console.log('\n📋 Please add your email to .env file:');
  console.log('   EMAIL_USER=your-email@gmail.com');
  console.log('\n💡 For Gmail, use an App Password (not your regular password)');
  console.log('   Get it from: Google Account > Security > 2-Step Verification > App Passwords');
}

// Check if EMAIL_PASSWORD is set
if (!process.env.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD === 'your-app-password-here') {
  console.log('⚠️  EMAIL_PASSWORD is not set or using placeholder!');
  console.log('\n📋 Please add your app password to .env file:');
  console.log('   EMAIL_PASSWORD=your-app-password-here');
}

console.log('✅ Environment variables are properly configured!');
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET.substring(0, 8)}...`);
console.log(`   MONGO_URI: ${process.env.MONGO_URI}`);
console.log(`   PORT: ${process.env.PORT || 3000}`);
console.log(`   FORCE_HTTPS: ${process.env.FORCE_HTTPS || (process.env.NODE_ENV === 'production' ? 'true (derived from NODE_ENV=production)' : 'false')}`);
console.log(`   TRUST_PROXY_HOPS: ${process.env.TRUST_PROXY_HOPS || 1}`);
console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '***SET***' : 'NOT SET'}`);
