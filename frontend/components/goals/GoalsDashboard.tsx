import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchGoalSummary,
  fetchGoalAnalytics,
  selectGoalSummary,
  selectGoalAnalytics,
  selectGoalLoading,
  selectGoalErrors,
  selectActiveGoals,
  selectOverdueGoals,
  selectHighPriorityGoals,
  selectGoalsNeedingUpdate,
  selectUpcomingDeadlines
} from '../../store/slices/goalsSlice';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';
import ProgressBar, { CircularProgressBar } from '../ui/ProgressBar';

const GoalsDashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const summary = useSelector(selectGoalSummary);
  const analytics = useSelector(selectGoalAnalytics);
  const loading = useSelector(selectGoalLoading);
  const errors = useSelector(selectGoalErrors);
  const activeGoals = useSelector(selectActiveGoals);
  const overdueGoals = useSelector(selectOverdueGoals);
  const highPriorityGoals = useSelector(selectHighPriorityGoals);
  const needsUpdateGoals = useSelector(selectGoalsNeedingUpdate);
  const upcomingDeadlines = useSelector(selectUpcomingDeadlines);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);

  useEffect(() => {
    // Load dashboard data
    dispatch(fetchGoalSummary());
    dispatch(fetchGoalAnalytics());
  }, [dispatch, fetchGoalSummary, fetchGoalAnalytics]);

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingGoal(null);
    // Refresh dashboard data
    dispatch(fetchGoalSummary());
    dispatch(fetchGoalAnalytics());
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
  };

  // Calculate completion rate
  const completionRate = summary?.stats ? 
    (summary.stats.completed / summary.stats.total * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Goals Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Track your progress and stay motivated to achieve your fitness goals
              </p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              Create Goal
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Goals */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.stats?.total || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
            </div>
          </div>

          {/* Active Goals */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Goals</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.stats?.active || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </div>
            </div>
          </div>

          {/* Completed Goals */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.stats?.completed || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Achievements</p>
              </div>
            </div>
          </div>

          {/* Overdue Goals */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary?.stats?.overdue || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Need attention</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Overall Progress */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
              <span className="text-2xl font-bold text-blue-600">
                {completionRate.toFixed(0)}%
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <ProgressBar
                  progress={summary?.stats?.overallProgress || 0}
                  color="blue"
                  height="lg"
                  label={`${summary?.stats?.completed || 0} of ${summary?.stats?.total || 0} goals completed`}
                />
              </div>

              {/* Goal Type Breakdown */}
              {analytics?.typeCounts && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Goals by Type</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {Object.entries(analytics.typeCounts).map(([type, count]) => (
                      <div key={type} className="flex justify-between">
                        <span className="text-gray-600 capitalize">
                          {type.replace('-', ' ')}:
                        </span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="text-sm font-medium text-green-600">
                  {completionRate.toFixed(1)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">High Priority</span>
                <span className="text-sm font-medium text-red-600">
                  {highPriorityGoals.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Due This Week</span>
                <span className="text-sm font-medium text-yellow-600">
                  {upcomingDeadlines.filter(goal => {
                    const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return daysLeft <= 7;
                  }).length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Need Updates</span>
                <span className="text-sm font-medium text-blue-600">
                  {needsUpdateGoals.length}
                </span>
              </div>
            </div>

            {/* Completion Rate Circle */}
            <div className="mt-6 flex justify-center">
              <CircularProgressBar
                progress={completionRate}
                size={120}
                strokeWidth={8}
                color={completionRate >= 80 ? 'green' : completionRate >= 60 ? 'blue' : completionRate >= 40 ? 'yellow' : 'red'}
                label="Completion Rate"
              />
            </div>
          </div>
        </div>

        {/* Priority Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Overdue Goals */}
          {overdueGoals.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">⚠️</span>
                    <h3 className="text-lg font-semibold text-red-700">Overdue Goals</h3>
                  </div>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
                    {overdueGoals.length}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {overdueGoals.slice(0, 3).map((goal: any) => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onEdit={() => handleEdit(goal)}
                      compact
                    />
                  ))}
                </div>
                {overdueGoals.length > 3 && (
                  <div className="mt-4 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      View all {overdueGoals.length} overdue goals
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* High Priority Goals */}
          {highPriorityGoals.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔥</span>
                    <h3 className="text-lg font-semibold text-orange-700">High Priority Goals</h3>
                  </div>
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                    {highPriorityGoals.length}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {highPriorityGoals.slice(0, 3).map((goal: any) => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onEdit={() => handleEdit(goal)}
                      compact
                    />
                  ))}
                </div>
                {highPriorityGoals.length > 3 && (
                  <div className="mt-4 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      View all {highPriorityGoals.length} high priority goals
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Goals & Upcoming Deadlines */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Active Goals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🎯</span>
                  <h3 className="text-lg font-semibold text-green-700">Active Goals</h3>
                </div>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  {activeGoals.length}
                </span>
              </div>
            </div>
            <div className="p-6">
              {activeGoals.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activeGoals.slice(0, 3).map((goal: any) => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onEdit={() => handleEdit(goal)}
                      compact
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active goals</h3>
                  <p className="mt-1 text-sm text-gray-500">Create a goal to get started on your fitness journey.</p>
                </div>
              )}
              {activeGoals.length > 3 && (
                <div className="mt-4 text-center">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View all {activeGoals.length} active goals
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📅</span>
                  <h3 className="text-lg font-semibold text-blue-700">Upcoming Deadlines</h3>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                  {upcomingDeadlines.length}
                </span>
              </div>
            </div>
            <div className="p-6">
              {upcomingDeadlines.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {upcomingDeadlines.slice(0, 5).map((goal: any) => {
                    const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={goal._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{goal.title}</p>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            daysLeft <= 3 ? 'bg-red-100 text-red-800' :
                            daysLeft <= 7 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {daysLeft}d left
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming deadlines</h3>
                  <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Create Goal Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <GoalForm
                onSuccess={handleFormSuccess}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}

        {/* Edit Goal Modal */}
        {editingGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <GoalForm
                goal={editingGoal}
                onSuccess={handleFormSuccess}
                onCancel={() => setEditingGoal(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsDashboard;
