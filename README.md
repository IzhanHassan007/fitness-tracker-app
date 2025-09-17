# 🏋️ Fitness Tracker App

A comprehensive fitness tracking application built with the MERN stack, featuring secure authentication, workout logging, nutrition tracking, and progress visualization.

## 🌟 Features

### Day 1 - Foundation & Secure Access ✅
- **🔐 Secure Authentication** - JWT-based signup/login with encrypted passwords
- **👤 User Management** - Comprehensive user profiles with fitness goals
- **🎨 Modern UI** - Clean and responsive React frontend with Tailwind CSS
- **⚡ Fast Development** - Vite-powered frontend with hot reload

### Coming Soon
- **🏋️ Workout Logging** - Track exercise type, duration, and intensity
- **🍎 Nutrition Tracking** - Log meals with calories & macros
- **⚖️ Weight & Goal Tracking** - Monitor weight progress and goals
- **📊 Progress Insights** - Interactive Chart.js visualizations
- **🤝 Social Sharing** - Share achievements and motivation
- **🛠️ Admin Dashboard** - User management and analytics

## 🛠 Technology Stack

### Frontend 🎨
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Beautiful notifications
- **Heroicons** - Beautiful SVG icons

### Backend ⚙️
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for RESTful APIs
- **JWT** - Secure token-based authentication
- **bcryptjs** - Password hashing and encryption

### Database 💾
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM for MongoDB with schemas

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd "Back End"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your MongoDB Atlas connection string and JWT secret:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitness-tracker
   JWT_SECRET=your_super_secret_jwt_key_here
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd "Front End"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

## 📁 Project Structure

```
Fitness Tracker App/
├── Back End/
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   └── User.js          # User schema with fitness fields
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   └── users.js         # User management routes
│   ├── utils/
│   │   └── generateToken.js # JWT token generation
│   ├── server.js            # Express server setup
│   ├── package.json         # Backend dependencies
│   └── .env.example         # Environment variables template
│
└── Front End/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── Login.jsx      # Login form component
    │   │   │   └── Signup.jsx     # Multi-step signup form
    │   │   ├── common/
    │   │   │   └── LoadingSpinner.jsx
    │   │   └── dashboard/
    │   │       └── Dashboard.jsx   # Main dashboard
    │   ├── context/
    │   │   └── AuthContext.jsx     # Global auth state management
    │   ├── App.jsx                 # Main app component with routing
    │   ├── main.jsx               # React app entry point
    │   └── index.css              # Global styles with Tailwind
    ├── index.html
    ├── package.json               # Frontend dependencies
    ├── vite.config.js            # Vite configuration
    └── tailwind.config.js        # Tailwind CSS configuration
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/verify-token` - Verify JWT token

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Deactivate account

## 🎨 UI Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern Aesthetics** - Clean, professional interface
- **Interactive Forms** - Multi-step signup with validation
- **Real-time Feedback** - Toast notifications for user actions
- **Loading States** - Smooth loading indicators
- **Error Handling** - User-friendly error messages

## 🔒 Security Features

- **Password Encryption** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based sessions
- **Input Validation** - Server-side validation with express-validator
- **CORS Protection** - Configured for secure cross-origin requests
- **Environment Variables** - Sensitive data protection

## 📱 User Experience

### Signup Flow
1. **Basic Information** - Name, email, password with validation
2. **Fitness Profile** - Age, gender, height, weight, goals (optional)
3. **Account Creation** - Automatic login after successful signup

### Dashboard Features
- **Personal Stats** - Current weight, goal weight, activity level
- **Quick Actions** - Easy access to main features
- **Fitness Goals** - Visual display of user's objectives
- **Coming Soon** - Preview of upcoming features

## 🚧 Development Status

### ✅ Completed (Day 1)
- Backend API with Express and MongoDB
- JWT authentication system
- User registration and login
- React frontend with modern UI
- Context API for state management
- Responsive design with Tailwind CSS

### 🔄 Next Steps (Day 2-5)
- Workout logging functionality
- Nutrition tracking system
- Weight progress monitoring
- Chart.js data visualization
- Social sharing features
- Admin dashboard

## 🤝 Contributing

This is a learning project. Feel free to explore the code and suggest improvements!

## 📄 License

This project is for educational purposes.

---

**Happy Coding! 💪🚀**
