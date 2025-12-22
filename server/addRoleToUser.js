const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const addRoleToUser = async (email, roleToAdd) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected...");

    // Validate role
    const validRoles = ["Employee", "HoD", "HR"];
    if (!validRoles.includes(roleToAdd)) {
      console.error(`Invalid role: ${roleToAdd}`);
      console.log(`Valid roles are: ${validRoles.join(", ")}`);
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User not found with email: ${email}`);
      process.exit(1);
    }

    // Check if user already has this role
    if (user.roles.includes(roleToAdd)) {
      console.log(`User ${email} already has the role: ${roleToAdd}`);
      console.log(`Current roles: [${user.roles.join(", ")}]`);
      process.exit(0);
    }

    // Add the new role
    user.roles.push(roleToAdd);
    await user.save();

    console.log(`Successfully added role "${roleToAdd}" to user ${email}`);
    console.log(`Updated roles: [${user.roles.join(", ")}]`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error adding role:", error);
    process.exit(1);
  }
};

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log("Usage: node addRoleToUser.js <email> <role>");
  console.log("Example: node addRoleToUser.js john@example.com HoD");
  console.log("Valid roles: Employee, HoD, HR");
  process.exit(1);
}

const [email, role] = args;
addRoleToUser(email, role);
