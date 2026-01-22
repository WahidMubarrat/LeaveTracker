require("dotenv").config();
const mongoose = require("mongoose");
const Department = require("./models/Department");

const departments = [
  { name: "CSE" },
  { name: "EEE" },
  { name: "CEE" },
  { name: "MPE" },
  { name: "BTM" },
  { name: "TVE" },
];

const seedDepartments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing departments
    await Department.deleteMany({});
    console.log("🗑️  Cleared existing departments");

    // Insert new departments
    const createdDepartments = await Department.insertMany(departments);
    console.log("✅ Departments created successfully:");
    createdDepartments.forEach((dept) => {
      console.log(`   - ${dept.name} (ID: ${dept._id})`);
    });

    mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding departments:", error);
    process.exit(1);
  }
};

seedDepartments();
