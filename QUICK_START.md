# 🚀 Quick Start Guide - College Attendance Portal

## Prerequisites Checklist
- [ ] Node.js installed (v16 or higher)
- [ ] MongoDB Atlas account created
- [ ] Git installed (optional)

## Step-by-Step Setup

### 1. Navigate to Project Directory
\`\`\`bash
cd "/Users/ganeshchoudhary/Documents/IBM Project/attendance-portal"
\`\`\`

### 2. Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy your connection string (looks like: `mongodb+srv://username:password@cluster...`)

### 3. Configure Backend

\`\`\`bash
cd backend

# Open .env file and update MONGODB_URI
# Replace the placeholder with your actual MongoDB Atlas connection string
# The file is located at: backend/.env
\`\`\`

Edit `backend/.env`:
\`\`\`env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/attendance-portal
JWT_SECRET=college-attendance-super-secret-key-2026
JWT_EXPIRE=7d
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
\`\`\`

### 4. Seed Demo Data

\`\`\`bash
# Make sure you're in the backend directory
cd backend

# Run the seeder
npm run seed
\`\`\`

You should see output like:
\`\`\`
✅ Admin created: admin@college.edu / admin123
✅ Teacher 1: teacher1@college.edu / teacher123
...
✅ Total students created: 50
✅ Created 14000+ attendance records
\`\`\`

### 5. Start the Backend Server

\`\`\`bash
# In the backend directory
npm run dev
\`\`\`

You should see:
\`\`\`
✅ MongoDB Connected: cluster...
🚀 Server is running on port 5000
📝 Environment: development
🌐 Frontend URL: http://localhost:5173
\`\`\`

**Keep this terminal running!**

### 6. Start the Frontend (New Terminal)

Open a **new terminal window** and run:

\`\`\`bash
cd "/Users/ganeshchoudhary/Documents/IBM Project/attendance-portal/frontend"
npm run dev
\`\`\`

You should see:
\`\`\`
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
\`\`\`

### 7. Access the Application

Open your browser and go to: **http://localhost:5173**

---

## 🎯 Testing the Application

### Login Credentials

**Admin Account:**
- Email: `admin@college.edu`
- Password: `admin123`

**Teacher Account:**
- Email: `teacher1@college.edu` (or teacher2, teacher3, etc. up to teacher10)
- Password: `teacher123`

**Student Account:**
- Email: `student1@college.edu` (or student2, student3, etc. up to student50)
- Password: `student123`

### What to Test

#### As a Student (student1@college.edu)
1. ✅ View overall attendance percentage
2. ✅ See subject-wise breakdown with charts
3. ✅ Check for low attendance warnings
4. ✅ View progress bars for each subject
5. ✅ Navigate between Dashboard, Profile, Reports
6. ✅ Toggle dark/light mode

#### As a Teacher (teacher1@college.edu)
1. ✅ View assigned subjects
2. ✅ See dashboard statistics
3. ✅ Check recent attendance records
4. ✅ Navigate to different pages (placeholders ready)

#### As an Admin (admin@college.edu)
1. ✅ View global statistics
2. ✅ Check total students, teachers, subjects
3. ✅ See overall attendance percentage
4. ✅ Review recent activity feed
5. ✅ Check for pending teacher approvals

---

## 🔧 Common Issues & Solutions

### Issue: MongoDB Connection Error
**Solution:**
1. Make sure your MongoDB Atlas cluster is running
2. Check if your IP is whitelisted in MongoDB Atlas
3. Verify the connection string in `.env` is correct
4. Make sure the password doesn't contain special characters (or URL encode them)

### Issue: Frontend shows "Network Error"
**Solution:**
1. Make sure backend server is running on port 5000
2. Check if `FRONTEND_URL` in backend `.env` matches frontend URL
3. Clear browser cache and reload

### Issue: "Cannot find module" error
**Solution:**
Run `npm install` again in the respective directory (backend or frontend)

### Issue: Port already in use
**Solution:**
- For backend (port 5000): Find and kill the process using `lsof -ti:5000 | xargs kill`
- For frontend (port 5173): Find and kill the process using `lsof -ti:5173 | xargs kill`

---

## 📊 Database Overview

After seeding, your MongoDB database will contain:

- **1 Admin**
- **10 Teachers** (Computer Science, Electronics, Mechanical, etc.)
- **50 Students** (distributed across departments and semesters)
- **20 Subjects** (across 6 departments)
- **~14,000 Attendance Records** (last 30 days of data)
- **20 Notifications** (for students with low attendance)

---

## 🎨 UI Features to Explore

1. **Dark Mode Toggle** - Click moon/sun icon in sidebar
2. **Interactive Charts** - Pie and bar charts on student dashboard
3. **Progress Bars** - Color-coded based on attendance percentage
4. **Alerts** - Low attendance warnings (red boxes)
5. **Glassmorphism** - Beautiful glass effects on login/register pages
6. **Smooth Animations** - Page transitions and hover effects
7. **Responsive Design** - Try resizing the browser window

---

## 🚀 Next Steps

### Immediate
1. Test all three user roles
2. Check data accuracy on dashboards
3. Test dark mode toggle
4. Try different student accounts to see varied attendance

### Future Enhancements
The backend is fully functional! Just need to build frontend UIs for:
- Attendance marking interface (teacher)
- QR code generation page (teacher)
- Class analytics with charts (teacher)
- Student/Teacher/Subject management tables (admin)
- Audit dashboard (admin)
- Eligibility checker (admin)

All backend APIs are ready - they just need frontend forms and tables!

---

## 💡 Tips

1. **Check Console Logs**: Open browser DevTools (F12) to see API calls and responses
2. **MongoDB Compass**: Download MongoDB Compass to visually browse your database
3. **API Testing**: Use Thunder Client or Postman to test backend APIs directly
4. **Hot Reload**: Both frontend and backend support hot reload - changes reflect automatically

---

## 📞 Need Help?

If you encounter any issues:
1. Check terminal logs for error messages
2. Verify MongoDB connection
3. Ensure all npm packages are installed
4. Make sure both servers are running

---

**Enjoy exploring your College Attendance Management Portal!** 🎓✨
