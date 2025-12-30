const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Department = require("../models/Department");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, designation, role, departmentId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !designation || !departmentId) {
      return res.status(400).json({ message: "Please provide all required fields (name, email, password, designation, department)" });
    }

    // Validate email format
    if (!email.includes('@iut-dhaka.edu')) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Validate password has uppercase and lowercase
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    if (!hasUppercase || !hasLowercase) {
      return res.status(400).json({ message: "Password must contain both uppercase and lowercase letters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Validate department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(400).json({ message: "Invalid department" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload profile picture to Cloudinary if provided
    let profilePicUrl = null;
    if (req.file) {
      try {
        profilePicUrl = await uploadToCloudinary(req.file.buffer, 'leave-tracker/profiles');
      } catch (uploadError) {
        console.error('Profile pic upload error:', uploadError);
        return res.status(500).json({ message: 'Failed to upload profile picture' });
      }
    }

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      designation,
      roles: ["Employee"], // Always register as Employee only
      department: departmentId,
      profilePic: profilePicUrl,
    });

    await user.save();

    // Add user to department's employees array
    await Department.findByIdAndUpdate(
      departmentId,
      { $push: { employees: user._id } },
      { new: true }
    );

    // Populate department before sending response
    await user.populate('department');

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        roles: user.roles,
        department: user.department,
        leaveQuota: user.leaveQuota,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email }).populate("department");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // If the account has no password set, treat as invalid for manual login
    if (!user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        roles: user.roles,
        department: user.department,
        leaveQuota: user.leaveQuota,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("department");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        designation: user.designation,
        roles: user.roles,
        department: user.department,
        leaveQuota: user.leaveQuota,
        profilePic: user.profilePic,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
