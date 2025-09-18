# Fitness Tracker App - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/fitness-tracker-app.git
cd fitness-tracker-app
```

2. Install all dependencies
```bash
npm run install:all
```

### Environment Setup

1. **Backend Environment**
   - Copy `backend/.env.example` to `backend/.env`
   - Update the MongoDB connection string
   - Set JWT secret and other required variables

2. **Frontend Environment**
   - Copy `frontend/.env.example` to `frontend/.env`
   - Set API base URL and other frontend variables

### Running the Application

#### Development Mode
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run individually
npm run dev:frontend  # Frontend only (Next.js dev server)
npm run dev:backend   # Backend only (Express with nodemon)
```

#### Production Mode
```bash
# Build and start
npm run build
npm run start
```

## 📁 Project Structure

```
fitness-tracker-app/
├── frontend/                 # Next.js React frontend
│   ├── app/                 # Next.js 13+ App Router
│   ├── components/          # Reusable UI components
│   ├── store/              # Redux store and slices
│   ├── services/           # API service functions
│   └── src/                # Additional source files
├── backend/                 # Express.js backend API
│   ├── models/             # Mongoose data models
│   ├── routes/             # API route handlers
│   ├── middleware/         # Custom middleware
│   └── server.js          # Express server entry point
└── package.json            # Root package.json with scripts
```

## 🛠️ Available Scripts

### Root Level Scripts
- `npm run dev` - Start both frontend and backend in development mode
- `npm run start` - Start both in production mode
- `npm run build` - Build frontend for production
- `npm run install:all` - Install dependencies for all packages
- `npm run clean:win` - Clean all node_modules (Windows)
- `npm run lint` - Run ESLint on frontend
- `npm run test` - Run backend tests

### Frontend Scripts
```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

### Backend Scripts
```bash
cd backend
npm run dev      # Development server with nodemon
npm run start    # Production server
npm test         # Run Jest tests
```

## 🔧 Technologies Used

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **Chart.js** - Data visualization
- **React Hook Form** - Form management

### Backend
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin requests
- **Rate Limiting** - API protection

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fitness-tracker
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12
```

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Fitness Tracker
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `cd frontend && npm run build`
2. Deploy the `.next` folder

### Backend (Heroku/Railway/DigitalOcean)
1. Set environment variables
2. Deploy from the `backend` directory
3. Ensure MongoDB connection is configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📚 API Documentation

The backend API provides the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `GET /api/weight` - Get weight entries
- `POST /api/weight` - Add weight entry

## 🎨 UI Components

The frontend includes beautiful, modern UI components:
- Animated gradient backgrounds
- Glass morphism effects
- Smooth transitions and micro-interactions
- Responsive design
- Dark/light mode support (planned)
- Progress indicators and charts

## 🏗️ Architecture

This is a modern full-stack application following best practices:
- Component-based React architecture
- RESTful API design
- JWT-based authentication
- Redux for client-side state management
- Mongoose for data modeling
- Error handling and validation
- Security best practices implemented
