// Validation helper functions

// Validate email format
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
exports.isValidPassword = (password) => {
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  if (!hasUppercase || !hasLowercase) {
    return { valid: false, message: "Password must contain both uppercase and lowercase letters" };
  }

  return { valid: true };
};

// Validate date range
exports.isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: "Invalid date format" };
  }

  if (end < start) {
    return { valid: false, message: "End date cannot be before start date" };
  }

  return { valid: true, start, end };
};

// Calculate number of days between two dates (inclusive)
exports.calculateDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};
