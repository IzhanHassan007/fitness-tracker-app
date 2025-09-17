'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, User, Calendar, Activity, 
  ChevronRight, ChevronLeft, Target, Zap 
} from 'lucide-react';
import { RootState } from '../../store';
import { signupUser, clearError } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  height?: {
    value: number;
    unit: 'cm' | 'ft';
  };
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  fitnessGoals?: string[];
}

const fitnessGoalOptions = [
  { value: 'weight-loss', label: 'Weight Loss', icon: Target },
  { value: 'muscle-gain', label: 'Muscle Gain', icon: Activity },
  { value: 'endurance', label: 'Endurance', icon: Zap },
  { value: 'strength', label: 'Strength', icon: Activity },
  { value: 'general-fitness', label: 'General Fitness', icon: Target },
];

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { value: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
  { value: 'very-active', label: 'Very Active', description: 'Very hard exercise or physical job' },
];

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    getValues,
  } = useForm<SignupFormData>();

  const watchedPassword = watch('password');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['name', 'email', 'password', 'confirmPassword'] 
      : [];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const onSubmit = async (data: SignupFormData) => {
    const { confirmPassword, ...submitData } = data;
    await dispatch(signupUser(submitData));
  };

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      {/* Step header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <h3 className="text-2xl font-bold text-gray-900">📝 Account Details</h3>
        <p className="text-gray-600 mt-2">Let's start with the basics</p>
      </motion.div>

      {/* Name field */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <label htmlFor="name" className="block text-base font-bold text-gray-700 mb-3">
          👤 Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <motion.input
            id="name"
            type="text"
            autoComplete="name"
            className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-2xl transition-all duration-200 focus:outline-none ${
              errors.name
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring focus:ring-red-200'
                : 'border-gray-200 bg-white focus:border-blue-500 focus:ring focus:ring-blue-200'
            } hover:border-gray-300 shadow-md focus:shadow-lg`}
            placeholder="Enter your full name"
            whileFocus={{ scale: 1.02 }}
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
              maxLength: {
                value: 50,
                message: 'Name cannot exceed 50 characters',
              },
            })}
          />
        </div>
        {errors.name && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center space-x-2"
          >
            <span className="text-red-500">⚠️</span>
            <p className="text-sm font-semibold text-red-600">{errors.name.message}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Email field */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <label htmlFor="email" className="block text-base font-bold text-gray-700 mb-3">
          📧 Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <motion.input
            id="email"
            type="email"
            autoComplete="email"
            className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-2xl transition-all duration-200 focus:outline-none ${
              errors.email
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring focus:ring-red-200'
                : 'border-gray-200 bg-white focus:border-blue-500 focus:ring focus:ring-blue-200'
            } hover:border-gray-300 shadow-md focus:shadow-lg`}
            placeholder="Enter your email address"
            whileFocus={{ scale: 1.02 }}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Please enter a valid email address',
              },
            })}
          />
        </div>
        {errors.email && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center space-x-2"
          >
            <span className="text-red-500">⚠️</span>
            <p className="text-sm font-semibold text-red-600">{errors.email.message}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Password field */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <label htmlFor="password" className="block text-base font-bold text-gray-700 mb-3">
          🔒 Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <motion.input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={`w-full pl-12 pr-14 py-4 text-lg border-2 rounded-2xl transition-all duration-200 focus:outline-none ${
              errors.password
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring focus:ring-red-200'
                : 'border-gray-200 bg-white focus:border-blue-500 focus:ring focus:ring-blue-200'
            } hover:border-gray-300 shadow-md focus:shadow-lg`}
            placeholder="Create a strong password"
            whileFocus={{ scale: 1.02 }}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
              },
            })}
          />
          <motion.button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-r-2xl px-3 hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </motion.button>
        </div>
        {errors.password && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center space-x-2"
          >
            <span className="text-red-500">⚠️</span>
            <p className="text-sm font-semibold text-red-600">{errors.password.message}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Confirm Password field */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <label htmlFor="confirmPassword" className="block text-base font-bold text-gray-700 mb-3">
          🔐 Confirm Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <motion.input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className={`w-full pl-12 pr-14 py-4 text-lg border-2 rounded-2xl transition-all duration-200 focus:outline-none ${
              errors.confirmPassword
                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring focus:ring-red-200'
                : 'border-gray-200 bg-white focus:border-blue-500 focus:ring focus:ring-blue-200'
            } hover:border-gray-300 shadow-md focus:shadow-lg`}
            placeholder="Confirm your password"
            whileFocus={{ scale: 1.02 }}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) =>
                value === watchedPassword || 'Passwords do not match',
            })}
          />
          <motion.button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-r-2xl px-3 hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </motion.button>
        </div>
        {errors.confirmPassword && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center space-x-2"
          >
            <span className="text-red-500">⚠️</span>
            <p className="text-sm font-semibold text-red-600">{errors.confirmPassword.message}</p>
          </motion.div>
        )}
      </motion.div>
      
      {/* Success message when passwords match */}
      {watchedPassword && !errors.confirmPassword && watch('confirmPassword') === watchedPassword && watch('confirmPassword') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl flex items-center space-x-2"
        >
          <span className="text-green-500 text-lg">✅</span>
          <p className="text-sm font-semibold text-green-700">Passwords match! Looking good!</p>
        </motion.div>
      )}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-secondary-900">Personal Information</h3>
        <p className="text-sm text-secondary-600 mt-1">Help us personalize your experience</p>
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-secondary-700 mb-2">
          Date of Birth (Optional)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-secondary-400" />
          </div>
          <input
            id="dateOfBirth"
            type="date"
            className="input pl-10"
            {...register('dateOfBirth')}
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Gender (Optional)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say' },
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                value={option.value}
                className="text-primary-600 focus:ring-primary-500"
                {...register('gender')}
              />
              <span className="text-sm text-secondary-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Height */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Height (Optional)
        </label>
        <div className="grid grid-cols-3 gap-3">
          <input
            type="number"
            placeholder="Value"
            className="input col-span-2"
            {...register('height.value', { 
              min: { value: 50, message: 'Height must be at least 50cm' }
            })}
          />
          <select
            className="input"
            {...register('height.unit')}
          >
            <option value="cm">cm</option>
            <option value="ft">ft</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-secondary-900">Fitness Profile</h3>
        <p className="text-sm text-secondary-600 mt-1">Tell us about your fitness journey</p>
      </div>

      {/* Activity Level */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-3">
          Activity Level
        </label>
        <div className="space-y-3">
          {activityLevels.map((level) => (
            <label key={level.value} className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="radio"
                value={level.value}
                className="mt-1 text-primary-600 focus:ring-primary-500"
                {...register('activityLevel')}
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-secondary-700 group-hover:text-primary-600 transition-colors">
                  {level.label}
                </div>
                <div className="text-xs text-secondary-500">{level.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Fitness Goals */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-3">
          Fitness Goals (Select all that apply)
        </label>
        <div className="grid grid-cols-1 gap-3">
          {fitnessGoalOptions.map((goal) => {
            const IconComponent = goal.icon;
            return (
              <label key={goal.value} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  value={goal.value}
                  className="text-primary-600 focus:ring-primary-500 rounded"
                  {...register('fitnessGoals')}
                />
                <div className="flex items-center space-x-2 flex-1">
                  <IconComponent className="h-4 w-4 text-secondary-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-sm text-secondary-700 group-hover:text-primary-600 transition-colors">
                    {goal.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large animated gradient blobs */}
        <motion.div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-400/30 rounded-full mix-blend-multiply filter blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-300/30 to-teal-400/30 rounded-full mix-blend-multiply filter blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-300/20 to-orange-300/20 rounded-full mix-blend-multiply filter blur-2xl"
          animate={{
            scale: [0.8, 1.2, 0.8],
            x: [-20, 20, -20],
            y: [-20, 20, -20]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating geometric shapes */}
        <motion.div 
          className="absolute top-20 left-20 w-4 h-4 bg-blue-400/40 rounded-full"
          animate={{
            y: [-10, 10, -10],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-32 w-6 h-6 bg-purple-400/40 transform rotate-45"
          animate={{
            rotate: [45, 225, 45],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-32 right-20 w-3 h-12 bg-green-400/40 rounded-full"
          animate={{
            x: [-5, 5, -5],
            scaleY: [1, 1.3, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-32 w-8 h-2 bg-yellow-400/40 rounded-full"
          animate={{
            scaleX: [1, 1.5, 1],
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        {/* Logo and header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.div 
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-blue-500/25"
            whileHover={{ 
              scale: 1.05,
              rotate: 5,
              boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.4)"
            }}
            animate={{
              boxShadow: [
                "0 20px 25px -5px rgba(59, 130, 246, 0.25)",
                "0 25px 35px -5px rgba(139, 92, 246, 0.3)",
                "0 20px 25px -5px rgba(59, 130, 246, 0.25)"
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Activity className="h-10 w-10 text-white" />
          </motion.div>
          
          <motion.h2 
            className="mt-8 text-center text-4xl font-bold tracking-tight text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Join{' '}
            <motion.span 
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              FitTracker
            </motion.span>
            <motion.span
              className="ml-2 text-2xl"
              animate={{
                rotate: [0, 15, -15, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🏆
            </motion.span>
          </motion.h2>
          
          <motion.p 
            className="mt-4 text-center text-base text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Start your fitness transformation today! 💪
          </motion.p>
          
          <motion.p 
            className="mt-3 text-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-gradient-primary hover:text-primary-700 transition-all duration-200 hover:scale-105 inline-flex items-center space-x-1 bg-gradient-to-r from-blue-50 to-purple-50 px-2 py-1 rounded-full border border-blue-200/50 hover:shadow-md"
            >
              <span>🔑</span>
              <span>Sign in here</span>
            </Link>
          </motion.p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10"
        >
          <div className="flex items-center justify-center space-x-6">
            {[1, 2, 3].map((step, index) => (
              <div key={step} className="flex items-center">
                <motion.div
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold transition-all duration-300 ${
                    step <= currentStep
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-400/50'
                      : 'bg-white border-2 border-gray-200 text-gray-400 shadow-md'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: step <= currentStep ? 1.1 : 1.05 }}
                >
                  {step < currentStep ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                      className="text-white font-bold text-lg"
                    >
                      ✓
                    </motion.div>
                  ) : (
                    step
                  )}
                  
                  {/* Glowing ring for current step */}
                  {step === currentStep && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-400"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </motion.div>
                
                {/* Connection line */}
                {index < 2 && (
                  <motion.div 
                    className={`w-16 h-1 mx-2 rounded-full transition-all duration-500 ${
                      step < currentStep
                        ? 'bg-gradient-to-r from-blue-400 to-purple-500'
                        : 'bg-gray-200'
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1 + index * 0.2, duration: 0.4 }}
                  />
                )}
              </div>
            ))}
          </div>
          
          <motion.div 
            className="flex justify-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
          >
            <div className="text-sm font-semibold text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 shadow-sm">
              <span className="text-gradient-primary">Step {currentStep}</span> of 3
              {currentStep === 1 && <span className="ml-2">📝 Account Details</span>}
              {currentStep === 2 && <span className="ml-2">👤 Personal Info</span>}
              {currentStep === 3 && <span className="ml-2">🏅 Fitness Goals</span>}
            </div>
          </motion.div>
        </motion.div>

        {/* Signup form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8"
        >
          <motion.div 
            className="bg-white/80 backdrop-blur-xl rounded-3xl px-10 py-10 shadow-2xl border border-white/50 relative overflow-hidden"
            whileHover={{ 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
              y: -2
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Form background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-blue-50/30 to-purple-50/30 rounded-3xl" />
            
            {/* Form content */}
            <div className="relative z-10">
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </AnimatePresence>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.9 }}
                  className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 shadow-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-500 text-lg">⚠️</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-800">
                        Oops! Something went wrong
                      </p>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between items-center mt-10">
                <motion.button
                  type="button"
                  onClick={prevStep}
                  className={`px-6 py-3 rounded-2xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg ${currentStep === 1 ? 'invisible' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </motion.button>

                {currentStep < 3 ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Continue</span>
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="px-10 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                    whileHover={isLoading ? {} : { scale: 1.02 }}
                    whileTap={isLoading ? {} : { scale: 0.98 }}
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" color="white" className="mr-1" />
                        <span>Creating your account...</span>
                        <span className="text-xl">⏳</span>
                      </>
                    ) : (
                      <>
                        <span>🎆</span>
                        <span>Create Account</span>
                        <Zap className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
