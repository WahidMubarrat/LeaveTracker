const Vacation = require("../models/Vacation");

// Get all holidays
exports.getAllHolidays = async (req, res) => {
  try {
    const holidays = await Vacation.find().sort({ date: 1 });
    res.json({ holidays });
  } catch (error) {
    console.error("Get all holidays error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get holidays within a date range
exports.getHolidaysInRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: "Start date and end date are required" 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set time to start/end of day to ensure proper comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (end < start) {
      return res.status(400).json({ 
        message: "End date cannot be before start date" 
      });
    }

    // Fetch holidays that could potentially overlap with the date range
    // Get holidays that start before or on the end date
    const allHolidays = await Vacation.find({
      date: { $lte: end }
    }).sort({ date: 1 });

    // Filter holidays that actually overlap with the date range
    const holidays = allHolidays.filter(holiday => {
      const holidayStart = new Date(holiday.date);
      holidayStart.setHours(0, 0, 0, 0);
      const holidayEnd = new Date(holidayStart);
      holidayEnd.setDate(holidayEnd.getDate() + holiday.numberOfDays - 1);
      holidayEnd.setHours(23, 59, 59, 999);
      
      // Check if holiday overlaps with the date range
      return holidayStart <= end && holidayEnd >= start;
    });

    res.json({ holidays });
  } catch (error) {
    console.error("Get holidays in range error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new holiday
exports.createHoliday = async (req, res) => {
  try {
    console.log('=== CREATE HOLIDAY REQUEST ===');
    console.log('Request body:', req.body);
    console.log('User from token:', req.user);
    console.log('User roles:', req.user?.roles);
    console.log('===========================');

    // Verify requester is HR (backup check)
    const isHR = req.user && Array.isArray(req.user.roles) && req.user.roles.includes("HR");

    if (!isHR) {
      console.error('Authorization failed - user is not HR');
      return res.status(403).json({ 
        message: "Only HR can create holidays",
        debug: {
          roles: req.user?.roles
        }
      });
    }

    const { name, date, numberOfDays } = req.body;

    // Validate required fields
    if (!name || !date) {
      return res.status(400).json({ 
        message: "Holiday name and date are required" 
      });
    }

    // Validate date
    const holidayDate = new Date(date);
    if (isNaN(holidayDate.getTime())) {
      return res.status(400).json({ 
        message: "Invalid date format" 
      });
    }

    // Normalize date to start of day for comparison
    holidayDate.setHours(0, 0, 0, 0);

    // Validate numberOfDays
    const days = numberOfDays ? Number(numberOfDays) : 1;
    if (days < 1 || days > 30) {
      return res.status(400).json({ 
        message: "Number of days must be between 1 and 30" 
      });
    }

    // Check if holiday already exists on this date
    // Normalize dates for comparison (compare only date part, ignore time)
    const startOfDay = new Date(holidayDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(holidayDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingHoliday = await Vacation.findOne({ 
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });
    
    if (existingHoliday) {
      return res.status(400).json({ 
        message: "A holiday already exists on this date" 
      });
    }

    console.log('Creating holiday with data:', {
      name: name.trim(),
      date: holidayDate,
      numberOfDays: days
    });

    const holiday = new Vacation({
      name: name.trim(),
      date: holidayDate,
      numberOfDays: days
    });

    console.log('Holiday object created, attempting to save...');
    await holiday.save();
    console.log('Holiday saved successfully:', holiday._id);

    res.status(201).json({ 
      message: "Holiday created successfully",
      holiday 
    });
  } catch (error) {
    console.error("Create holiday error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "Validation error",
        errors: messages
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "A holiday already exists on this date" 
      });
    }
    
    res.status(500).json({ 
      message: error.message || "Server error",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update a holiday
exports.updateHoliday = async (req, res) => {
  try {
    // Verify requester is HR (backup check)
    if (!req.user || !req.user.roles || !req.user.roles.includes("HR")) {
      return res.status(403).json({ message: "Only HR can update holidays" });
    }

    const { holidayId } = req.params;
    const { name, date, numberOfDays } = req.body;

    const holiday = await Vacation.findById(holidayId);
    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    // Update fields if provided
    if (name !== undefined) {
      holiday.name = name.trim();
    }
    if (date !== undefined) {
      const holidayDate = new Date(date);
      if (isNaN(holidayDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      
      // Check if another holiday exists on this date (excluding current holiday)
      const existingHoliday = await Vacation.findOne({ 
        date: holidayDate,
        _id: { $ne: holidayId }
      });
      if (existingHoliday) {
        return res.status(400).json({ 
          message: "A holiday already exists on this date" 
        });
      }
      
      holiday.date = holidayDate;
    }
    if (numberOfDays !== undefined) {
      const days = Number(numberOfDays);
      if (days < 1) {
        return res.status(400).json({ 
          message: "Number of days must be at least 1" 
        });
      }
      holiday.numberOfDays = days;
    }

    await holiday.save();

    res.json({ 
      message: "Holiday updated successfully",
      holiday 
    });
  } catch (error) {
    console.error("Update holiday error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a holiday
exports.deleteHoliday = async (req, res) => {
  try {
    // Verify requester is HR (backup check)
    if (!req.user || !req.user.roles || !req.user.roles.includes("HR")) {
      return res.status(403).json({ message: "Only HR can delete holidays" });
    }

    const { holidayId } = req.params;

    const holiday = await Vacation.findByIdAndDelete(holidayId);
    if (!holiday) {
      return res.status(404).json({ message: "Holiday not found" });
    }

    res.json({ 
      message: "Holiday deleted successfully" 
    });
  } catch (error) {
    console.error("Delete holiday error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

