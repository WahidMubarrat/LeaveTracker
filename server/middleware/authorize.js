// Middleware to check if user has any of the allowed roles
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure next is a function
    if (typeof next !== 'function') {
      console.error('Authorize middleware: next is not a function', typeof next);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Convert allowedRoles to array if it's a string
    const allowedRolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Get user roles from token (should be an array)
    const userRoles = req.user.roles || [];
    
    // Check if user has any of the allowed roles
    const hasAllowedRole = allowedRolesArray.some(role => userRoles.includes(role));
    
    if (!hasAllowedRole) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRolesArray.join(" or ")}. Your roles: ${userRoles.join(", ") || "none"}` 
      });
    }

    // Call next to proceed to next middleware
    return next();
  };
};

module.exports = authorize;
