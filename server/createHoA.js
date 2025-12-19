require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI);

async function createHoA() {
  try {
    const exists = await User.findOne({ role: "HR" });
    if (exists) {
      console.log("❌ HR already exists:", exists.email);
      return process.exit();
    }

    const hashedPassword = await bcrypt.hash("HRLeaveTracker12345", 10);

    await User.create({
      name: "Head of Administration",
      email: "hr@leavetracker.com",
      password: hashedPassword,
      designation: "HR",
      role: "HR",
    });

    console.log("✅ HR created successfully");
    console.log("📧 Email: hr@leavetracker.com");
    console.log("🔑 Password: HRLeaveTracker12345");
    process.exit();
  } catch (error) {
    console.error("❌ Error creating HR:", error);
    process.exit(1);
  }
}

createHoA();
