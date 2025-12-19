# Multi-Role System Documentation

## Overview
The system now supports users having multiple roles simultaneously. This allows a user to be both an Employee and a Head of Department (HoD), for example.

## Database Changes

### User Model Updates
- **Old field:** `role` (String) - Single role per user
- **New field:** `roles` (Array of Strings) - Multiple roles per user
- **Backward compatibility:** A virtual `role` property returns the primary role (first in array)

### Valid Roles
- `Employee` - Regular employee (default)
- `HoD` - Head of Department
- `HR` - Human Resources / Head of Administration

## Registration Behavior
- New users can ONLY register as `Employee`
- Multi-role assignment must be done manually after registration
- This prevents users from self-assigning privileged roles

## Migration
All existing users have been migrated to the new multi-role system:
- Old `role` field values converted to `roles` array
- Example: `role: "Employee"` → `roles: ["Employee"]`

## Adding Additional Roles to Users

### Method 1: Using the addRoleToUser Script
```bash
node addRoleToUser.js <email> <role>
```

**Example:** Make a user a Head of Department
```bash
node addRoleToUser.js john@example.com HoD
```

**Example:** Add HR role to a user
```bash
node addRoleToUser.js sarah@example.com HR
```

### Method 2: Direct MongoDB Update
```javascript
const user = await User.findOne({ email: "user@example.com" });
user.roles.push("HoD");
await user.save();
```

### Method 3: Using MongoDB Compass or Shell
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $addToSet: { roles: "HoD" } }
);
```

## Checking User Roles in Code

### Using the hasRole() method (Recommended)
```javascript
const user = await User.findById(userId);

if (user.hasRole("HoD")) {
  // User is a Head of Department
}

if (user.hasRole("HR")) {
  // User is HR
}
```

### Checking the roles array
```javascript
if (user.roles.includes("HoD")) {
  // User is a Head of Department
}
```

### Using the virtual 'role' property
```javascript
// Returns the primary role (first in array)
const primaryRole = user.role; // "Employee", "HoD", or "HR"
```

## API Response Format
User objects now include both `role` (backward compatibility) and `roles`:

```json
{
  "user": {
    "id": "123...",
    "name": "John Doe",
    "email": "john@example.com",
    "designation": "Professor",
    "role": "Employee",      // Primary role (first in array)
    "roles": ["Employee", "HoD"],  // All roles
    "department": {...},
    "leaveQuota": {...}
  }
}
```

## Frontend Usage
The frontend can check user roles like this:

```javascript
// Check primary role
if (user.role === "HR") {
  navigate('/hr/system-settings');
}

// Check all roles
if (user.roles.includes("HoD")) {
  // Show HoD-specific features
}

// Check if user has either HoD or HR role
if (user.roles.some(role => ["HoD", "HR"].includes(role))) {
  // Show management features
}
```

## Example Use Cases

### Scenario 1: Professor who is also HoD
```bash
# User registers normally as Employee
# Later, admin adds HoD role
node addRoleToUser.js professor@example.com HoD
# Result: roles = ["Employee", "HoD"]
```

### Scenario 2: Department member promoted to HoD
```bash
node addRoleToUser.js member@example.com HoD
# Result: roles = ["Employee", "HoD"]
# They can still apply for leaves as Employee
# AND approve department leaves as HoD
```

### Scenario 3: Removing a role
```javascript
const user = await User.findOne({ email: "user@example.com" });
user.roles = user.roles.filter(role => role !== "HoD");
await user.save();
```

## Important Notes

1. **Registration:** Users can ONLY register with Employee role
2. **Primary Role:** The first role in the array is considered primary
3. **Backward Compatibility:** Old code using `user.role` continues to work
4. **Validation:** Users must have at least one role at all times
5. **JWT Token:** Contains the `roles` array for role-based authorization

## Scripts Reference

- `migrateToMultiRole.js` - Migrates old single-role users to multi-role system
- `addRoleToUser.js` - Adds a role to an existing user
- `fixHRUser.js` - Fixes the HR user account (one-time fix)
- `createHoA.js` - Creates the HR user account (updated for multi-role)
