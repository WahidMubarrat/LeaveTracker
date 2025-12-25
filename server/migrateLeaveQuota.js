require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

// Migration script to convert old leaveQuota format to new format
async function migrateLeaveQuota() {
  try {
    // Connect to database
    await connectDB();

    // Get the users collection directly (bypass schema validation)
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find all users with old schema format
    const users = await usersCollection.find({}).toArray();

    console.log(`Found ${users.length} users to check`);

    let migratedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      const updateSet = {};
      const updateUnset = {};

      // Check if leaveQuota exists and needs migration
      if (user.leaveQuota) {
        // If annual is a number, convert to object
        if (typeof user.leaveQuota.annual === 'number') {
          updateSet['leaveQuota.annual'] = {
            allocated: user.leaveQuota.annual || 20,
            used: 0
          };
          needsUpdate = true;
        }

        // If casual is a number, convert to object
        if (typeof user.leaveQuota.casual === 'number') {
          updateSet['leaveQuota.casual'] = {
            allocated: user.leaveQuota.casual || 10,
            used: 0
          };
          needsUpdate = true;
        }

        // If sick exists, remove it (we don't use sick leave anymore)
        if (user.leaveQuota.sick !== undefined) {
          updateUnset['leaveQuota.sick'] = "";
          needsUpdate = true;
        }
      } else {
        // No leaveQuota at all, create new one
        updateSet['leaveQuota'] = {
          annual: { allocated: 20, used: 0 },
          casual: { allocated: 10, used: 0 }
        };
        needsUpdate = true;
      }

      // Perform update if needed
      if (needsUpdate) {
        const updateQuery = {};
        if (Object.keys(updateSet).length > 0) {
          updateQuery.$set = updateSet;
        }
        if (Object.keys(updateUnset).length > 0) {
          updateQuery.$unset = updateUnset;
        }

        await usersCollection.updateOne(
          { _id: user._id },
          updateQuery
        );
        migratedCount++;
        console.log(`✅ Migrated user: ${user.name || user.email}`);
      }
    }

    console.log(`\n🎉 Migration complete! Updated ${migratedCount} users.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateLeaveQuota();
