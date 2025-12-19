const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const migrateUsersToMultiRole = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for migration...");

    // Find all users that still have the old 'role' field (no 'roles' array)
    const users = await User.find();
    
    let migratedCount = 0;
    let alreadyMigratedCount = 0;

    for (const user of users) {
      // Check if user already has roles array
      if (!user.roles || user.roles.length === 0) {
        // Get the old role value from the document
        const oldRole = user.get('role', null, { getters: false });
        
        if (oldRole) {
          // Update to roles array
          await User.updateOne(
            { _id: user._id },
            { $set: { roles: [oldRole] }, $unset: { role: 1 } }
          );
          console.log(`Migrated user ${user.email}: ${oldRole} -> [${oldRole}]`);
          migratedCount++;
        } else {
          // Default to Employee if no role found
          await User.updateOne(
            { _id: user._id },
            { $set: { roles: ["Employee"] } }
          );
          console.log(`Migrated user ${user.email}: No role -> [Employee]`);
          migratedCount++;
        }
      } else {
        console.log(`User ${user.email} already has roles array: [${user.roles.join(', ')}]`);
        alreadyMigratedCount++;
      }
    }

    console.log("\n=== Migration Summary ===");
    console.log(`Total users: ${users.length}`);
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Already migrated: ${alreadyMigratedCount}`);
    console.log("=========================\n");

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

// Run migration
migrateUsersToMultiRole();
