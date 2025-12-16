// Test script to verify Google OAuth configuration
require('dotenv').config();

console.log('\n=== Google OAuth Configuration ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '***SET***' : 'NOT SET');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);
console.log('CLIENT_URL:', process.env.CLIENT_URL);
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '***SET***' : 'NOT SET');
console.log('==================================\n');
