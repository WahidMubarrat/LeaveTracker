# LeaveTracker Backend API

A comprehensive leave management system backend built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Employee profiles with department associations
- **Leave Management**: Complete leave application and approval workflow
- **Department Management**: Department-based organization structure
- **Leave Quota Tracking**: Automatic quota deduction upon approval

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: MongoDB with Mongoose 9.0.1
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcryptjs 3.0.3
- **Environment**: dotenv 17.2.3

## Project Structure

```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── departmentController.js # Department operations
│   ├── leaveController.js    # Leave management
│   └── userController.js     # User operations
├── middleware/
│   └── authMiddleware.js     # JWT verification
├── models/
│   ├── Department.js         # Department schema
│   ├── LeaveHistoryLog.js    # Leave history tracking
│   ├── LeaveRequest.js       # Leave request schema
│   └── User.js               # User schema
├── routes/
│   ├── authRoutes.js         # Auth endpoints
│   ├── departmentRoutes.js   # Department endpoints
│   ├── leaveRoutes.js        # Leave endpoints
│   └── userRoutes.js         # User endpoints
├── utils/
│   ├── response.js           # Response helpers
│   └── validation.js         # Validation helpers
├── .env                      # Environment variables
├── index.js                  # Server entry point
└── seedDepartments.js        # Database seeding script
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile (Protected)

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID (Protected)

### Users
- `GET /api/users/department-members` - Get members from user's department (Protected)
- `GET /api/users/:id` - Get user by ID (Protected)
- `PUT /api/users/profile` - Update user profile (Protected)

### Leaves
- `POST /api/leaves/apply` - Apply for leave (Protected)
- `GET /api/leaves/my-applications` - Get user's leave applications (Protected)
- `GET /api/leaves/history` - Get department leave history (Protected)
- `GET /api/leaves/pending-approvals` - Get pending approvals (HoD/HoA only)
- `PUT /api/leaves/:leaveId/status` - Approve/Decline leave (HoD/HoA only)
- `GET /api/leaves/:leaveId/logs` - Get leave request history logs (Protected)

## Environment Variables

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file with required variables (see above)

### 3. Seed Database
```bash
node seedDepartments.js
```

### 4. Start Server
```bash
npm start
```

Server will run on `http://localhost:5000`

## User Roles

- **Employee**: Can apply for leave, view personal history
- **HoD** (Head of Department): Can approve/decline leaves from their department
- **HoA** (Head of Administration): Final approval authority for all leaves

## Leave Approval Workflow

1. Employee submits leave application
2. HoD reviews and approves/declines
3. If approved by HoD, HoA provides final approval
4. Leave quota is deducted upon HoA approval
5. All actions are logged in leave history

## Validation Rules

### Registration
- Name, email, password, and department are required
- Email must contain '@' symbol
- Password minimum 6 characters with uppercase and lowercase letters
- Department must be valid

### Leave Application
- Start date, end date, and leave type are required
- End date cannot be before start date
- Sufficient leave quota must be available
- Quota types: Annual (30 days), Sick (10 days)

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token expiration (7 days)
- Protected routes with authentication middleware
- Role-based access control for sensitive operations
- Request payload limit (50MB for profile pictures)

## Error Handling

All endpoints return consistent JSON responses:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Development Notes

- All database queries use async/await
- Error logging to console for debugging
- Modular controller structure for maintainability
- Centralized validation and response utilities
- Population of referenced documents for complete data

## License

MIT
