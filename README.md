# LeaveTracker

A full-stack leave management platform for academic organizations, with role-based workflows for **Employee**, **Head of Department (HoD)**, and **HR**.

LeaveTracker handles:
- Leave application and approval pipeline
- Alternate colleague assignment and response
- Leave quota management
- Department and role administration
- Holiday management (manual + PDF extraction)
- Dashboards and analytics for HoD and HR
- OTP-based password reset and profile management

---

## Table of Contents

1. [Project Goals](#project-goals)
2. [Core Features](#core-features)
3. [Role Model](#role-model)
4. [Tech Stack](#tech-stack)
5. [Architecture Overview](#architecture-overview)
6. [Repository Structure](#repository-structure)
7. [Data Model](#data-model)
8. [Business Workflow](#business-workflow)
9. [Environment Variables](#environment-variables)
10. [Local Development Setup](#local-development-setup)
11. [Seed and Utility Scripts](#seed-and-utility-scripts)
12. [Frontend Route Map](#frontend-route-map)
13. [Backend API Reference](#backend-api-reference)
14. [Validation and Business Rules](#validation-and-business-rules)
15. [Notifications and Emails](#notifications-and-emails)
16. [File Uploads and Cloudinary](#file-uploads-and-cloudinary)
17. [Analytics Logic](#analytics-logic)
18. [Deployment Notes](#deployment-notes)
19. [Troubleshooting](#troubleshooting)
20. [Current Gaps and Improvement Ideas](#current-gaps-and-improvement-ideas)

---

## Project Goals

This project is designed to solve common leave-management pain points:
- Manual leave tracking across departments
- Lack of clear multi-level approvals
- No visibility into who is currently on leave
- Limited reporting for HR and HoD
- Friction in collecting supporting documents and handling alternates

LeaveTracker provides a centralized workflow with traceability, policy checks, and role-specific visibility.

---

## Core Features

### Authentication and Account
- Register with institutional email
- Login with JWT-based auth
- Profile retrieval and update
- Change password
- Forgot password with OTP verification by email

### Employee Features
- Submit leave application with:
  - Leave type (Annual/Casual)
  - Date range
  - Reason / predefined purposes
  - Optional or required document (policy-based)
  - Alternate colleague(s)
- View application status
- View personal leave history
- View colleagues in department and their current status (OnDuty/OnLeave)
- Respond to incoming alternate requests

### HoD Features
- Department dashboard
- View pending leave approvals (department scope)
- Approve/decline requests
- Department analytics
- Department member status view

### HR Features
- Organization-wide dashboard
- Final approval/decline after HoD stage
- Leave quota setup for all users or individual users
- Annual reset of used leave days
- Manage holidays manually and in bulk
- Upload holiday PDF and extract holiday entries
- Promote/demote HoD role (with department-level constraints)
- Organization-level analytics and filtering

---

## Role Model

Users have a `roles` array, allowing multi-role users.

Supported roles:
- `Employee`
- `HoD`
- `HR`

Important behavior:
- Registration defaults to `Employee`.
- HoD role is assigned by HR.
- A HoD can also remain an Employee.
- HR has the highest UI routing priority.

Role-based page redirection and route protection are implemented in:
- `client/src/components/RoleBasedRoute.jsx`
- `client/src/components/ProtectedRoute.jsx`

---

## Tech Stack

### Frontend
- React 19
- React Router DOM 7
- Axios
- Chart.js + react-chartjs-2
- Vite 7
- CSS modules/files (project uses many feature-specific stylesheets)

### Backend
- Node.js + Express 5
- MongoDB + Mongoose
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Multer for file upload handling
- Cloudinary for image/document storage
- Nodemailer (Gmail transport) for OTP and workflow emails
- PDF parsing (`pdf-parse`) and OCR/extraction utilities for holidays

---

## Architecture Overview

### High-Level Flow
1. Frontend sends requests through a centralized Axios client (`client/src/services/api.js`).
2. JWT token is attached by Axios request interceptor.
3. Backend verifies token via `authMiddleware`.
4. Role gates enforced by either:
   - `authorize(...)` middleware, or
   - explicit role checks inside controllers.
5. Controllers execute business logic and query/update MongoDB models.
6. Email notifications are triggered for key events.
7. Frontend updates dashboards, status pages, and analytics views.

### Backend Modules
- **Routes**: endpoint definitions and middleware chaining
- **Controllers**: business logic
- **Models**: MongoDB schemas
- **Middleware**: auth, role authorization, uploads
- **Utils**: cloudinary upload, email templates, leave-day calculations, PDF holiday extraction

---

## Repository Structure

```text
LeaveTracker/
  client/
    src/
      components/        # Reusable UI components (cards, modals, navbars, charts)
      context/           # Auth context + session state
      pages/             # Role-specific pages
      services/          # Axios API wrappers
      styles/            # Feature-specific stylesheets
      utils/             # Frontend helpers (e.g., PDF export)
      App.jsx            # Route map and role gates
      main.jsx           # React bootstrap
  server/
    config/              # DB + cloudinary config
    controllers/         # Core business logic
    middleware/          # JWT auth, role authorization, upload settings
    models/              # Mongoose schemas
    routes/              # API route groups
    utils/               # Email, leave math, file extraction, upload helper
    index.js             # Express app bootstrap
    seedDepartments.js   # Seed departments
    createHR.js          # Utility to create HR account
    createTestLeaves.js  # Legacy test data helper (see notes)
```

---

## Data Model

### `User`
Path: `server/models/User.js`

Key fields:
- `name`, `email`, `password`
- `designation` (lecturer/professor hierarchy)
- `roles` (array)
- `department` (ref `Department`)
- `leaveQuota`
  - `annual.allocated`, `annual.used`
  - `casual.allocated`, `casual.used`
- `profilePic`
- `currentStatus` (`OnDuty` or `OnLeave`)
- `currentLeave` (ref `LeaveRequest`)

Methods:
- `hasRole(role)`
- `isOnLeave()`
- `updateLeaveStatus()`

Virtual:
- `role` (first role, for backward compatibility)

### `LeaveRequest`
Path: `server/models/LeaveRequest.js`

Tracks the full leave lifecycle:
- Applicant + department refs
- Date range and day count
- Leave type: `Annual` or `Casual`
- Reason + optional document URL
- Alternate handling (`alternateEmployees[]`)
- Multi-stage approvals:
  - `approvedByHoD`
  - `approvedByHR`
- Final `status`: `Pending`, `Approved`, `Declined`
- `waitingForAlternate` flag

### `AlternateRequest`
Path: `server/models/AlternateRequest.js`

Separate entity for alternate-response workflow:
- Leave ref
- Applicant ref
- Alternate ref
- `status`: `pending`, `accepted`, `declined`

### `LeaveHistoryLog`
Path: `server/models/LeaveHistoryLog.js`

Event/audit style records such as:
- Applied
- Approved by HoD
- Approved by HR
- Declined by HoD/HR/Alternate

### `Department`
Path: `server/models/Department.js`

- `name`
- `employees` refs

### `Vacation`
Path: `server/models/Vacation.js`

Public holidays:
- holiday name
- date
- number of days (supports multi-day holidays)

### `OTP`
Path: `server/models/OTP.js`

- email + OTP
- auto-expire (TTL) after 10 minutes
- failed-attempt counter

---

## Business Workflow

### Leave Application (Employee)
1. Employee fills leave form.
2. System validates date range and computes weekdays excluding weekends/holidays.
3. Quota check is performed against user's leave balance.
4. If alternates are selected, request may wait for alternate acceptance.
5. If alternate accepts, request moves to approval queue.
6. Approval chain:
   - Employee request: HoD -> HR
   - HoD's own request: HR directly
7. On final HR approval:
   - leave marked approved
   - leave quota deducted
   - status/logs updated
8. Emails are sent for alternate requests and status changes.

### Alternate Workflow
- Alternate can respond `ok` or `sorry`.
- If `ok`: request can proceed from waiting state.
- If `sorry`: request can be declined according to current controller logic.

### Holiday Workflow
- HR can create/update/delete holiday entries manually.
- HR can upload holiday PDF; system extracts possible date/name pairs.
- HR can review and bulk-save extracted results.

---

## Environment Variables

### Server (`server/.env`)

Reference values from `server/.env.example`.

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# IMPORTANT: backend code reads MONGO_URI
MONGO_URI=mongodb://localhost:27017/leavetracker

JWT_SECRET=your_long_random_secret

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

Note:
- `server/.env.example` currently shows `MONGODB_URI`, but code in `server/config/db.js` uses `MONGO_URI`.
- Use `MONGO_URI` in your actual `.env` unless you update code for consistency.

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5001/api
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- npm
- MongoDB running locally (or cloud MongoDB URI)
- Cloudinary account (if using uploads)
- Gmail app password (if using OTP/email features)

### 1. Install dependencies

From project root:

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure environment files

Create:
- `server/.env`
- `client/.env`

Use the variable sections above.

### 3. Start backend

```bash
cd server
npm run dev
```

Backend default URL: `http://localhost:5001`

### 4. Start frontend

```bash
cd client
npm run dev
```

Frontend default URL: `http://localhost:5173`

---

## Seed and Utility Scripts

### Seed departments

```bash
cd server
node seedDepartments.js
```

### Create HR account

```bash
cd server
node createHR.js
```

Important:
- Update default credentials in `server/createHR.js` before production use.

### Create test leaves (legacy)

```bash
cd server
node createTestLeaves.js
```

Note:
- This script appears based on older fields and may require updates before use.

---

## Frontend Route Map

Defined primarily in `client/src/App.jsx`.

### Public Routes
- `/login`
- `/register`
- `/forgot-password`

### Employee/HoD Shared
- `/profile`
- `/members`
- `/leave-history`
- `/leave-application`
- `/application-status`
- `/alternate-requests`

### HR Routes
- `/hr/dashboard`
- `/hr/system-settings`
- `/hr/review-application`
- `/hr/employees`
- `/hr/leave-analytics`

### HoD Routes
- `/hod/dashboard`
- `/hod/pending-requests`
- `/hod/department-members`
- `/hod/analytics`

---

## Backend API Reference

Base URL: `http://localhost:5001/api`

Auth style:
- Protected endpoints require `Authorization: Bearer <token>`

### Auth (`/api/auth`)
- `POST /register` - create user account
- `POST /login` - login
- `POST /forgot-password` - request OTP
- `POST /verify-otp` - verify OTP
- `POST /reset-password` - set new password
- `GET /profile` - current user profile

### Departments (`/api/departments`)
- `GET /` - all departments (public endpoint in route file)
- `GET /:id` - department details with employees (auth required)

### Users (`/api/users`)
- `GET /all-users` - HR only
- `GET /all-grouped` - HR only, grouped by department
- `PATCH /:userId/role` - HR role management for HoD assignment
- `GET /department-members` - current user's department members
- `GET /department/:departmentId/members` - HR member view by department
- `GET /:userId/active-leave` - active leave details for a user
- `GET /alternate-options` - potential alternates with optional date filtering
- `GET /leave-statistics` - current user's leave summary
- `GET /:id` - user by id
- `PUT /profile` - update profile + optional profile image upload
- `PUT /change-password` - change current user password

### Leaves (`/api/leaves`)
- `POST /apply` - submit leave request (+ optional document upload)
- `GET /my-applications` - applicant's submissions
- `GET /my-history` - applicant's finalized leave history
- `GET /history` - department leave history
- `GET /member-history/:userId` - member history for HoD/HR use
- `GET /pending-approvals` - approval queue for HoD/HR
- `PUT /:leaveId/status` - approve/decline by HoD/HR
- `GET /:leaveId/logs` - request event logs
- `GET /alternate-requests` - pending alternate requests for logged-in user
- `PUT /alternate-requests/:alternateRequestId/respond` - alternate response
- `GET /filtered-applications` - analytics filtering endpoint

### Leave Quota (`/api/leave-quota`)
- `GET /settings`
- `PUT /update-all`
- `PUT /update-user/:userId`
- `POST /reset-all`

### Vacations/Holidays (`/api/vacations`)
- `GET /` - all holidays
- `GET /range` - holidays in date range
- `POST /` - create holiday (HR)
- `PUT /:holidayId` - update holiday (HR)
- `DELETE /:holidayId` - delete holiday (HR)
- `POST /upload` - upload PDF and extract holidays (HR)
- `POST /bulk` - save extracted holidays in bulk (HR)

### Dashboards
- HoD: `GET /api/hod-dashboard/stats`
- HR: `GET /api/hr-dashboard/stats`

### Analytics
- HoD: `GET /api/analytics/hod?period=monthly&year=2026&month=2`
- HR: `GET /api/analytics/hr?period=yearly&year=2026&departmentId=all`

---

## Validation and Business Rules

### Password Rules
- Minimum length 6
- Must contain uppercase and lowercase

### Email Rules
- Registration currently validates institutional domain (`@iut-dhaka.edu`)

### Leave Rules
- End date cannot be before start date
- Leave days are calculated as weekdays excluding weekends and configured holidays
- Casual leave cannot exceed 2 consecutive days
- Leave quota must be sufficient
- Annual leave requires reason
- Supporting document required for selected annual-purpose types (`Medical`/`Conference`)

### Approval Rules
- HoD approval required before HR approval (except HoD self-leave path)
- HR final approval updates quota usage
- Decline actions generate history and notifications

---

## Notifications and Emails

`server/utils/emailService.js` handles:
- OTP email for password reset
- Alternate request notification
- Approval/decline result notification to applicant
- Notification to HoD for pending review
- Notification to HR for pending review

Transport uses Gmail credentials from env vars.

---

## File Uploads and Cloudinary

### Upload Entry Points
- Profile picture upload (`/api/auth/register`, `/api/users/profile`)
- Leave document upload (`/api/leaves/apply`)
- Holiday PDF upload (`/api/vacations/upload`)

### Limits and Types
- Image upload middleware (`server/middleware/upload.js`):
  - image-only
  - max 5MB
- Holiday upload middleware (`server/controllers/holidayUploadController.js`):
  - PDF-only
  - max 10MB

### Storage
- Files are kept in memory by Multer and streamed to Cloudinary via `server/utils/cloudinaryUpload.js`.

---

## Analytics Logic

Analytics controller: `server/controllers/analyticsController.js`

Key ideas:
- Supports monthly and yearly windows
- Counts requests by status and type
- Computes day totals using overlap calculations within the selected time period
- Excludes weekends and holidays in overlap-day calculations
- Builds:
  - top employees by approved leave days
  - monthly breakdown for yearly mode
  - department-level comparison for HR

---

## Deployment Notes

### Frontend
- Vite app with SPA rewrite config in `client/vercel.json`
- Works with static hosting providers (Vercel/Netlify/etc.)

### Backend
- Node/Express API (deploy to Render, Railway, VPS, etc.)
- Ensure environment variables are set in deployment platform
- Configure CORS `CLIENT_URL` to production frontend URL

### Production Recommendations
- Use strong `JWT_SECRET`
- Remove hardcoded utility credentials from scripts
- Restrict debug logs
- Add rate limiting and security middleware (helmet, brute-force prevention)
- Add automated tests and CI

---

## Troubleshooting

### Backend cannot connect to MongoDB
- Check MongoDB is running
- Confirm `MONGO_URI` in `server/.env`
- Verify URI/network access for cloud database

### CORS errors from frontend
- Confirm frontend URL matches `CLIENT_URL` in server env
- Ensure backend is running and accessible from frontend

### OTP email not sending
- Confirm `EMAIL_USER` and app password
- Check Gmail account security/app-password setup
- Check server logs for nodemailer errors

### File upload failing
- Check file size and allowed type
- Ensure Cloudinary credentials are valid
- Verify routes use correct multipart field names

### Role access issues
- Ensure JWT contains `roles`
- Re-login after role changes to refresh token payload

---

## Current Gaps and Improvement Ideas

1. **Env naming consistency**
- Align `MONGODB_URI` and `MONGO_URI` usage across files.

2. **Legacy script cleanup**
- `createTestLeaves.js` references fields that do not match current `User` schema.

3. **Department schema/controller alignment**
- `departmentController` populates `hod`, but `Department` schema does not currently define it.

4. **Testing**
- Jest is configured, but no `server/tests` directory was found.

5. **Authorization consistency**
- Some endpoints enforce roles in middleware, others inside controllers. Standardize for maintainability.

6. **Data integrity protections**
- Consider transactions for multi-step operations (leave request + alternate requests + logs + notifications).

7. **Security hardening**
- Add request validation library (e.g., zod/joi), rate limits, and centralized error normalization.

---

If you are onboarding to this codebase, a good first path is:
1. Run backend and frontend locally.
2. Seed departments and create HR user.
3. Register employee accounts and assign HoD role via HR panel.
4. Submit leave requests and follow them through alternate/HoD/HR states.
5. Explore analytics pages and compare results with database records.
