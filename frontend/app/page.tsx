'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Zap, Target, TrendingUp, Users, Star } from 'lucide-react';
import { RootState } from '../store';
import Link from 'next/link';

export default function HomePage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-secondary-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse-slow"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-secondary-900">FitTracker</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Link
              href="/login"
              className="text-secondary-600 hover:text-primary-600 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="btn-primary"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-secondary-900 mb-6">
              Your Personal{' '}
              <span className="text-gradient-primary">Fitness Journey</span>{' '}
              Starts Here
            </h1>
            <p className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto">
              Track workouts, monitor nutrition, set goals, and visualize your progress with our 
              comprehensive fitness tracking platform designed for your success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="btn-primary btn-lg shadow-glow hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
              >
                <Zap className="h-5 w-5 mr-2" />
                Start Your Journey
              </Link>
              <Link
                href="/login"
                className="btn-secondary btn-lg"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: Users, value: '10K+', label: 'Active Users' },
              { icon: Target, value: '50K+', label: 'Goals Achieved' },
              { icon: TrendingUp, value: '1M+', label: 'Workouts Tracked' },
            ].map((stat, index) => (
              <div key={index} className="glass rounded-xl p-6 hover-float">
                <stat.icon className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-secondary-900">{stat.value}</div>
                <div className="text-secondary-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-6 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Everything You Need to{' '}
              <span className="text-gradient-success">Succeed</span>
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Comprehensive tools and insights to help you reach your fitness goals faster
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: 'Workout Tracking',
                description: 'Log and monitor all your exercises with detailed analytics and progress insights.',
                color: 'text-primary-600',
                bg: 'bg-primary-50',
              },
              {
                icon: Target,
                title: 'Nutrition Monitoring',
                description: 'Track your meals, calories, and macros to fuel your body for optimal performance.',
                color: 'text-success-600',
                bg: 'bg-success-50',
              },
              {
                icon: TrendingUp,
                title: 'Goal Setting',
                description: 'Set personalized fitness goals and track your progress with visual dashboards.',
                color: 'text-warning-600',
                bg: 'bg-warning-50',
              },
              {
                icon: Zap,
                title: 'Progress Analytics',
                description: 'Visualize your fitness journey with beautiful charts and detailed progress reports.',
                color: 'text-primary-600',
                bg: 'bg-primary-50',
              },
              {
                icon: Users,
                title: 'Social Sharing',
                description: 'Share your achievements and stay motivated with our supportive fitness community.',
                color: 'text-success-600',
                bg: 'bg-success-50',
              },
              {
                icon: Star,
                title: 'Personalized Insights',
                description: 'Get AI-powered recommendations and insights tailored to your fitness journey.',
                color: 'text-warning-600',
                bg: 'bg-warning-50',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="card hover-lift"
              >
                <div className="card-body text-center">
                  <div className={`w-16 h-16 ${feature.bg} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-6">
              Ready to Transform Your{' '}
              <span className="text-gradient-primary">Fitness Journey</span>?
            </h2>
            <p className="text-xl text-secondary-600 mb-8">
              Join thousands of users who are already achieving their fitness goals with FitTracker
            </p>
            <Link
              href="/signup"
              className="btn-primary btn-lg shadow-glow hover:shadow-lg transform transition-all duration-200 hover:scale-[1.02]"
            >
              <Zap className="h-5 w-5 mr-2" />
              Start Free Today
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-secondary-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 gradient-primary rounded-full flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-secondary-900">FitTracker</span>
            </div>
            <div className="text-secondary-600 text-sm">
              © 2024 FitTracker. Built with ❤️ for fitness enthusiasts.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
