require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const userRoutes = require("./routes/userRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const leaveQuotaRoutes = require("./routes/leaveQuotaRoutes");
const vacationRoutes = require("./routes/vacationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB (skip during tests)
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/leave-quota", leaveQuotaRoutes);
app.use("/api/vacations", vacationRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "LeaveTracker API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error caught by middleware:');
  console.error(err.stack);
  res.status(500).json({ 
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
