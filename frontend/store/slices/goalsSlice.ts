import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/firebaseService';

// Initial state
type GoalsState = {
  goals: any[];
  currentGoal: any | null;
  pagination: { page: number; limit: number; total: number; pages: number };
  analytics: any | null;
  summary: any | null;
  insights: any | null;
  filters: { status: string | null; type: string | null; priority: string | null; category: string | null; sortBy: string; sortOrder: 'asc' | 'desc' };
  loading: { goals: boolean; create: boolean; update: boolean; delete: boolean; progress: boolean; status: boolean; analytics: boolean; summary: boolean; insights: boolean; sync: boolean };
  error: { goals: string | null | undefined; create: string | null | undefined; update: string | null | undefined; delete: string | null | undefined; progress: string | null | undefined; status: string | null | undefined; analytics: string | null | undefined; summary: string | null | undefined; insights: string | null | undefined; sync: string | null | undefined };
};

const initialState: GoalsState = {
  goals: [],
  currentGoal: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  analytics: null,
  summary: null,
  insights: null,
  filters: {
    status: null,
    type: null,
    priority: null,
    category: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  loading: {
    goals: false,
    create: false,
    update: false,
    delete: false,
    progress: false,
    status: false,
    analytics: false,
    summary: false,
    insights: false,
    sync: false
  },
  error: {
    goals: null,
    create: null,
    update: null,
    delete: null,
    progress: null,
    status: null,
    analytics: null,
    summary: null,
    insights: null,
    sync: null
  }
};

// Async thunks for API calls

// Get all goals
export const fetchGoals = createAsyncThunk<any, Record<string, any> | undefined, { rejectValue: string }>(
  'goals/fetchGoals',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.goals.getGoals(params);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch goals');
    }
  }
);

// Get single goal
export const fetchGoal = createAsyncThunk<any, string, { rejectValue: string }>(
  'goals/fetchGoal',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.goals.getGoal(id);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch goal');
    }
  }
);

// Create goal
export const createGoal = createAsyncThunk<any, any, { rejectValue: string }>(
  'goals/createGoal',
  async (goalData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.goals.createGoal(goalData);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to create goal');
    }
  }
);

// Update goal
export const updateGoal = createAsyncThunk<any, { id: string; data: any }, { rejectValue: string }>(
  'goals/updateGoal',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.goals.updateGoal(id, data);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to update goal');
    }
  }
);

// Delete goal
export const deleteGoal = createAsyncThunk<string, string, { rejectValue: string }>(
  'goals/deleteGoal',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.goals.deleteGoal(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to delete goal');
    }
  }
);

// Update goal progress
export const updateGoalProgress = createAsyncThunk<any, { id: string; progressData: any }, { rejectValue: string }>(
  'goals/updateProgress',
  async ({ id, progressData }: { id: string; progressData: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.goals.updateProgress(id, progressData);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to update goal progress');
    }
  }
);

// Update goal status
export const updateGoalStatus = createAsyncThunk<any, { id: string; status: string; reason?: string }, { rejectValue: string }>(
  'goals/updateStatus',
  async ({ id, status, reason }: { id: string; status: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.goals.updateStatus(id, { status, reason });
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to update goal status');
    }
  }
);

// Get goal analytics
export const fetchGoalAnalytics = createAsyncThunk<any, void, { rejectValue: string }>(
  'goals/fetchAnalytics',
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await apiService.goals.getAnalytics();
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch goal analytics');
    }
  }
);

// Get goal summary
export const fetchGoalSummary = createAsyncThunk<any, void, { rejectValue: string }>(
  'goals/fetchSummary',
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await apiService.goals.getSummary();
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch goal summary');
    }
  }
);

// Get goal insights
export const fetchGoalInsights = createAsyncThunk<any, string, { rejectValue: string }>(
  'goals/fetchInsights',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.goals.getInsights(id);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch goal insights');
    }
  }
);

// Sync goal with actual data
export const syncGoal = createAsyncThunk<any, string, { rejectValue: string }>(
  'goals/syncGoal',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.goals.syncGoal(id);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to sync goal');
    }
  }
);

