import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState, AppDispatch } from '../../store';
import {
  fetchWeightEntries,
  fetchWeightSummary,
  fetchWeightTrends,
  fetchLatestWeightEntry,
  selectWeightEntries,
  selectWeightSummary,
  selectWeightTrends,
  selectCurrentWeightEntry,
  selectWeightLoading,
  selectWeightErrors,
  updateFilters,
  selectWeightFilters
} from '../../store/slices/weightSlice';
import WeightChart from './WeightChart';
import WeightEntryForm from './WeightEntryForm';

const WeightTracker: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const entries = useSelector(selectWeightEntries);
  const summary = useSelector(selectWeightSummary);
  const trends = useSelector(selectWeightTrends);
  const currentEntry = useSelector(selectCurrentWeightEntry);
  const loading = useSelector(selectWeightLoading);
  const errors = useSelector(selectWeightErrors);
  const filters = useSelector(selectWeightFilters);

  const [showAddForm, setShowAddForm] = useState(false);
  const [chartOptions, setChartOptions] = useState({
    showBodyFat: false,
    showMuscle: false,
    showBMI: true
  });
  const [timeRange, setTimeRange] = useState('3months');

  useEffect(() => {
    // Load initial data
    const params = getFilterParams();
    dispatch(fetchWeightEntries(params));
    dispatch(fetchWeightSummary());
    dispatch(fetchLatestWeightEntry());
  }, [dispatch, timeRange]);

  useEffect(() => {
    // Load trends when time range changes
    const params = getFilterParams();
    dispatch(fetchWeightTrends(params));
  }, [dispatch, timeRange]);

  const getFilterParams = () => {
    const now = new Date();
    let startDate: Date | null = new Date();
    
    switch (timeRange) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = null;
        break;
    }

    return {
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: now.toISOString(),
      limit: 100,
      sortBy: 'measuredAt',
      sortOrder: 'desc'
    };
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    // Refresh data
    const params = getFilterParams();
    dispatch(fetchWeightEntries(params));
    dispatch(fetchWeightSummary());
    dispatch(fetchLatestWeightEntry());
  };

  const handleChartOptionChange = (option: string, value: boolean) => {
    setChartOptions(prev => ({
      ...prev,
      [option]: value
    }));
  };

  // Calculate BMI status
  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
    return { category: 'Obese', color: 'text-red-600' };
  };

  // Format weight change
  const formatWeightChange = (change: number) => {
    const absChange = Math.abs(change);
    const sign = change >= 0 ? '+' : '-';
    return `${sign}${absChange.toFixed(1)} kg`;
  };

  const consistency = summary?.consistency;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 bg-dots py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gradient-purple">⚖️ Weight Tracker</h1>
              <p className="mt-3 text-lg text-gray-600 font-medium">
                Monitor your weight progress and body composition over time
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="btn-primary btn-glow btn-lg font-semibold shadow-md flex items-center space-x-2"
            >
              <span className="text-lg">➕</span>
              <span>Add Entry</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Weight */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card hover-lift group"
          >
            <div className="flex items-center p-6">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg shadow-purple-500/30 animate-pulse-glow">
                  <span className="text-xl text-white">⚖️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">Current Weight</p>
                <p className="text-3xl font-bold text-gradient-purple">
                  {summary?.latestWeight ? `${summary.latestWeight.value} ${summary.latestWeight.unit}` : '--'}
                </p>
                {summary?.lastLoggedDays !== undefined && (
                  <p className={`text-xs font-medium mt-1 ${
                    summary.lastLoggedDays === 0 ? 'text-green-600' : summary.lastLoggedDays <= 3 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {summary.lastLoggedDays === 0 ? '✅ Updated today' : `⏰ ${summary.lastLoggedDays} days ago`}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Weight Change (30 days) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card hover-lift group"
          >
            <div className="flex items-center p-6">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-xl shadow-lg ${
                  summary?.weightChange30Days && summary.weightChange30Days < 0 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30' 
                    : 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30'
                }`}>
                  <span className="text-xl text-white">
                    {summary?.weightChange30Days && summary.weightChange30Days < 0 ? '📉' : '📈'}
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">30-Day Change</p>
                <p className={`text-3xl font-bold ${
                  summary?.weightChange30Days && summary.weightChange30Days < 0 ? 'text-gradient-success' : 'bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'
                }`}>
                  {summary?.weightChange30Days !== null ? formatWeightChange(summary.weightChange30Days) : '--'}
                </p>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  {summary?.weightChange30Days && summary.weightChange30Days < 0 ? '✨ Great progress!' : '💪 Keep going!'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Current BMI */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card hover-lift group"
          >
            <div className="flex items-center p-6">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30">
                  <span className="text-xl text-white">🗃️</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">Current BMI</p>
                <p className="text-3xl font-bold text-gradient-blue">
                  {summary?.currentBMI ? summary.currentBMI.toFixed(1) : '--'}
                </p>
                {summary?.currentBMI && (
                  <p className={`text-xs mt-1 font-bold px-2 py-1 rounded-full ${
                    getBMIStatus(summary.currentBMI).color === 'text-green-600' ? 'bg-green-100 text-green-700' :
                    getBMIStatus(summary.currentBMI).color === 'text-blue-600' ? 'bg-blue-100 text-blue-700' :
                    getBMIStatus(summary.currentBMI).color === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {getBMIStatus(summary.currentBMI).category}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Total Entries */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card hover-lift group"
          >
            <div className="flex items-center p-6">
              <div className="flex-shrink-0">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/30">
                  <span className="text-xl text-white">📁</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-gray-600 group-hover:text-gray-800 transition-colors">Total Entries</p>
                <p className="text-3xl font-bold text-gradient-success">
                  {summary?.totalEntries || 0}
                </p>
                <p className="text-xs font-medium text-green-600 mt-1">
                  📅 Logged entries
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Time Range Selector and Chart Options */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card hover-lift mb-8"
        >
          <div className="p-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📈</span>
                  <h2 className="text-2xl font-bold text-gradient-blue">Weight Progress</h2>
                </div>
                
                {/* Time Range Selector */}
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="input text-sm py-2 px-3 w-auto min-w-[140px]"
                >
                  <option value="1month">Last Month</option>
                  <option value="3months">Last 3 Months</option>
                  <option value="6months">Last 6 Months</option>
                  <option value="1year">Last Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              {/* Chart Options */}
              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex items-center text-sm bg-gradient-to-r from-orange-50 to-orange-100 px-3 py-2 rounded-xl border border-orange-200/50 hover:shadow-sm transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chartOptions.showBodyFat}
                    onChange={(e) => handleChartOptionChange('showBodyFat', e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="font-medium text-orange-700">📊 Body Fat %</span>
                </label>
                <label className="inline-flex items-center text-sm bg-gradient-to-r from-green-50 to-emerald-100 px-3 py-2 rounded-xl border border-green-200/50 hover:shadow-sm transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chartOptions.showMuscle}
                    onChange={(e) => handleChartOptionChange('showMuscle', e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="font-medium text-green-700">💪 Muscle Mass</span>
                </label>
                <label className="inline-flex items-center text-sm bg-gradient-to-r from-blue-50 to-indigo-100 px-3 py-2 rounded-xl border border-blue-200/50 hover:shadow-sm transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chartOptions.showBMI}
                    onChange={(e) => handleChartOptionChange('showBMI', e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-blue-700">📃 BMI</span>
                </label>
              </div>
            </div>

            {/* Weight Chart */}
            {loading.trends ? (
              <div className="flex items-center justify-center h-96 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl border border-blue-100/50">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-gray-700 font-medium">📄 Loading chart data...</span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl border border-gray-100/50 overflow-hidden">
                <WeightChart
                  data={entries}
                  showBodyFat={chartOptions.showBodyFat}
                  showMuscle={chartOptions.showMuscle}
                  showBMI={chartOptions.showBMI}
                  height={400}
                  className="shadow-none border-none p-4"
                />
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Entries & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Entries */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card hover-lift"
          >
            <div className="px-6 py-4 border-b border-gray-100/70 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📅</span>
                  <h3 className="text-lg font-bold text-gray-900">Recent Entries</h3>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                >
                  View All →
                </motion.button>
              </div>
            </div>
            <div className="p-6">
              {loading.entries ? (
                <div className="flex items-center justify-center h-32">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-gray-600 font-medium">🔄 Loading entries...</span>
                  </div>
                </div>
              ) : entries.length > 0 ? (
                <div className="space-y-3">
                  {entries.slice(0, 5).map((entry: any, index) => (
                    <motion.div 
                      key={entry._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50/50 to-white rounded-xl border border-gray-100/50 hover:shadow-sm transition-all duration-200 group"
                    >
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                          ⚖️ {entry.weight.value} {entry.weight.unit}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            {new Date(entry.measuredAt).toLocaleDateString()}
                          </span>
                          {entry.timeOfDay && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium capitalize">
                              {entry.timeOfDay.replace('-', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {entry.bodyFat?.percentage && (
                          <p className="text-sm font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                            {entry.bodyFat.percentage}% BF
                          </p>
                        )}
                        {entry.bmi && (
                          <p className="text-xs font-medium text-gray-500 mt-1">
                            BMI: {entry.bmi.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📅</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No weight entries yet</h3>
                  <p className="text-gray-500 mb-4">Get started by adding your first weight entry.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddForm(true)}
                    className="btn-primary btn-sm font-semibold"
                  >
                    ➕ Add Entry
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Consistency Tracking */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card hover-lift"
          >
            <div className="px-6 py-4 border-b border-gray-100/70 bg-gradient-to-r from-purple-50/50 to-indigo-50/50">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔥</span>
                <h3 className="text-lg font-bold text-gray-900">Tracking Consistency</h3>
              </div>
            </div>
            <div className="p-6">
              {consistency ? (
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">📅</span>
                        <span className="font-semibold text-gray-700">This Week</span>
                      </div>
                      <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                        consistency.thisWeek >= 80 ? 'bg-green-100 text-green-700' :
                        consistency.thisWeek >= 60 ? 'bg-blue-100 text-blue-700' :
                        consistency.thisWeek >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {consistency.thisWeek.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-3 shadow-inner">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-sm" 
                        initial={{ width: 0 }}
                        animate={{ width: `${consistency.thisWeek}%` }}
                        transition={{ duration: 1, delay: 0.8 }}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">🗓️</span>
                        <span className="font-semibold text-gray-700">This Month</span>
                      </div>
                      <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                        consistency.thisMonth >= 80 ? 'bg-green-100 text-green-700' :
                        consistency.thisMonth >= 60 ? 'bg-blue-100 text-blue-700' :
                        consistency.thisMonth >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {consistency.thisMonth.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-3 shadow-inner">
                      <motion.div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full shadow-sm" 
                        initial={{ width: 0 }}
                        animate={{ width: `${consistency.thisMonth}%` }}
                        transition={{ duration: 1, delay: 0.9 }}
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">📈</span>
                        <span className="font-semibold text-gray-700">Overall</span>
                      </div>
                      <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                        consistency.overall >= 80 ? 'bg-green-100 text-green-700' :
                        consistency.overall >= 60 ? 'bg-blue-100 text-blue-700' :
                        consistency.overall >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {consistency.overall.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-3 shadow-inner">
                      <motion.div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full shadow-sm" 
                        initial={{ width: 0 }}
                        animate={{ width: `${consistency.overall}%` }}
                        transition={{ duration: 1, delay: 1 }}
                      />
                    </div>
                  </motion.div>
                  
                  {/* Consistency Tips */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm">💡</span>
                      <span className="text-sm font-bold text-blue-700">Consistency Tip</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      {consistency.overall >= 80 ? 
                        "Excellent consistency! Keep up the great work! 🎆" :
                        consistency.overall >= 60 ?
                        "Good progress! Try to log entries more regularly for better insights. 💪" :
                        "Set a daily reminder to track your weight consistently. Small habits make big changes! ✨"
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Building consistency data</h3>
                  <p className="text-gray-500">Add more entries to see your tracking patterns.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Add Entry Modal */}
        {showAddForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            >
              <WeightEntryForm
                onSuccess={handleFormSuccess}
                onCancel={() => setShowAddForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WeightTracker;
