require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const connectDB = require("./config/db");
const passport = require("./config/passport"); // Import configured passport

// Import routes
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const userRoutes = require("./routes/userRoutes");
const leaveRoutes = require("./routes/leaveRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));  
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaves", leaveRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "LeaveTracker API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
