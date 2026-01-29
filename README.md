# 🎓 College Attendance Management Portal

A modern, full-stack web application for managing college attendance with role-based access control, real-time tracking, and advanced features like QR code attendance, analytics, and PDF reports.

![Tech Stack](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🎯 Core Features
- **Role-Based Access Control**: Separate dashboards for Students, Teachers, and Admins
- **Secure Authentication**: JWT-based authentication with password hashing
- **Real-Time Attendance**: Live attendance tracking and updates
- **Dark Mode**: Beautiful dark/light theme support
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

###  👨‍🎓 Student Features
- Personal dashboard with overall attendance percentage
- Subject-wise attendance breakdown with visual charts
- Low attendance warnings (<75%)
- Monthly/semester attendance reports
- Download attendance as PDF
- In-app notifications
- Attendance history tracking

### 👨‍🏫 Teacher Features
- Dashboard showing assigned subjects and classes
- Mark attendance manually or via QR code
- Time-limited QR code generation for attendance
- Edit attendance with reason logging
- Class analytics with interactive charts
- Export attendance data (Excel/PDF)
- View defaulters list

### 🏫 Admin Features
- Global attendance overview dashboard
- Manage students, teachers, and subjects (CRUD operations)
- Assign teachers to subjects
- Teacher approval workflow
- Attendance accuracy audit
- Exam eligibility checker
- System activity logs
- Manual attendance override capability

### 🚀 Advanced Features
- **QR Code Attendance**: Time-limited QR codes with automatic expiration
- **Accuracy Validation**: IP/device tracking and duplicate entry prevention
- **Change History**: Complete audit trail of attendance modifications
- **Analytics Dashboard**: Interactive charts and graphs
- **Notification System**: Real-time in-app notifications
- **PDF Reports**: Professional attendance reports
- **Excel Export**: Bulk data export for analysis

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express**: RESTful API server
- **MongoDB** + **Mongoose**: Database and ODM
- **JWT**: Authentication and authorization
- **bcryptjs**: Password hashing
- **QRCode**: QR code generation
- **PDFKit**: PDF report generation
- **xlsx**: Excel file generation

### Frontend
- **React**: UI library
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Data visualization
- **Lucide React**: Icon library
- **Axios**: HTTP client

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd attendance-portal
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your MongoDB URI
\`\`\`

**Update `.env` file:**
\`\`\`env
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd ../frontend

# Install dependencies
npm install
\`\`\`

### 4. Seed Demo Data (Optional but Recommended)
\`\`\`bash
cd ../backend
npm run seed
\`\`\`

This will create:
- 1 Admin account
- 10 Teacher accounts
- 50 Student accounts
- 20 Subjects across departments
- 60 days of attendance records

## 🚀 Running the Application

### Start Backend Server
\`\`\`bash
cd backend
npm run dev
# Server runs on http://localhost:5000
\`\`\`

### Start Frontend Development Server
\`\`\`bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
\`\`\`

### Access the Application
Open your browser and navigate to: **http://localhost:5173**

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@college.edu | admin123 |
| **Teacher** | teacher1@college.edu | teacher123 |
| **Student** | student1@college.edu | student123 |

*(teacher1-teacher10 and student1-student50 are available)*

## 📁 Project Structure

\`\`\`
attendance-portal/
├── backend/
│   ├── config/         # Database configuration
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route handlers
│   ├── middleware/     # Authentication & validation
│   ├── utils/          # Helper functions (QR, PDF, Excel)
│   ├── seeders/        # Demo data seeder
│   └── server.js       # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── context/    # Auth & theme context
│   │   ├── services/   # API service layer
│   │   └── App.jsx     # Main app component
│   └── public/
│
└── README.md
\`\`\`

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Student Routes (Protected)
- `GET /api/student/dashboard` - Dashboard data
- `GET /api/student/attendance/subject/:id` - Subject attendance
- `GET /api/student/report/pdf` - Download PDF report
- `GET /api/student/notifications` - Get notifications

### Teacher Routes (Protected)
- `GET /api/teacher/dashboard` - Dashboard data
- `POST /api/teacher/attendance/mark` - Mark attendance
- `POST /api/teacher/attendance/qr/generate` - Generate QR code
- `POST /api/teacher/attendance/qr/validate` - Validate QR scan
- `GET /api/teacher/analytics/:subjectId` - Class analytics
- `GET /api/teacher/export/excel/:subjectId` - Export Excel

### Admin Routes (Protected)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/students` - List all students
- `POST /api/admin/students` - Add new student
- `GET /api/admin/teachers` - List all teachers
- `PUT /api/admin/teachers/:id/approve` - Approve teacher
- `GET /api/admin/subjects` - List all subjects
- `GET /api/admin/audit` - Attendance audit
- `GET /api/admin/eligibility/:studentId` - Check eligibility

## 🎨 UI/UX Features

- **Glassmorphism**: Modern glass-effect design
- **Gradient Backgrounds**: Vibrant color schemes
- **Smooth Animations**: Transition effects and micro-interactions
- **Interactive Charts**: Bar charts, pie charts, and line graphs
- **Progress Bars**: Visual attendance tracking
- **Responsive Tables**: Mobile-friendly data display
- **Toast Notifications**: User feedback for actions

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting on authentication endpoints
- CORS configuration
- Environment variable protection

## 🚧 Future Enhancements

- [ ] AI-based attendance prediction
- [ ] Email notifications
- [ ] SMS integration for alerts
- [ ] Face recognition attendance
- [ ] Mobile app (React Native)
- [ ] Biometric authentication
- [ ] Automated report generation
- [ ] Parent portal access
- [ ] Multi-language support
- [ ] Offline mode support

## 🚀 Deployment Guide

This project is a full-stack application. For production, you must host the frontend and backend separately.

### 1. Backend Deployment (e.g., [Render](https://render.com/), [Railway](https://railway.app/))
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Required Environment Variables**:
  - `MONGODB_URI`: Your MongoDB Atlas connection string
  - `JWT_SECRET`: A long random string
  - `PORT`: `5000` (or as required by the host)
  - `FRONTEND_URL`: Your Netlify URL (e.g., `https://your-site.netlify.app`)
  - `NODE_ENV`: `production`

### 2. Frontend Deployment ([Netlify](https://netlify.com/))
- **Base Directory**: `frontend`
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Your deployed backend URL + `/api` (e.g., `https://your-backend.onrender.com/api`)

> [!NOTE]
> The project includes a `netlify.toml` which automatically handles the Single Page Application (SPA) routing and build settings.

## 📸 Screenshots

*(Add screenshots here once deployed)*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Recharts for beautiful data visualization
- Tailwind CSS for amazing styling utilities
- Lucide React for clean, modern icons

---

**Built with ❤️ for college attendance management**
