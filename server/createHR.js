require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const HR_EMAIL = 'wahidazhar@iut-dhaka.edu';
const HR_NAME = 'Head of Administration';
const HR_PASSWORD = 'hr123456'; // Change if needed

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB\n');
    
    // Check if user with this email exists
    const existingUser = await mongoose.connection.db.collection('users').findOne({ email: HR_EMAIL });
    
    if (existingUser) {
      console.log(`Found existing user: ${existingUser.name} (${existingUser.email})`);
      console.log('Deleting...\n');
      await mongoose.connection.db.collection('users').deleteOne({ email: HR_EMAIL });
      console.log('✅ Deleted existing user\n');
    }
    
    // Create new HR user
    const hashedPassword = await bcrypt.hash(HR_PASSWORD, 10);
    
    const hrUser = {
      name: HR_NAME,
      email: HR_EMAIL,
      password: hashedPassword,
      roles: ['HR', 'Employee'],
      designation: 'Head of Administration',
      department: null,
      profilePic: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await mongoose.connection.db.collection('users').insertOne(hrUser);
    
    console.log('✅ Created HR user:');
    console.log(`   Name: ${HR_NAME}`);
    console.log(`   Email: ${HR_EMAIL}`);
    console.log(`   Password: ${HR_PASSWORD}`);
    console.log(`   Roles: ${hrUser.roles.join(', ')}`);
    
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
