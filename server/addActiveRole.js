const mongoose = require("mongoose");
const User = require("./models/User");

const addActiveRole = async () => {
  try {
    await mongoose.connect("mongodb+srv://wahidahmed934:wahid9072@cluster0.mongodb.net/leave-tracker?retryWrites=true&w=majority&appName=Cluster0");
    console.log("Connected to MongoDB");

    // Update all users to set activeRole to their first role
    const users = await User.find({});
    
    let updated = 0;
    for (const user of users) {
      if (!user.activeRole) {
        user.activeRole = user.roles && user.roles.length > 0 ? user.roles[0] : "Employee";
        await user.save();
        updated++;
        console.log(`Updated ${user.email} - activeRole: ${user.activeRole}`);
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updated} users.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
};

addActiveRole();
