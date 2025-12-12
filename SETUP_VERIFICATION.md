# LeaveTracker - Setup Verification

## ✅ Current Status

### Backend (Server)
- Running on: http://localhost:5000
- Database: Connected to MongoDB Atlas
- Departments: 6 departments seeded (CSE, EEE, Civil, Mechanical, BTM, TVE)

### Frontend (Client)
- Running on: http://localhost:5174
- API Connection: http://localhost:5000/api

## 📋 Testing Checklist

### 1. Test Departments API
Open browser console and run:
```javascript
fetch('http://localhost:5000/api/departments')
  .then(r => r.json())
  .then(console.log)
```
Should return 6 departments.

### 2. Test Registration
1. Go to http://localhost:5174/register
2. Check browser console - should see "Fetching departments..."
3. Dropdown should show 6 departments
4. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Department: Select any
   - Password: Test123 (uppercase + lowercase + 6 chars)
   - Confirm Password: Test123
5. Click Register

### 3. Expected Behavior
- Registration should succeed
- User redirected to /dashboard
- Dashboard shows user info with leave quota

## 🐛 Common Issues & Fixes

### Issue: Departments not loading
**Check:** Browser console for errors
**Fix:** Verify server is running and API is accessible

### Issue: Registration fails
**Check:** Server terminal for error logs
**Common causes:**
- Password validation (needs uppercase + lowercase, min 6 chars)
- Email must have @
- Department must be selected
- Profile picture too large (max 50mb)

### Issue: CORS errors
**Fix:** Server already configured with CORS enabled

## 🔧 Quick Commands

Start Backend:
```bash
cd server
npm run dev
```

Start Frontend:
```bash
cd client
npm run dev
```

Reseed Departments:
```bash
cd server
node seedDepartments.js
```
