'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Target, 
  Scale, 
  TrendingUp, 
  Calendar,
  Award,
  Clock,
  BarChart3,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Home,
  Dumbbell,
  Apple,
  Trophy
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useRouter } from 'next/navigation';

// Import our created components
import WeightTracker from '../../components/weight/WeightTracker';
import WeightHistory from '../../components/weight/WeightHistory';
import GoalsList from '../../components/goals/GoalsList';
import GoalsDashboard from '../../components/goals/GoalsDashboard';

type TabType = 'overview' | 'workouts' | 'nutrition' | 'weight' | 'weight-history' | 'goals' | 'goals-dashboard';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const navigationItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: Home,
      color: 'text-blue-600',
    },
    {
      id: 'workouts',
      label: 'Workouts',
      icon: Dumbbell,
      color: 'text-green-600',
    },
    {
      id: 'nutrition',
      label: 'Nutrition',
      icon: Apple,
      color: 'text-orange-600',
    },
    {
      id: 'weight',
      label: 'Weight Tracker',
      icon: Scale,
      color: 'text-purple-600',
    },
    {
      id: 'weight-history',
      label: 'Weight History',
      icon: TrendingUp,
      color: 'text-indigo-600',
    },
    {
      id: 'goals',
      label: 'Goals List',
      icon: Target,
      color: 'text-red-600',
    },
    {
      id: 'goals-dashboard',
      label: 'Goals Dashboard',
      icon: Trophy,
      color: 'text-yellow-600',
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'weight':
        return <WeightTracker />;
      case 'weight-history':
        return <WeightHistory />;
      case 'goals':
        return <GoalsList />;
      case 'goals-dashboard':
        return <GoalsDashboard />;
      case 'workouts':
        return (
          <div className="p-8">
            <div className="text-center py-20">
              <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Workouts</h3>
              <p className="text-gray-500">Workout tracking feature coming soon!</p>
            </div>
          </div>
        );
      case 'nutrition':
        return (
          <div className="p-8">
            <div className="text-center py-20">
              <Apple className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Nutrition</h3>
              <p className="text-gray-500">Nutrition tracking feature coming soon!</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-gray-600 mt-2">
                Here's your fitness journey overview
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card hover-lift group cursor-pointer"
              >
                <div className="flex items-center p-6">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-glow-primary animate-pulse-glow">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white animate-pulse"></div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Total Workouts</p>
                    <p className="text-3xl font-bold text-gradient-blue">24</p>
                    <p className="text-xs text-green-600 font-medium">+3 this week</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card hover-lift group cursor-pointer"
              >
                <div className="flex items-center p-6">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-glow-success">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Goals Achieved</p>
                    <p className="text-3xl font-bold text-gradient-success">8</p>
                    <p className="text-xs text-green-600 font-medium">80% success rate</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card hover-lift group cursor-pointer"
              >
                <div className="flex items-center p-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30">
                    <Scale className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Weight Progress</p>
                    <p className="text-3xl font-bold text-gradient-purple">-5.2kg</p>
                    <p className="text-xs text-green-600 font-medium">Target: -10kg</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card hover-lift group cursor-pointer"
              >
                <div className="flex items-center p-6">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-glow-warning">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 text-lg animate-bounce">🔥</div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Current Streak</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">12 days</p>
                    <p className="text-xs text-orange-600 font-medium">Personal best!</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="card hover-lift"
              >
                <div className="px-6 py-4 border-b border-gray-100/70 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Activities</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { icon: Activity, text: 'Completed Push/Pull workout', time: '2 hours ago', color: 'bg-gradient-to-r from-green-500 to-green-600', bgColor: 'bg-green-50' },
                      { icon: Scale, text: 'Logged weight entry: 75.2kg', time: '1 day ago', color: 'bg-gradient-to-r from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
                      { icon: Target, text: 'Achieved goal: 10k steps', time: '2 days ago', color: 'bg-gradient-to-r from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
                      { icon: Apple, text: 'Logged breakfast nutrition', time: '3 days ago', color: 'bg-gradient-to-r from-orange-500 to-orange-600', bgColor: 'bg-orange-50' },
                    ].map((activity, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50/80 transition-colors cursor-pointer group"
                      >
                        <div className={`p-3 rounded-xl ${activity.color} shadow-sm`}>
                          <activity.icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">{activity.text}</p>
                          <p className="text-xs text-gray-500 font-medium">{activity.time}</p>
                        </div>
                        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="card hover-lift"
              >
                <div className="px-6 py-4 border-b border-gray-100/70 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('weight')}
                      className="group flex flex-col items-center p-6 border border-purple-200/50 rounded-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 transition-all duration-200 hover:shadow-sm hover:border-purple-300/50"
                    >
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl mb-3 group-hover:shadow-lg group-hover:scale-110 transition-all duration-200">
                        <Scale className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Log Weight</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('goals-dashboard')}
                      className="group flex flex-col items-center p-6 border border-red-200/50 rounded-xl hover:bg-gradient-to-br hover:from-red-50 hover:to-rose-50 transition-all duration-200 hover:shadow-sm hover:border-red-300/50"
                    >
                      <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl mb-3 group-hover:shadow-lg group-hover:scale-110 transition-all duration-200">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-red-700 transition-colors">Set Goal</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex flex-col items-center p-6 border border-green-200/50 rounded-xl hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all duration-200 hover:shadow-sm hover:border-green-300/50"
                    >
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-3 group-hover:shadow-lg group-hover:scale-110 transition-all duration-200">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Log Workout</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group flex flex-col items-center p-6 border border-orange-200/50 rounded-xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 transition-all duration-200 hover:shadow-sm hover:border-orange-300/50"
                    >
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl mb-3 group-hover:shadow-lg group-hover:scale-110 transition-all duration-200">
                        <Apple className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">Log Meal</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 bg-dots">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl shadow-soft border-r border-gray-100/50 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100/70 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-glow-primary animate-pulse-glow">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient-blue">FitTracker</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col h-full">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setSidebarOpen(false);
                  }}
                  className={`group w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-soft border border-blue-200/50 transform scale-[1.02]'
                      : 'text-gray-600 hover:bg-white/80 hover:text-gray-900 hover:shadow-sm hover:scale-[1.01]'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-blue-100 text-blue-600 shadow-sm' 
                      : 'group-hover:bg-gray-100'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  {activeTab === item.id && (
                    <motion.div 
                      className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="border-t border-gray-100/70 p-4 bg-gradient-to-r from-gray-50/50 to-white/50">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200 group">
                <div className="p-1 bg-gray-100 rounded-lg mr-3 group-hover:bg-gray-200 transition-colors">
                  <Settings className="h-3 w-3" />
                </div>
                Settings
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:shadow-sm rounded-xl transition-all duration-200 group"
              >
                <div className="p-1 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors">
                  <LogOut className="h-3 w-3" />
                </div>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-xl shadow-soft border-b border-gray-100/50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="hidden lg:block">
                <h2 className="text-xl font-bold text-gradient-blue">
                  {navigationItems.find(item => item.id === activeTab)?.label}
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
