require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const removeActiveRoleField = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Removing activeRole field from all users...');
    
    const result = await User.updateMany(
      {},
      { $unset: { activeRole: "" } }
    );

    console.log(`✨ Successfully removed activeRole from ${result.modifiedCount} users`);
    
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing activeRole field:', error);
    process.exit(1);
  }
};

removeActiveRoleField();