// Goals slice
const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    // Clear errors
    clearGoalErrors: (state) => {
      state.error = { ...initialState.error };
    },
    
    // Clear specific error
    clearSpecificError: (state, action) => {
      const errorType = action.payload;
      if (state.error[errorType]) {
        state.error[errorType] = null;
      }
    },
    
    // Clear current goal
    clearCurrentGoal: (state) => {
      state.currentGoal = null;
    },
    
    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<GoalsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset filters
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    
    // Clear analytics
    clearAnalytics: (state) => {
      state.analytics = null;
    },
    
    // Clear summary
    clearSummary: (state) => {
      state.summary = null;
    },
    
    // Clear insights
    clearInsights: (state) => {
      state.insights = null;
    },
    
    // Set pagination
    setPagination: (state, action: PayloadAction<Partial<GoalsState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // Optimistic update for goal completion
    optimisticCompleteGoal: (state, action) => {
      const goalId = action.payload;
      const goal = state.goals.find(g => g._id === goalId);
      if (goal) {
        goal.status = 'completed';
        goal.completedAt = new Date().toISOString();
      }
      if (state.currentGoal && state.currentGoal._id === goalId) {
        state.currentGoal.status = 'completed';
        state.currentGoal.completedAt = new Date().toISOString();
      }
    },
    
    // Optimistic progress update
    optimisticUpdateProgress: (state, action) => {
      const { goalId, currentValue } = action.payload;
      const goal = state.goals.find(g => g._id === goalId);
      if (goal) {
        goal.currentValue = currentValue;
        goal.lastProgressUpdate = new Date().toISOString();
      }
      if (state.currentGoal && state.currentGoal._id === goalId) {
        state.currentGoal.currentValue = currentValue;
        state.currentGoal.lastProgressUpdate = new Date().toISOString();
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch goals
      .addCase(fetchGoals.pending, (state) => {
        state.loading.goals = true;
        state.error.goals = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading.goals = false;
        state.goals = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading.goals = false;
        state.error.goals = action.payload;
      })
      
      // Fetch single goal
      .addCase(fetchGoal.pending, (state) => {
        state.loading.goals = true;
      })
      .addCase(fetchGoal.fulfilled, (state, action) => {
        state.loading.goals = false;
        state.currentGoal = action.payload;
      })
      .addCase(fetchGoal.rejected, (state, action) => {
        state.loading.goals = false;
        state.error.goals = action.payload;
      })
      
      // Create goal
      .addCase(createGoal.pending, (state) => {
        state.loading.create = true;
        state.error.create = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading.create = false;
        state.goals.unshift(action.payload);
        state.currentGoal = action.payload;
        state.pagination.total += 1;
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading.create = false;
        state.error.create = action.payload;
      })
      
      // Update goal
      .addCase(updateGoal.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading.update = false;
        const index = state.goals.findIndex(goal => goal._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        if (state.currentGoal && state.currentGoal._id === action.payload._id) {
          state.currentGoal = action.payload;
        }
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading.update = false;
        state.error.update = action.payload;
      })
      
      // Delete goal
      .addCase(deleteGoal.pending, (state) => {
        state.loading.delete = true;
        state.error.delete = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.goals = state.goals.filter(goal => goal._id !== action.payload);
        if (state.currentGoal && state.currentGoal._id === action.payload) {
          state.currentGoal = null;
        }
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading.delete = false;
        state.error.delete = action.payload;
      })
      
      // Update goal progress
      .addCase(updateGoalProgress.pending, (state) => {
        state.loading.progress = true;
        state.error.progress = null;
      })
      .addCase(updateGoalProgress.fulfilled, (state, action) => {
        state.loading.progress = false;
        const index = state.goals.findIndex(goal => goal._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        if (state.currentGoal && state.currentGoal._id === action.payload._id) {
          state.currentGoal = action.payload;
        }
      })
      .addCase(updateGoalProgress.rejected, (state, action) => {
        state.loading.progress = false;
        state.error.progress = action.payload;
      })
      
      // Update goal status
      .addCase(updateGoalStatus.pending, (state) => {
        state.loading.status = true;
        state.error.status = null;
      })
      .addCase(updateGoalStatus.fulfilled, (state, action) => {
        state.loading.status = false;
        const index = state.goals.findIndex(goal => goal._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
        if (state.currentGoal && state.currentGoal._id === action.payload._id) {
          state.currentGoal = action.payload;
        }
      })
      .addCase(updateGoalStatus.rejected, (state, action) => {
        state.loading.status = false;
        state.error.status = action.payload;
      })
      
      // Fetch goal analytics
      .addCase(fetchGoalAnalytics.pending, (state) => {
        state.loading.analytics = true;
        state.error.analytics = null;
      })
      .addCase(fetchGoalAnalytics.fulfilled, (state, action) => {
        state.loading.analytics = false;
        state.analytics = action.payload;
      })
      .addCase(fetchGoalAnalytics.rejected, (state, action) => {
        state.loading.analytics = false;
        state.error.analytics = action.payload;
      })
      
      // Fetch goal summary
      .addCase(fetchGoalSummary.pending, (state) => {
        state.loading.summary = true;
        state.error.summary = null;
      })
      .addCase(fetchGoalSummary.fulfilled, (state, action) => {
        state.loading.summary = false;
        state.summary = action.payload;
      })
      .addCase(fetchGoalSummary.rejected, (state, action) => {
        state.loading.summary = false;
        state.error.summary = action.payload;
      })
      
      // Fetch goal insights
      .addCase(fetchGoalInsights.pending, (state) => {
        state.loading.insights = true;
        state.error.insights = null;
      })
      .addCase(fetchGoalInsights.fulfilled, (state, action) => {
        state.loading.insights = false;
        state.insights = action.payload;
      })
      .addCase(fetchGoalInsights.rejected, (state, action) => {
        state.loading.insights = false;
        state.error.insights = action.payload;
      })
      
      // Sync goal
      .addCase(syncGoal.pending, (state) => {
        state.loading.sync = true;
        state.error.sync = null;
      })
      .addCase(syncGoal.fulfilled, (state, action) => {
        state.loading.sync = false;
        const goal = action.payload.goal;
        const index = state.goals.findIndex(g => g._id === goal._id);
        if (index !== -1) {
          state.goals[index] = goal;
        }
        if (state.currentGoal && state.currentGoal._id === goal._id) {
          state.currentGoal = goal;
        }
      })
      .addCase(syncGoal.rejected, (state, action) => {
        state.loading.sync = false;
        state.error.sync = action.payload;
      });
  }
});

// Export actions
export const {
  clearGoalErrors,
  clearSpecificError,
  clearCurrentGoal,
  updateFilters,
  resetFilters,
  clearAnalytics,
  clearSummary,
  clearInsights,
  setPagination,
  optimisticCompleteGoal,
  optimisticUpdateProgress
} = goalsSlice.actions;

// Selectors
export const selectGoals = (state) => state.goals.goals;
export const selectCurrentGoal = (state) => state.goals.currentGoal;
export const selectGoalsPagination = (state) => state.goals.pagination;
export const selectGoalAnalytics = (state) => state.goals.analytics;
export const selectGoalSummary = (state) => state.goals.summary;
export const selectGoalInsights = (state) => state.goals.insights;
export const selectGoalFilters = (state) => state.goals.filters;
export const selectGoalLoading = (state) => state.goals.loading;
export const selectGoalErrors = (state) => state.goals.error;

// Derived selectors
export const selectActiveGoals = (state) => {
  return state.goals.goals.filter(goal => goal.status === 'active');
};

export const selectCompletedGoals = (state) => {
  return state.goals.goals.filter(goal => goal.status === 'completed');
};

export const selectOverdueGoals = (state) => {
  const now = new Date();
  return state.goals.goals.filter(goal => 
    goal.status === 'active' && 
    new Date(goal.targetDate) < now
  );
};

export const selectGoalsByType = (state) => (type) => {
  return state.goals.goals.filter(goal => goal.type === type);
};

export const selectGoalsByPriority = (state) => (priority) => {
  return state.goals.goals.filter(goal => goal.priority === priority);
};

export const selectHighPriorityGoals = (state) => {
  return state.goals.goals.filter(goal => 
    goal.priority === 'high' && goal.status === 'active'
  );
};

export const selectGoalsNeedingUpdate = (state) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return state.goals.goals.filter(goal => 
    goal.status === 'active' && (
      !goal.lastProgressUpdate || 
      new Date(goal.lastProgressUpdate) < sevenDaysAgo
    )
  );
};

export const selectGoalProgress = (state) => (goalId) => {
  const goal = state.goals.goals.find(g => g._id === goalId);
  if (!goal || !goal.targetValue) return null;
  
  const progressPercent = (goal.currentValue / goal.targetValue) * 100;
  
  return {
    current: goal.currentValue || 0,
    target: goal.targetValue,
    percent: Math.min(progressPercent, 100),
    isComplete: progressPercent >= 100
  };
};

export const selectGoalCompletionRate = (state) => {
  const totalGoals = state.goals.goals.length;
  const completedGoals = state.goals.goals.filter(g => g.status === 'completed').length;
  
  return totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
};

export const selectIsGoalsLoading = (state) => {
  const loading = state.goals.loading;
  return Object.values(loading).some(isLoading => isLoading);
};

export const selectHasGoalErrors = (state) => {
  const errors = state.goals.error;
  return Object.values(errors).some(error => error !== null);
};

export const selectGoalsByStatus = (state) => {
  const goals = state.goals.goals;
  return {
    active: goals.filter(g => g.status === 'active'),
    completed: goals.filter(g => g.status === 'completed'),
    paused: goals.filter(g => g.status === 'paused'),
    cancelled: goals.filter(g => g.status === 'cancelled')
  };
};

export const selectUpcomingDeadlines = (state) => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  return state.goals.goals.filter(goal =>
    goal.status === 'active' &&
    new Date(goal.targetDate) <= thirtyDaysFromNow &&
    new Date(goal.targetDate) >= new Date()
  ).sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
};

// Export reducer
export default goalsSlice.reducer;
