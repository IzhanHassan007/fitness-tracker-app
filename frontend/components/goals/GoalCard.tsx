import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { AppDispatch } from '../../store';
import {
  updateGoalProgress,
  updateGoalStatus,
  deleteGoal,
  syncGoal
} from '../../store/slices/goalsSlice';
import ProgressBar, { CircularProgressBar } from '../ui/ProgressBar';

interface GoalCardProps {
  goal: any;
  onEdit?: () => void;
  onView?: () => void;
  compact?: boolean; // Compact version for dashboard
  showActions?: boolean;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onView,
  compact = false,
  showActions = true
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(goal.currentValue || 0);
  const [showProgressInput, setShowProgressInput] = useState(false);

  // Calculate progress percentage
  const progressPercent = goal.targetValue && (goal.currentValue ?? null) !== null
    ? Math.min((goal.currentValue / goal.targetValue) * 100, 100)
    : 0;

  // Get status colors with gradients
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return {
        badge: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200/50',
        glow: 'shadow-glow-success'
      };
      case 'completed': return {
        badge: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200/50',
        glow: 'shadow-glow-primary'
      };
      case 'paused': return {
        badge: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200/50',
        glow: 'shadow-glow-warning'
      };
      case 'cancelled': return {
        badge: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200/50',
        glow: 'shadow-glow-danger'
      };
      default: return {
        badge: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-200/50',
        glow: ''
      };
    }
  };

  // Get priority colors with gradients
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return {
        text: 'text-gradient-danger',
        bg: 'bg-gradient-to-r from-red-500 to-red-600',
        icon: '🔴'
      };
      case 'medium': return {
        text: 'bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent',
        bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        icon: '🟡'
      };
      case 'low': return {
        text: 'text-gradient-success',
        bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
        icon: '🟢'
      };
      default: return {
        text: 'text-gray-600',
        bg: 'bg-gray-500',
        icon: '⚪'
      };
    }
  };

  // Get days until deadline
  const getDaysUntilDeadline = () => {
    const now = new Date();
    const targetDate = new Date(goal.targetDate);
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { days: Math.abs(diffDays), status: 'overdue' };
    if (diffDays === 0) return { days: 0, status: 'due-today' };
    if (diffDays <= 7) return { days: diffDays, status: 'due-soon' };
    return { days: diffDays, status: 'on-track' };
  };

  const deadline = getDaysUntilDeadline();

  // Handle progress update
  const handleProgressUpdate = async () => {
    if (progressValue === goal.currentValue) {
      setShowProgressInput(false);
      return;
    }

    setIsUpdatingProgress(true);
    try {
      await dispatch(updateGoalProgress({
        id: goal._id,
        progressData: {
          currentValue: progressValue,
          notes: `Updated progress to ${progressValue} ${goal.unit || ''}`
        }
      })).unwrap();
      setShowProgressInput(false);
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    try {
      await dispatch(updateGoalStatus({
        id: goal._id,
        status: newStatus,
        reason: `Status changed to ${newStatus}`
      })).unwrap();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Handle goal sync
  const handleSync = async () => {
    try {
      await dispatch(syncGoal(goal._id)).unwrap();
    } catch (error) {
      console.error('Failed to sync goal:', error);
    }
  };

  // Handle goal deletion
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await dispatch(deleteGoal(goal._id)).unwrap();
      } catch (error) {
        console.error('Failed to delete goal:', error);
      }
    }
  };

  const statusColor = getStatusColor(goal.status);
  const priorityColor = getPriorityColor(goal.priority);

  if (compact) {
    return (
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        className="card hover-lift group cursor-pointer overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                  {goal.title}
                </h3>
                <span className={`text-xs ${priorityColor.icon}`}>{priorityColor.icon}</span>
              </div>
              
              <div className="flex items-center mt-1 text-xs">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor.badge}`}>
                  {goal.status}
                </span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600 capitalize font-medium">{goal.type.replace('-', ' ')}</span>
              </div>
              
              <div className={`mt-2 text-xs font-medium ${
                deadline.status === 'overdue' ? 'text-red-600' :
                deadline.status === 'due-today' ? 'text-orange-600' :
                deadline.status === 'due-soon' ? 'text-yellow-600' : 'text-gray-600'
              }`}>
                {deadline.status === 'overdue' 
                  ? `${deadline.days}d overdue ⏰`
                  : deadline.status === 'due-today'
                  ? 'Due today! 🚨'
                  : `${deadline.days}d left ⏳`
                }
              </div>
            </div>
            
            {goal.targetValue && (
              <div className="ml-4">
                <CircularProgressBar
                  progress={progressPercent}
                  size={60}
                  strokeWidth={6}
                  color={progressPercent >= 100 ? 'green' : progressPercent >= 75 ? 'blue' : progressPercent >= 50 ? 'yellow' : 'red'}
                  showPercentage={false}
                  gradient
                  glow={progressPercent >= 100}
                  animated
                />
              </div>
            )}
          </div>
          
          {onView && (
            <motion.button
              whileHover={{ x: 5 }}
              onClick={onView}
              className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center group-hover:text-blue-700 transition-colors"
            >
              View Details 
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </div>
        
        {/* Progress indicator line */}
        <div className="h-1 bg-gray-100">
          <div 
            className={`h-full ${priorityColor.bg} transition-all duration-300`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`card hover-lift group overflow-hidden ${statusColor.glow}`}
    >
      {/* Status indicator line */}
      <div className={`h-1 ${priorityColor.bg}`} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                {goal.title}
              </h3>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor.badge} shadow-sm`}>
                {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{priorityColor.icon}</span>
                <span className={`font-bold ${priorityColor.text}`}>
                  {goal.priority.toUpperCase()} PRIORITY
                </span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="capitalize font-medium text-gray-700">{goal.type.replace('-', ' ')}</span>
              {goal.category && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="capitalize font-medium text-gray-700">{goal.category}</span>
                </>
              )}
            </div>
          </div>

        {showActions && (
          <div className="flex items-center gap-2">
            {goal.status === 'active' && (['weight-loss', 'weight-gain'].includes(goal.type)) && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSync}
                className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 hover:from-blue-200 hover:to-indigo-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
                title="Sync with weight data"
              >
                <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-3 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-600 hover:from-emerald-200 hover:to-green-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              title="Edit goal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="p-3 bg-gradient-to-r from-red-100 to-rose-100 text-red-600 hover:from-red-200 hover:to-rose-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              title="Delete goal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          </div>
        )}
      </div>

        {/* Description */}
        {goal.description && (
          <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
            <p className="text-gray-700 text-sm leading-relaxed">{goal.description}</p>
          </div>
        )}

        {/* Progress Section */}
        {goal.targetValue && (
          <div className="mb-6 p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100/50">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-800">Progress</span>
                <span className="text-lg">📈</span>
              </div>
              <div className="flex items-center gap-2">
                {!showProgressInput ? (
                  <>
                    <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                      {goal.currentValue} / {goal.targetValue} {goal.unit}
                    </span>
                    {goal.status === 'active' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowProgressInput(true)}
                        className="text-xs font-semibold bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Update
                      </motion.button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={progressValue}
                      onChange={(e) => setProgressValue(parseFloat(e.target.value) || 0)}
                      className="input w-24 text-xs py-1 px-2"
                      placeholder="Value"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleProgressUpdate}
                      disabled={isUpdatingProgress}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      {isUpdatingProgress ? 'Saving...' : 'Save'}
                    </motion.button>
                    <button
                      onClick={() => {
                        setShowProgressInput(false);
                        setProgressValue(goal.currentValue);
                      }}
                      className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <ProgressBar
              progress={progressPercent}
              current={goal.currentValue}
              total={goal.targetValue}
              unit={goal.unit}
              color={progressPercent >= 100 ? 'green' : progressPercent >= 75 ? 'blue' : progressPercent >= 50 ? 'yellow' : 'red'}
              showLabel={false}
              showValues={false}
              gradient
              glow={progressPercent >= 100}
              animated
            />
          </div>
        )}

        {/* Timeline */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-xl border border-purple-100/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📅</span>
              <div>
                <span className="text-sm font-bold text-gray-800">Target Date</span>
                <p className="text-sm text-gray-600 font-medium">
                  {new Date(goal.targetDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              deadline.status === 'overdue' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-700' :
              deadline.status === 'due-today' ? 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700' :
              deadline.status === 'due-soon' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-700' : 'bg-gradient-to-r from-green-100 to-green-200 text-green-700'
            } shadow-sm`}>
              {deadline.status === 'overdue' 
                ? `${deadline.days}d overdue ⚠️`
                : deadline.status === 'due-today'
                ? 'Due today! 🚨'
                : `${deadline.days}d left ⏳`
              }
            </div>
          </div>
        </div>

        {/* Frequency (for habit goals) */}
        {goal.frequency && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-xl border border-green-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🗓️</span>
                <span className="text-sm font-bold text-gray-800">Frequency</span>
              </div>
              <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                {goal.frequency.target} times {goal.frequency.type}
              </span>
            </div>
          </div>
        )}

        {/* Status Actions */}
        {goal.status === 'active' && showActions && (
          <div className="flex gap-3 mt-6">
            {progressPercent >= 100 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStatusChange('completed')}
                className="flex-1 btn-success btn-glow font-semibold shadow-md"
              >
                ✨ Mark Complete
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange('paused')}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md"
            >
              ⏸️ Pause
            </motion.button>
          </div>
        )}

        {goal.status === 'paused' && showActions && (
          <div className="flex gap-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange('active')}
              className="flex-1 btn-primary btn-glow font-semibold shadow-md"
            >
              ▶️ Resume
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatusChange('cancelled')}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md"
            >
              ❌ Cancel
            </motion.button>
          </div>
        )}

        {goal.status === 'completed' && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200/50 rounded-xl shadow-glow-success"
          >
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md animate-pulse-glow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-green-800 ml-3">
                Goal Completed! 🎉✨
              </span>
            </div>
            {goal.completedAt && (
              <p className="text-sm text-green-700 text-center font-medium">
                Completed on {new Date(goal.completedAt).toLocaleDateString()}
              </p>
            )}
          </motion.div>
        )}

        {/* Last updated */}
        {goal.lastProgressUpdate && (
          <div className="mt-6 pt-4 border-t border-gray-100/70">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">
                Last updated: {new Date(goal.lastProgressUpdate).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GoalCard;
