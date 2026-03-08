# LeaveTracker API Reference

Practical API documentation for the LeaveTracker backend.

- Base URL (local): `http://localhost:5001/api`
- Content type: `application/json` unless otherwise noted
- Auth type: Bearer JWT in `Authorization` header

```http
Authorization: Bearer <token>
```

---

## Table of Contents

1. [Conventions](#conventions)
2. [Authentication](#authentication)
3. [Departments](#departments)
4. [Users](#users)
5. [Leaves](#leaves)
6. [Leave Quota](#leave-quota)
7. [Vacations and Holidays](#vacations-and-holidays)
8. [Dashboards](#dashboards)
9. [Analytics](#analytics)
10. [Common Error Shapes](#common-error-shapes)
11. [Postman Tips](#postman-tips)

---

## Conventions

### Success Response Pattern
Most endpoints return one of:
- `{ message: string, ... }`
- `{ dataKey: ... }`

### Error Response Pattern
Most errors return:

```json
{ "message": "Human readable error message" }
```

### Role Model
Valid role values:
- `Employee`
- `HoD`
- `HR`

Token payload includes:
- `id`
- `email`
- `roles` (array)

---

## Authentication

Prefix: `/auth`

### `POST /auth/register`
Register a new employee account.

- Auth: Public
- Content-Type: `multipart/form-data` or JSON

Form fields:
- `name` (string, required)
- `email` (string, required, institutional domain)
- `password` (string, required)
- `designation` (enum, required)
- `departmentId` (ObjectId string, required)
- `profilePic` (file, optional)

Example request (JSON):

```json
{
  "name": "Alice Rahman",
  "email": "alice@iut-dhaka.edu",
  "password": "StrongPass1",
  "designation": "Lecturer",
  "departmentId": "65f0e1a5d1a0e2a11e123456"
}
```

Success `201`:

```json
{
  "message": "User registered successfully",
  "token": "<jwt>",
  "user": {
    "id": "...",
    "name": "Alice Rahman",
    "email": "alice@iut-dhaka.edu",
    "designation": "Lecturer",
    "roles": ["Employee"],
    "department": { "_id": "...", "name": "CSE" },
    "leaveQuota": {
      "annual": { "allocated": 20, "used": 0 },
      "casual": { "allocated": 10, "used": 0 }
    },
    "profilePic": null
  }
}
```

Common errors:
- `400` missing fields
- `400` invalid email domain
- `400` weak password
- `400` user already exists
- `400` invalid department

---

### `POST /auth/login`
Login and receive JWT.

- Auth: Public

Request:

```json
{
  "email": "alice@iut-dhaka.edu",
  "password": "StrongPass1"
}
```

Success `200`:

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": "...",
    "name": "Alice Rahman",
    "email": "alice@iut-dhaka.edu",
    "designation": "Lecturer",
    "roles": ["Employee"],
    "department": { "_id": "...", "name": "CSE" },
    "leaveQuota": {
      "annual": { "allocated": 20, "used": 0 },
      "casual": { "allocated": 10, "used": 0 }
    }
  }
}
```

---

### `GET /auth/profile`
Get current authenticated profile.

- Auth: Required

Success `200`:

```json
{
  "user": {
    "id": "...",
    "name": "Alice Rahman",
    "email": "alice@iut-dhaka.edu",
    "designation": "Lecturer",
    "roles": ["Employee"],
    "department": { "_id": "...", "name": "CSE" },
    "leaveQuota": {
      "annual": { "allocated": 20, "used": 0 },
      "casual": { "allocated": 10, "used": 0 }
    },
    "profilePic": null,
    "createdAt": "2026-03-08T08:00:00.000Z"
  }
}
```

---

### `POST /auth/forgot-password`
Request OTP for password reset.

- Auth: Public

Request:

```json
{ "email": "alice@iut-dhaka.edu" }
```

Success `200`:

```json
{
  "message": "OTP sent successfully to your email",
  "email": "alice@iut-dhaka.edu"
}
```

---

### `POST /auth/verify-otp`
Verify OTP.

- Auth: Public

Request:

```json
{
  "email": "alice@iut-dhaka.edu",
  "otp": "123456"
}
```

Success `200`:

```json
{
  "message": "OTP verified successfully",
  "email": "alice@iut-dhaka.edu"
}
```

---

### `POST /auth/reset-password`
Set new password after OTP verification.

- Auth: Public

Request:

```json
{
  "email": "alice@iut-dhaka.edu",
  "newPassword": "NewStrongPass1"
}
```

Success `200`:

```json
{ "message": "Password reset successfully. You can now login with your new password." }
```

---

## Departments

Prefix: `/departments`

### `GET /departments`
List all departments.

- Auth: Public (per route comments and implementation)

Success `200`:

```json
{
  "departments": [
    { "_id": "...", "name": "CSE" },
    { "_id": "...", "name": "EEE" }
  ]
}
```

---

### `GET /departments/:id`
Get department details and populated employees.

- Auth: Required

Success `200`:

```json
{
  "department": {
    "_id": "...",
    "name": "CSE",
    "employees": [
      { "_id": "...", "name": "Alice", "email": "alice@...", "profilePic": null }
    ]
  }
}
```

---

## Users

Prefix: `/users`

### `GET /users/all-users`
Get all users with roles.

- Auth: Required
- Role: `HR`

Success `200`:

```json
{
  "users": [
    {
      "_id": "...",
      "name": "Alice",
      "email": "alice@...",
      "roles": ["Employee"],
      "department": { "_id": "...", "name": "CSE" }
    }
  ]
}
```

---

### `GET /users/all-grouped`
Get all members grouped by department.

- Auth: Required
- Role: `HR`

Success `200`:

```json
{
  "departments": [
    {
      "departmentId": "...",
      "departmentName": "CSE",
      "members": [
        {
          "_id": "...",
          "name": "Alice",
          "designation": "Lecturer",
          "roles": ["Employee"],
          "currentStatus": "OnDuty",
          "returnDate": null
        }
      ]
    }
  ]
}
```

---

### `PATCH /users/:userId/role`
Assign or remove HoD role.

- Auth: Required
- Role: `HR`

Request:

```json
{ "action": "add" }
```

or

```json
{ "action": "remove" }
```

Success `200`:

```json
{
  "message": "Alice is now a Head of Department",
  "user": {
    "id": "...",
    "name": "Alice",
    "email": "alice@...",
    "roles": ["Employee", "HoD"],
    "department": { "_id": "...", "name": "CSE" }
  }
}
```

Notes:
- Prevents duplicate HoD in same department.
- Cannot remove `HR` role via this endpoint.

---

### `GET /users/department-members`
Get members of current user's department.

- Auth: Required

Success `200`:

```json
{
  "members": [
    {
      "_id": "...",
      "name": "Bob",
      "email": "bob@...",
      "designation": "Assistant Professor",
      "roles": ["Employee"],
      "currentStatus": "OnLeave",
      "currentLeave": { "endDate": "2026-03-20T00:00:00.000Z" }
    }
  ]
}
```

---

### `GET /users/department/:departmentId/members`
Get members by department id.

- Auth: Required
- Role: `HR`

Success: same shape as `/department-members` plus populated department.

---

### `GET /users/:userId/active-leave`
Get active leave details for a specific user.

- Auth: Required

Success `200`:

```json
{
  "leaveDetails": {
    "_id": "...",
    "employee": {
      "_id": "...",
      "name": "Bob",
      "email": "bob@...",
      "designation": "Lecturer",
      "profilePic": null
    },
    "department": { "_id": "...", "name": "CSE" },
    "startDate": "2026-03-15T00:00:00.000Z",
    "endDate": "2026-03-20T00:00:00.000Z",
    "status": "Approved",
    "type": "Annual"
  }
}
```

Error `404` if no active leave found.

---

### `GET /users/alternate-options`
Get eligible alternate colleagues from same department.

- Auth: Required
- Query params:
  - `startDate` (optional)
  - `endDate` (optional)

If dates are provided, members with overlapping approved leave are filtered out.

Success `200`:

```json
{
  "members": [
    {
      "_id": "...",
      "name": "Carol",
      "designation": "Associate Professor",
      "email": "carol@...",
      "profilePic": null
    }
  ]
}
```

---

### `GET /users/leave-statistics`
Get current user's quota summary.

- Auth: Required

Success `200`:

```json
{
  "leaveData": {
    "annual": { "total": 20, "taken": 4, "remaining": 16 },
    "casual": { "total": 10, "taken": 2, "remaining": 8 }
  }
}
```

---

### `GET /users/:id`
Get user by id.

- Auth: Required

Success `200`:

```json
{
  "user": {
    "_id": "...",
    "name": "Alice",
    "email": "alice@...",
    "designation": "Lecturer",
    "roles": ["Employee"],
    "department": { "_id": "...", "name": "CSE" }
  }
}
```

---

### `PUT /users/profile`
Update profile fields and optional profile picture.

- Auth: Required
- Content-Type: `application/json` or `multipart/form-data`

Fields:
- `name` (optional)
- `designation` (optional)
- `profilePic` file (optional, multipart)

Success `200`:

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "...",
    "name": "Alice Updated",
    "email": "alice@...",
    "designation": "Assistant Professor",
    "roles": ["Employee"],
    "department": { "_id": "...", "name": "CSE" },
    "leaveQuota": {
      "annual": { "allocated": 20, "used": 4 },
      "casual": { "allocated": 10, "used": 2 }
    },
    "profilePic": "https://res.cloudinary.com/..."
  }
}
```

---

### `PUT /users/change-password`
Change password for logged-in user.

- Auth: Required

Request:

```json
{
  "currentPassword": "OldPass1",
  "newPassword": "NewPass1"
}
```

Success `200`:

```json
{ "message": "Password changed successfully" }
```

---

## Leaves

Prefix: `/leaves`

### `POST /leaves/apply`
Submit leave request.

- Auth: Required
- Content-Type: `multipart/form-data` (recommended)

Form fields:
- `startDate` (required)
- `endDate` (required)
- `type` (`Annual` or `Casual`, required)
- `reason` (required for annual)
- `numberOfDays` (optional, backend validates)
- `applicationDate` (optional)
- `applicantName` (optional)
- `departmentName` (optional)
- `applicantDesignation` (optional)
- `predefinedPurposes` (JSON string array, optional)
- `alternateEmployeeIds` (JSON string array, optional)
- `backupEmployeeId` (optional, legacy)
- `leaveDocument` (file, optional or policy-required)

Success `201`:

```json
{
  "message": "Leave application submitted successfully",
  "leaveRequest": {
    "_id": "...",
    "employee": "...",
    "department": "...",
    "startDate": "2026-04-01T00:00:00.000Z",
    "endDate": "2026-04-05T00:00:00.000Z",
    "type": "Annual",
    "numberOfDays": 3,
    "status": "Pending",
    "waitingForAlternate": true
  }
}
```

Common errors:
- invalid date range
- casual leave exceeds max consecutive days
- insufficient quota
- day calculation mismatch
- required document missing for selected purpose

---

### `GET /leaves/my-applications`
Get all leave applications for current user.

- Auth: Required

Success `200`:

```json
{ "applications": [ { "_id": "...", "status": "Pending", "type": "Annual" } ] }
```

---

### `GET /leaves/my-history`
Get finalized leave history (`Approved`/`Declined`) for current user.

- Auth: Required

Success `200`:

```json
{ "applications": [ { "_id": "...", "status": "Approved" } ] }
```

---

### `GET /leaves/member-history/:userId`
Get finalized leave history of a specific member.

- Auth: Required
- Intended for HoD/HR views

---

### `GET /leaves/history`
Get leave history scoped to current user's department.

- Auth: Required

Success `200`:

```json
{ "history": [ { "_id": "...", "employee": { "name": "Alice" } } ] }
```

---

### `GET /leaves/pending-approvals`
Get pending approvals for HoD or HR.

- Auth: Required
- Role: `HoD` or `HR`

Success `200`:

```json
{
  "pendingApprovals": [
    {
      "_id": "...",
      "status": "Pending",
      "approvedByHoD": false,
      "approvedByHR": false,
      "waitingForAlternate": false,
      "employee": { "_id": "...", "name": "Alice" }
    }
  ]
}
```

---

### `PUT /leaves/:leaveId/status`
Approve or decline leave request.

- Auth: Required
- Role: `HoD` or `HR`

Request:

```json
{
  "action": "approve",
  "remarks": "Looks good"
}
```

or

```json
{
  "action": "decline",
  "remarks": "Insufficient justification"
}
```

Success `200`:

```json
{
  "message": "Leave request approved successfully",
  "leaveRequest": {
    "_id": "...",
    "status": "Pending",
    "approvedByHoD": true,
    "approvedByHR": false
  }
}
```

Notes:
- HoD approval keeps request `Pending` until HR final action.
- HR approval sets final `Approved` and deducts leave quota.

---

### `GET /leaves/:leaveId/logs`
Get action history logs for a leave request.

- Auth: Required

Success `200`:

```json
{
  "logs": [
    {
      "action": "Applied",
      "timestamp": "2026-03-08T09:00:00.000Z",
      "performedBy": null,
      "notes": ""
    },
    {
      "action": "Approved by HoD",
      "timestamp": "2026-03-09T10:00:00.000Z",
      "performedBy": { "_id": "...", "name": "HoD User" },
      "notes": "Approved"
    }
  ]
}
```

---

### `GET /leaves/alternate-requests`
Get pending alternate requests for current user.

- Auth: Required

Success `200`:

```json
{
  "alternateRequests": [
    {
      "_id": "...",
      "status": "pending",
      "applicant": { "_id": "...", "name": "Alice" },
      "leaveRequest": {
        "_id": "...",
        "startDate": "2026-04-01T00:00:00.000Z",
        "endDate": "2026-04-05T00:00:00.000Z",
        "type": "Annual"
      }
    }
  ]
}
```

---

### `PUT /leaves/alternate-requests/:alternateRequestId/respond`
Respond to alternate request.

- Auth: Required
- Body `response`: `ok` or `sorry`

Request:

```json
{ "response": "ok" }
```

Success `200`:

```json
{
  "message": "Alternate request accepted successfully",
  "alternateRequest": {
    "_id": "...",
    "status": "accepted",
    "respondedAt": "2026-03-08T10:00:00.000Z"
  }
}
```

---

### `GET /leaves/filtered-applications`
Get filtered leave applications for analytics/history modal.

- Auth: Required
- Role: `HoD` or `HR`
- Query:
  - `status`: `all|Approved|Declined|Pending`
  - `period`: `monthly|yearly`
  - `year`: number
  - `month`: number (when monthly)
  - `departmentId`: id or `all` (HR)

Success `200`:

```json
{
  "applications": [
    {
      "_id": "...",
      "status": "Approved",
      "employee": { "_id": "...", "name": "Alice" },
      "userId": { "_id": "...", "name": "Alice" }
    }
  ],
  "count": 1
}
```

---

## Leave Quota

Prefix: `/leave-quota`

### `GET /leave-quota/settings`
Get current quota settings snapshot.

- Auth: Required

Success `200`:

```json
{
  "settings": {
    "annual": 20,
    "casual": 10
  }
}
```

---

### `PUT /leave-quota/update-all`
Update allocated quota for all users.

- Auth: Required
- Role: HR intended

Request:

```json
{
  "annual": 24,
  "casual": 12
}
```

Success `200`:

```json
{
  "message": "Leave quota updated for 42 users",
  "updatedCount": 42,
  "settings": { "annual": 24, "casual": 12 }
}
```

---

### `PUT /leave-quota/update-user/:userId`
Update allocated quota for one user.

- Auth: Required
- Role: HR intended

Request:

```json
{
  "annual": 22,
  "casual": 11
}
```

Success `200`:

```json
{
  "message": "User leave quota updated successfully",
  "leaveQuota": {
    "annual": { "allocated": 22, "used": 4 },
    "casual": { "allocated": 11, "used": 2 }
  }
}
```

---

### `POST /leave-quota/reset-all`
Reset all users' `used` leave counters.

- Auth: Required
- Role: HR intended

Success `200`:

```json
{
  "message": "Leave quota reset for 42 users",
  "resetCount": 42
}
```

---

## Vacations and Holidays

Prefix: `/vacations`

### `GET /vacations`
Get all holiday entries.

- Auth: Required

Success `200`:

```json
{
  "holidays": [
    { "_id": "...", "name": "Eid", "date": "2026-04-10T00:00:00.000Z", "numberOfDays": 3 }
  ]
}
```

---

### `GET /vacations/range`
Get holidays overlapping a date range.

- Auth: Required
- Query: `startDate`, `endDate`

Success `200`:

```json
{
  "holidays": [
    { "name": "Independence Day", "date": "2026-03-26T00:00:00.000Z", "numberOfDays": 1 }
  ]
}
```

---

### `POST /vacations`
Create holiday.

- Auth: Required
- Role: `HR`

Request:

```json
{
  "name": "Independence Day",
  "date": "2026-03-26",
  "numberOfDays": 1
}
```

Success `201`:

```json
{
  "message": "Holiday created successfully",
  "holiday": {
    "_id": "...",
    "name": "Independence Day",
    "date": "2026-03-26T00:00:00.000Z",
    "numberOfDays": 1
  }
}
```

---

### `PUT /vacations/:holidayId`
Update holiday.

- Auth: Required
- Role: `HR`

Request:

```json
{
  "name": "Independence Day (Updated)",
  "date": "2026-03-26",
  "numberOfDays": 1
}
```

Success `200`:

```json
{
  "message": "Holiday updated successfully",
  "holiday": { "_id": "...", "name": "Independence Day (Updated)" }
}
```

---

### `DELETE /vacations/:holidayId`
Delete holiday.

- Auth: Required
- Role: `HR`

Success `200`:

```json
{ "message": "Holiday deleted successfully" }
```

---

### `POST /vacations/upload`
Upload holiday PDF and extract entries.

- Auth: Required
- Role: `HR`
- Content-Type: `multipart/form-data`
- File field name: `holidayFile`
- Accepted type: PDF only

Success `200`:

```json
{
  "message": "Successfully extracted 8 holiday(s) from the file",
  "holidays": [
    { "name": "Shaheed Day", "date": "2026-02-21", "numberOfDays": 1 }
  ],
  "rawText": "..."
}
```

---

### `POST /vacations/bulk`
Save reviewed extracted holidays.

- Auth: Required
- Role: `HR`

Request:

```json
{
  "holidays": [
    { "name": "Shaheed Day", "date": "2026-02-21", "numberOfDays": 1 },
    { "name": "Pohela Boishakh", "date": "2026-04-14", "numberOfDays": 1 }
  ]
}
```

Success `201`:

```json
{
  "message": "Processed 2 holidays: 2 saved, 0 skipped, 0 errors",
  "results": {
    "saved": [ { "_id": "...", "name": "Shaheed Day" } ],
    "skipped": [],
    "errors": []
  }
}
```

---

## Dashboards

### `GET /hod-dashboard/stats`
HoD dashboard summary for current HoD's department.

- Auth: Required
- Role: `HoD`

Success `200`:

```json
{
  "memberStats": {
    "totalMembers": 12,
    "activeMembers": 10,
    "membersOnLeave": 2
  },
  "requestStats": {
    "totalRequests": 20,
    "acceptedRequests": 12,
    "declinedRequests": 3,
    "pendingRequests": 5
  },
  "latestPendingRequest": {
    "_id": "...",
    "employee": { "name": "Alice", "designation": "Lecturer" },
    "department": { "name": "CSE" }
  }
}
```

---

### `GET /hr-dashboard/stats`
Organization-wide dashboard summary.

- Auth: Required
- Role: `HR`

Success `200`:

```json
{
  "memberStats": {
    "totalMembers": 60,
    "activeMembers": 55,
    "membersOnLeave": 5,
    "totalDepartments": 6
  },
  "requestStats": {
    "totalRequests": 40,
    "acceptedRequests": 25,
    "declinedRequests": 5,
    "pendingRequests": 10
  },
  "latestPendingRequest": {
    "_id": "...",
    "employee": { "name": "Bob", "designation": "Assistant Professor" },
    "department": { "name": "EEE" }
  }
}
```

---

## Analytics

Prefix: `/analytics`

### `GET /analytics/hod`
Department analytics for HoD.

- Auth: Required
- Role: `HoD`
- Query:
  - `period=monthly|yearly`
  - `year=2026`
  - `month=2` (if monthly)

Example:

```http
GET /api/analytics/hod?period=monthly&year=2026&month=2
```

Success `200` includes:
- `stats`
- `monthlyBreakdown` (yearly mode)
- `topEmployees`
- `recentRequests`

---

### `GET /analytics/hr`
Organization analytics for HR with optional department filter.

- Auth: Required
- Role: `HR`
- Query:
  - `period=monthly|yearly`
  - `year=2026`
  - `month=2` (if monthly)
  - `departmentId=<id>|all`

Example:

```http
GET /api/analytics/hr?period=yearly&year=2026&departmentId=all
```

Success `200` includes:
- `stats`
- `monthlyBreakdown` (yearly mode)
- `departmentStats`
- `topEmployees`
- `recentRequests`

---

## Common Error Shapes

### Unauthorized (no token)

```json
{ "message": "No token, authorization denied" }
```

### Invalid token

```json
{ "message": "Token is not valid" }
```

### Forbidden role

```json
{ "message": "Access denied. Required role: HR. Your roles: Employee" }
```

### Validation failure

```json
{ "message": "End date cannot be before start date" }
```

### Not found

```json
{ "message": "User not found" }
```

### Server error

```json
{ "message": "Server error" }
```

---

## Postman Tips

1. Create an environment variable `baseUrl = http://localhost:5001/api`.
2. Save login token into `token` variable from `POST /auth/login` response.
3. Add header on protected requests:

```http
Authorization: Bearer {{token}}
```

4. For multipart endpoints (`/auth/register`, `/users/profile`, `/leaves/apply`, `/vacations/upload`), switch body type to form-data.
5. Keep sample users for each role to test role-specific endpoints quickly.
