'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Activity, Zap } from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { loginUser, clearError } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const isLoading = auth?.isLoading ?? false;
  const error = auth?.error ?? null;
  const isAuthenticated = !!auth?.isAuthenticated;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

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

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      router.replace('/dashboard');
    } catch (e) {}
  };

  return (
    <div className="min-h-screen radial-gradient flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Enhanced Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-300/30 to-emerald-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-pink-200/20 to-yellow-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-500/20 rounded-full animate-bounce-slow"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-purple-500/20 rotate-45 animate-pulse"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-green-500/20 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-16 w-5 h-5 bg-pink-500/20 rotate-12 animate-bounce-slow" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative">
        {/* Logo and header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center"
        >
          <motion.div 
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 shadow-2xl shadow-blue-500/30 animate-pulse-glow"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Activity className="h-10 w-10 text-white animate-bounce-slow" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mt-8 text-center text-4xl font-extrabold tracking-tight text-secondary-900"
          >
            Welcome back to{' '}
            <span className="text-gradient-blue animate-shimmer">FitTracker</span> 💪
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-4 text-center text-lg font-medium text-secondary-600"
          >
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-bold text-gradient-primary hover:text-primary-700 transition-all duration-200 hover:scale-105 inline-block"
            >
              Sign up for free →
            </Link>
          </motion.p>
        </motion.div>

        {/* Login form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8"
        >
          <div className="card-glass rounded-3xl px-10 py-10 shadow-2xl border-2 border-white/20 backdrop-blur-xl">
            <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
              {/* Email field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <label htmlFor="email" className="input-label text-base font-bold text-secondary-800 flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>Email address</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-blue-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`input pl-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 focus:scale-[1.02] ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 shadow-red-200/50' 
                        : 'border-blue-200/50 focus:ring-blue-500 focus:border-blue-500 shadow-blue-100/50'
                    }`}
                    placeholder="Enter your email address"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Please enter a valid email address',
                      },
                    })}
                  />
                  {!errors.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-green-500 text-lg">✓</span>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="input-error-text bg-red-50 p-2 rounded-lg border border-red-200 flex items-center space-x-2"
                  >
                    <span className="text-red-500">⚠️</span>
                    <span>{errors.email.message}</span>
                  </motion.p>
                )}
              </motion.div>

              {/* Password field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <label htmlFor="password" className="input-label text-base font-bold text-secondary-800 flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-purple-600" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-purple-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`input pl-12 pr-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 focus:scale-[1.02] ${
                      errors.password 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 shadow-red-200/50' 
                        : 'border-purple-200/50 focus:ring-purple-500 focus:border-purple-500 shadow-purple-100/50'
                    }`}
                    placeholder="Enter your password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center bg-gradient-to-r from-purple-100 to-indigo-100 rounded-r-xl hover:from-purple-200 hover:to-indigo-200 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-purple-600 hover:text-purple-800" />
                    ) : (
                      <Eye className="h-5 w-5 text-purple-600 hover:text-purple-800" />
                    )}
                  </motion.button>
                </div>
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="input-error-text bg-red-50 p-2 rounded-lg border border-red-200 flex items-center space-x-2"
                  >
                    <span className="text-red-500">⚠️</span>
                    <span>{errors.password.message}</span>
                  </motion.p>
                )}
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="rounded-2xl bg-gradient-to-r from-red-50 to-rose-50 p-4 border-2 border-red-200/50 shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">😱</span>
                    <div className="text-sm font-semibold text-red-800">{error}</div>
                  </div>
                </motion.div>
              )}

              {/* Submit button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 px-8 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-300 ${
                    isLoading
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 shadow-blue-500/30 hover:shadow-blue-600/40'
                  } text-white flex items-center justify-center space-x-3 btn-3d`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-lg">Signing you in... ⏳</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-6 w-6 animate-bounce" />
                      <span>Sign in to your account</span>
                      <span className="text-xl">🚀</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Forgot password link */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8 text-center"
            >
              <Link
                href="/forgot-password"
                className="text-base font-semibold text-gradient-primary hover:text-primary-700 transition-all duration-200 hover:scale-105 inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200/50 hover:shadow-md"
              >
                <span>🔑</span>
                <span>Forgot your password?</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Features showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-12 text-center"
        >
          <motion.h3 
            className="text-lg font-bold text-gray-800 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            ✨ What awaits you inside
          </motion.h3>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <motion.div 
              className="flex flex-col items-center space-y-3 group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-blue-200/50 transition-all duration-200">
                <Activity className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">🏋️ Track Workouts</span>
                <p className="text-xs text-gray-500 mt-1">Log and analyze</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center space-y-3 group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-green-200/50 transition-all duration-200">
                <Zap className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">📈 Monitor Progress</span>
                <p className="text-xs text-gray-500 mt-1">Visual insights</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center space-y-3 group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-yellow-200/50 transition-all duration-200">
                <Activity className="h-6 w-6 text-yellow-600 group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <span className="font-bold text-gray-800 group-hover:text-yellow-600 transition-colors">🏆 Achieve Goals</span>
                <p className="text-xs text-gray-500 mt-1">Stay motivated</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
        
        {/* Sign up link */}
        <motion.div 
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <motion.p 
            className="text-base text-gray-600"
            whileHover={{ scale: 1.02 }}
          >
            Don’t have an account?{' '}
            <Link
              href="/signup"
              className="font-bold text-gradient-primary hover:text-primary-700 transition-all duration-200 hover:scale-105 inline-flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 px-3 py-1 rounded-full border border-purple-200/50 hover:shadow-md ml-2"
            >
              <span>🚀</span>
              <span>Join now</span>
            </Link>
          </motion.p>
        </motion.div>
      </div>
      
      {/* Footer */}
      <motion.div 
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <p className="text-xs text-gray-400 flex items-center space-x-1">
          <span>❤️</span>
          <span>Built with care for your fitness journey</span>
          <span>✨</span>
        </p>
      </motion.div>
    </div>
  );
}
