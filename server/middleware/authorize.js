// Middleware to check if user's active role is in allowed roles
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!req.user.activeRole) {
      return res.status(403).json({ message: "No active role set" });
    }

    if (!allowedRoles.includes(req.user.activeRole)) {
      return res.status(403).json({ 
        message: `Access denied. Required role: ${allowedRoles.join(" or ")}. Your active role: ${req.user.activeRole}` 
      });
    }

    next();
  };
};

module.exports = authorize;
