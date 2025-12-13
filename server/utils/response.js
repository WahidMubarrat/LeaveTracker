// Response helper functions for consistent API responses

exports.successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

exports.errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};

exports.validationError = (res, message) => {
  return res.status(400).json({
    success: false,
    message
  });
};

exports.unauthorizedError = (res, message = "Unauthorized access") => {
  return res.status(401).json({
    success: false,
    message
  });
};

exports.notFoundError = (res, message = "Resource not found") => {
  return res.status(404).json({
    success: false,
    message
  });
};

exports.serverError = (res, error, message = "Server error") => {
  console.error(message, error);
  return res.status(500).json({
    success: false,
    message
  });
};
