const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const fixHRUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected...");

    // Update HR user directly in database
    const result = await User.updateOne(
      { email: "hr@leavetracker.com" },
      { 
        $set: { 
          roles: ["HR"],
          designation: "Professor"
        }
      }
    );

    if (result.matchedCount === 0) {
      console.log("HR user not found");
    } else if (result.modifiedCount > 0) {
      console.log("✅ HR user updated successfully");
      console.log("   - roles set to: [HR]");
      console.log("   - designation set to: Professor");
    } else {
      console.log("HR user already has correct values");
    }

    // Verify the update
    const hrUser = await User.findOne({ email: "hr@leavetracker.com" });
    if (hrUser) {
      console.log("\nCurrent HR user details:");
      console.log("  Email:", hrUser.email);
      console.log("  Name:", hrUser.name);
      console.log("  Designation:", hrUser.designation);
      console.log("  Roles:", hrUser.roles);
      console.log("  Role (virtual):", hrUser.role);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

fixHRUser();
