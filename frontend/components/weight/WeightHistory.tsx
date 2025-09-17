import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchWeightEntries,
  deleteWeightEntry,
  selectWeightEntries,
  selectWeightPagination,
  selectWeightLoading,
  selectWeightErrors,
  updateFilters,
  selectWeightFilters,
  setPagination
} from '../../store/slices/weightSlice';
import WeightEntryForm from './WeightEntryForm';

const WeightHistory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const entries = useSelector(selectWeightEntries);
  const pagination = useSelector(selectWeightPagination);
  const loading = useSelector(selectWeightLoading);
  const errors = useSelector(selectWeightErrors);
  const filters = useSelector(selectWeightFilters);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [localFilters, setLocalFilters] = useState({
    startDate: '',
    endDate: '',
    sortBy: 'measuredAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load entries when component mounts or filters change
    loadEntries();
  }, [dispatch, filters, pagination.page]);

  const loadEntries = () => {
    const params = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit
    };
    dispatch(fetchWeightEntries(params));
  };

  const handleFilterChange = () => {
    const newFilters = {
      startDate: localFilters.startDate || null,
      endDate: localFilters.endDate || null,
      sortBy: localFilters.sortBy,
      sortOrder: localFilters.sortOrder
    };
    
    dispatch(updateFilters(newFilters));
    dispatch(setPagination({ page: 1 })); // Reset to first page
  };

  const handleClearFilters = () => {
    setLocalFilters({
      startDate: '',
      endDate: '',
      sortBy: 'measuredAt',
      sortOrder: 'desc'
    });
    setSearchQuery('');
    dispatch(updateFilters({
      startDate: null,
      endDate: null,
      sortBy: 'measuredAt',
      sortOrder: 'desc'
    }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setShowEditForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this weight entry?')) {
      try {
        await dispatch(deleteWeightEntry(id)).unwrap();
        loadEntries(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete entry:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setShowEditForm(false);
    setEditingEntry(null);
    loadEntries();
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPagination({ page: newPage }));
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter(entry => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      entry.notes?.toLowerCase().includes(query) ||
      entry.weight.value.toString().includes(query) ||
      entry.timeOfDay?.toLowerCase().includes(query) ||
      new Date(entry.measuredAt).toLocaleDateString().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return 'text-blue-600';
    if (bmi < 25) return 'text-green-600';
    if (bmi < 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateWeightChange = (currentWeight: number, previousWeight?: number) => {
    if (!previousWeight) return null;
    const change = currentWeight - previousWeight;
    return {
      value: change,
      percentage: ((change / previousWeight) * 100)
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Weight History</h2>
          <div className="text-sm text-gray-500">
            {pagination.total} total entries
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={localFilters.startDate}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={localFilters.endDate}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={localFilters.sortBy}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="measuredAt">Date</option>
              <option value="weight.value">Weight</option>
              <option value="bmi">BMI</option>
              <option value="bodyFat.percentage">Body Fat</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort Order
            </label>
            <select
              value={localFilters.sortOrder}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search entries by notes, weight, or date..."
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

      {/* Table */}
      <div className="overflow-x-auto">
        {loading.entries ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading entries...</span>
            </div>
          </div>
        ) : filteredEntries.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BMI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Body Composition
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry, index) => {
                const previousEntry = index < filteredEntries.length - 1 ? filteredEntries[index + 1] : null;
                const weightChange = calculateWeightChange(entry.weight.value, previousEntry?.weight.value);
                
                return (
                  <tr key={entry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(entry.measuredAt)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(entry.measuredAt)}
                          {entry.timeOfDay && (
                            <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full capitalize">
                              {entry.timeOfDay.replace('-', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.weight.value} {entry.weight.unit}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {weightChange ? (
                        <div className="text-sm">
                          <span className={`font-medium ${
                            weightChange.value > 0 ? 'text-red-600' : 
                            weightChange.value < 0 ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {weightChange.value > 0 ? '+' : ''}{weightChange.value.toFixed(1)} kg
                          </span>
                          <div className={`text-xs ${
                            weightChange.value > 0 ? 'text-red-500' : 
                            weightChange.value < 0 ? 'text-green-500' : 'text-gray-400'
                          }`}>
                            ({weightChange.percentage > 0 ? '+' : ''}{weightChange.percentage.toFixed(1)}%)
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.bmi ? (
                        <span className={`text-sm font-medium ${getBMIColor(entry.bmi)}`}>
                          {entry.bmi.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {entry.bodyFat?.percentage && (
                          <div>BF: {entry.bodyFat.percentage}%</div>
                        )}
                        {entry.muscleMass?.value && (
                          <div>Muscle: {entry.muscleMass.value}kg</div>
                        )}
                        {entry.waterPercentage && (
                          <div>Water: {entry.waterPercentage}%</div>
                        )}
                        {!entry.bodyFat?.percentage && !entry.muscleMass?.value && !entry.waterPercentage && (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {entry.notes || '-'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No weight entries found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first weight entry.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {showEditForm && editingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <WeightEntryForm
              entry={editingEntry}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowEditForm(false);
                setEditingEntry(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightHistory;
