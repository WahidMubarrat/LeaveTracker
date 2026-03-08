# LeaveTracker Quick Start

A short guide to run the project and start using it fast.

---

## What Is LeaveTracker?

LeaveTracker is a leave management app with 3 user roles:
- **Employee**: apply for leave, track status, see history
- **HoD**: review department leave requests
- **HR**: final approvals, role management, quotas, holidays, analytics

---

## Before You Start

Install these first:
- Node.js (v18 or later)
- npm
- MongoDB (local or cloud)

You also need:
- Cloudinary account (for uploads)
- Gmail app password (for OTP and email notifications)

---

## 1. Install Dependencies

Open two terminals.

### Terminal A (Backend)

```bash
cd server
npm install
```

### Terminal B (Frontend)

```bash
cd client
npm install
```

---

## 2. Configure Environment Files

### Server env file
Create `server/.env`:

```env
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/leavetracker
JWT_SECRET=your_long_random_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
```

### Client env file
Create `client/.env`:

```env
VITE_API_URL=http://localhost:5001/api
```

---

## 3. Start the App

### Start backend

```bash
cd server
npm run dev
```

Backend runs on: `http://localhost:5001`

### Start frontend

```bash
cd client
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 4. Initial Data Setup

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

Then login as HR and manage users/roles from the HR pages.

---

## 5. First Usage Flow (Recommended)

1. Register 2-3 employee accounts.
2. Login as HR and assign one employee as HoD.
3. Login as Employee and submit a leave request.
4. If alternate is selected, respond from alternate account.
5. Login as HoD and review pending request.
6. Login as HR and give final approval/decline.
7. Check dashboards and analytics.

---

## Main Pages

### Employee
- `/profile`
- `/leave-application`
- `/application-status`
- `/leave-history`

### HoD
- `/hod/dashboard`
- `/hod/pending-requests`
- `/hod/department-members`
- `/hod/analytics`

### HR
- `/hr/dashboard`
- `/hr/review-application`
- `/hr/system-settings`
- `/hr/employees`
- `/hr/leave-analytics`

---

## Common Issues

### Backend not connecting
- Check `MONGO_URI` in `server/.env`
- Ensure MongoDB is running

### CORS error
- Ensure `CLIENT_URL=http://localhost:5173` in server env

### OTP email not working
- Use Gmail app password, not regular password

### Upload failing
- Check file size/type
- Verify Cloudinary credentials

---

## Need Full Documentation?

See `README.md` for full architecture, API details, business logic, and advanced notes.
