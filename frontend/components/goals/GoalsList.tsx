import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchGoals,
  selectGoals,
  selectGoalsPagination,
  selectGoalLoading,
  selectGoalErrors,
  updateFilters,
  selectGoalFilters,
  setPagination
} from '../../store/slices/goalsSlice';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';

interface GoalsListProps {
  viewMode?: 'grid' | 'list';
  showFilters?: boolean;
  compactView?: boolean;
}

const GoalsList: React.FC<GoalsListProps> = ({
  viewMode = 'grid',
  showFilters = true,
  compactView = false
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const goals = useSelector(selectGoals);
  const pagination = useSelector(selectGoalsPagination);
  const loading = useSelector(selectGoalLoading);
  const errors = useSelector(selectGoalErrors);
  const filters = useSelector(selectGoalFilters);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [currentViewMode, setCurrentViewMode] = useState<'grid' | 'list'>(viewMode);
  const [localFilters, setLocalFilters] = useState({
    status: '',
    type: '',
    priority: '',
    category: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load goals when component mounts or filters change
    loadGoals();
  }, [dispatch, filters, pagination.page]);

  const loadGoals = () => {
    const params = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit
    };
    dispatch(fetchGoals(params));
  };

  const handleFilterChange = () => {
    const newFilters = {
      status: localFilters.status || null,
      type: localFilters.type || null,
      priority: localFilters.priority || null,
      category: localFilters.category || null,
      sortBy: localFilters.sortBy,
      sortOrder: localFilters.sortOrder
    };
    
    dispatch(updateFilters(newFilters));
    dispatch(setPagination({ page: 1 })); // Reset to first page
  };

  const handleClearFilters = () => {
    setLocalFilters({
      status: '',
      type: '',
      priority: '',
      category: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchQuery('');
    dispatch(updateFilters({
      status: null,
      type: null,
      priority: null,
      category: null,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingGoal(null);
    loadGoals();
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPagination({ page: newPage }));
  };

  // Filter goals based on search query
  const filteredGoals = goals.filter(goal => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      goal.title.toLowerCase().includes(query) ||
      goal.description?.toLowerCase().includes(query) ||
      goal.type.toLowerCase().includes(query) ||
      goal.category?.toLowerCase().includes(query)
    );
  });

  // Group goals by status for better organization
  const groupedGoals = filteredGoals.reduce((acc, goal) => {
    const status = goal.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(goal);
    return acc;
  }, {} as Record<string, any[]>);

  const statusOrder = ['active', 'paused', 'completed', 'cancelled'];
  const statusLabels = {
    active: { label: 'Active Goals', icon: '🎯', color: 'text-green-600' },
    paused: { label: 'Paused Goals', icon: '⏸️', color: 'text-yellow-600' },
    completed: { label: 'Completed Goals', icon: '✅', color: 'text-blue-600' },
    cancelled: { label: 'Cancelled Goals', icon: '❌', color: 'text-red-600' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="mt-1 text-gray-600">
            Track and manage your fitness goals and achievements
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              onClick={() => setCurrentViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                currentViewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentViewMode('list')}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                currentViewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            Create Goal
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={localFilters.status}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={localFilters.type}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="weight-loss">Weight Loss</option>
                <option value="weight-gain">Weight Gain</option>
                <option value="muscle-gain">Muscle Gain</option>
                <option value="fat-loss">Fat Loss</option>
                <option value="strength">Strength</option>
                <option value="endurance">Endurance</option>
                <option value="habit">Habit</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={localFilters.priority}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={localFilters.category}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="fitness">Fitness</option>
                <option value="nutrition">Nutrition</option>
                <option value="health">Health</option>
                <option value="lifestyle">Lifestyle</option>
                <option value="performance">Performance</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={`${localFilters.sortBy}-${localFilters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setLocalFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="targetDate-asc">Deadline (Soonest)</option>
                <option value="targetDate-desc">Deadline (Latest)</option>
                <option value="priority-desc">Priority (High to Low)</option>
                <option value="priority-asc">Priority (Low to High)</option>
                <option value="title-asc">Title (A to Z)</option>
                <option value="title-desc">Title (Z to A)</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search goals by title, description, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={handleFilterChange}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Apply Filters
            </button>
            
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Goals Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {filteredGoals.length} goal{filteredGoals.length !== 1 ? 's' : ''} found
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {pagination.total > pagination.limit && (
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
        )}
      </div>

      {/* Goals Content */}
      {loading.goals ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading goals...</span>
          </div>
        </div>
      ) : filteredGoals.length > 0 ? (
        <div className="space-y-8">
          {statusOrder
            .filter(status => groupedGoals[status]?.length > 0)
            .map(status => (
              <div key={status} className="space-y-4">
                {/* Status Header */}
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{statusLabels[status].icon}</span>
                  <h2 className={`text-xl font-semibold ${statusLabels[status].color}`}>
                    {statusLabels[status].label}
                  </h2>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm font-medium">
                    {groupedGoals[status].length}
                  </span>
                </div>

                {/* Goals Grid/List */}
                {currentViewMode === 'grid' ? (
                  <div className={`grid gap-6 ${
                    compactView 
                      ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                  }`}>
                    {groupedGoals[status].map((goal: any) => (
                      <GoalCard
                        key={goal._id}
                        goal={goal}
                        onEdit={() => handleEdit(goal)}
                        compact={compactView}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupedGoals[status].map((goal: any) => (
                      <GoalCard
                        key={goal._id}
                        goal={goal}
                        onEdit={() => handleEdit(goal)}
                        compact={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? 'No goals found' : 'No goals yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms or filters.'
              : 'Create your first goal to start tracking your fitness journey.'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Goal
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex items-center space-x-1">
            {[...Array(pagination.pages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === pagination.pages ||
                (page >= pagination.page - 1 && page <= pagination.page + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm border rounded-md ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === pagination.page - 2 ||
                page === pagination.page + 2
              ) {
                return <span key={page} className="px-2 text-gray-500">...</span>;
              }
              return null;
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

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
  );
};

export default GoalsList;
