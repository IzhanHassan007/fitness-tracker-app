import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

// Types
export interface Exercise {
  _id?: string;
  name: string;
  category?: string;
  muscleGroups?: string[];
  sets: ExerciseSet[];
  totalVolume?: number;
  personalRecord?: boolean;
  difficulty?: number;
  notes?: string;
}

export interface ExerciseSet {
  setNumber: number;
  reps?: number;
  weight?: {
    value: number;
    unit: 'kg' | 'lbs' | 'bodyweight';
  };
  duration?: {
    value: number;
    unit: 'seconds' | 'minutes' | 'hours';
  };
  distance?: {
    value: number;
    unit: 'm' | 'km' | 'ft' | 'mi' | 'yards';
  };
  restTime?: number;
  notes?: string;
  completed?: boolean;
}

export interface Workout {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  intensity?: 'low' | 'moderate' | 'high' | 'extreme';
  duration?: {
    planned?: number;
    actual?: number;
  };
  exercises: Exercise[];
  startTime: string;
  endTime?: string;
  caloriesBurned?: number;
  location?: string;
  equipment?: string[];
  mood?: {
    before?: number;
    after?: number;
  };
  energyLevel?: {
    before?: number;
    after?: number;
  };
  bodyWeight?: {
    value: number;
    unit: 'kg' | 'lbs';
  };
  weather?: {
    condition?: string;
    temperature?: {
      value: number;
      unit: 'celsius' | 'fahrenheit';
    };
  };
  tags?: string[];
  isTemplate?: boolean;
  templateName?: string;
  isPublic?: boolean;
  completionStatus: 'planned' | 'in-progress' | 'completed' | 'skipped';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  totalDuration?: number;
  totalExercises?: number;
  totalSets?: number;
  totalVolume?: number;
  primaryMuscleGroups?: string[];
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  totalCalories: number;
  averageIntensity: number;
  workoutTypes: string[];
  recentWorkouts: Partial<Workout>[];
  personalRecords: any[];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface WorkoutState {
  workouts: Workout[];
  currentWorkout: Workout | null;
  templates: Workout[];
  stats: WorkoutStats | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  filters: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  };
}

// Initial state
const initialState: WorkoutState = {
  workouts: [],
  currentWorkout: null,
  templates: [],
  stats: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  pagination: null,
  filters: {},
};

// Async thunks
export const fetchWorkouts = createAsyncThunk(
  'workouts/fetchWorkouts',
  async (params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await api.get(`/workouts?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch workouts';
      return rejectWithValue(message);
    }
  }
);

export const fetchWorkout = createAsyncThunk(
  'workouts/fetchWorkout',
  async (workoutId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/workouts/${workoutId}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch workout';
      return rejectWithValue(message);
    }
  }
);

export const createWorkout = createAsyncThunk(
  'workouts/createWorkout',
  async (workoutData: Partial<Workout>, { rejectWithValue }) => {
    try {
      const response = await api.post('/workouts', workoutData);
      toast.success('Workout created successfully!');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create workout';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateWorkout = createAsyncThunk(
  'workouts/updateWorkout',
  async ({ id, data }: { id: string; data: Partial<Workout> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/workouts/${id}`, data);
      toast.success('Workout updated successfully!');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update workout';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteWorkout = createAsyncThunk(
  'workouts/deleteWorkout',
  async (workoutId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/workouts/${workoutId}`);
      toast.success('Workout deleted successfully!');
      return workoutId;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete workout';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const startWorkout = createAsyncThunk(
  'workouts/startWorkout',
  async (workoutId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/workouts/${workoutId}/start`);
      toast.success('Workout started!');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to start workout';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const completeWorkout = createAsyncThunk(
  'workouts/completeWorkout',
  async (workoutId: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/workouts/${workoutId}/complete`);
      toast.success('Workout completed! Great job! 💪');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to complete workout';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addExercise = createAsyncThunk(
  'workouts/addExercise',
  async ({ workoutId, exercise }: { workoutId: string; exercise: Partial<Exercise> }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/workouts/${workoutId}/exercises`, exercise);
      toast.success('Exercise added to workout!');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to add exercise';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateExercise = createAsyncThunk(
  'workouts/updateExercise',
  async ({ 
    workoutId, 
    exerciseId, 
    exercise 
  }: { 
    workoutId: string; 
    exerciseId: string; 
    exercise: Partial<Exercise> 
  }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/workouts/${workoutId}/exercises/${exerciseId}`, exercise);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update exercise';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteExercise = createAsyncThunk(
  'workouts/deleteExercise',
  async ({ workoutId, exerciseId }: { workoutId: string; exerciseId: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`);
      toast.success('Exercise removed from workout');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete exercise';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchWorkoutStats = createAsyncThunk(
  'workouts/fetchWorkoutStats',
  async (params: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await api.get(`/workouts/stats/summary?${queryParams.toString()}`);
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch workout statistics';
      return rejectWithValue(message);
    }
  }
);

export const fetchWorkoutTemplates = createAsyncThunk(
  'workouts/fetchWorkoutTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/workouts/templates/list');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch templates';
      return rejectWithValue(message);
    }
  }
);

export const createWorkoutFromTemplate = createAsyncThunk(
  'workouts/createWorkoutFromTemplate',
  async ({ templateId, name }: { templateId: string; name?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/workouts/templates/${templateId}/create`, { name });
      toast.success('Workout created from template!');
      return response.data.data;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create workout from template';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Workout slice
const workoutSlice = createSlice({
  name: 'workouts',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<WorkoutState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentWorkout: (state, action: PayloadAction<Workout | null>) => {
      state.currentWorkout = action.payload;
    },
    clearCurrentWorkout: (state) => {
      state.currentWorkout = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch workouts
    builder
      .addCase(fetchWorkouts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkouts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workouts = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchWorkouts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single workout
    builder
      .addCase(fetchWorkout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkout.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWorkout = action.payload;
        state.error = null;
      })
      .addCase(fetchWorkout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create workout
    builder
      .addCase(createWorkout.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createWorkout.fulfilled, (state, action) => {
        state.isCreating = false;
        state.workouts.unshift(action.payload);
        state.currentWorkout = action.payload;
        state.error = null;
      })
      .addCase(createWorkout.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update workout
    builder
      .addCase(updateWorkout.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateWorkout.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.workouts.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.workouts[index] = action.payload;
        }
        if (state.currentWorkout?._id === action.payload._id) {
          state.currentWorkout = action.payload;
        }
        state.error = null;
      })
      .addCase(updateWorkout.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete workout
    builder
      .addCase(deleteWorkout.fulfilled, (state, action) => {
        state.workouts = state.workouts.filter(w => w._id !== action.payload);
        if (state.currentWorkout?._id === action.payload) {
          state.currentWorkout = null;
        }
      });

    // Start workout
    builder
      .addCase(startWorkout.fulfilled, (state, action) => {
        const index = state.workouts.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.workouts[index] = action.payload;
        }
        if (state.currentWorkout?._id === action.payload._id) {
          state.currentWorkout = action.payload;
        }
      });

    // Complete workout
    builder
      .addCase(completeWorkout.fulfilled, (state, action) => {
        const index = state.workouts.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.workouts[index] = action.payload;
        }
        if (state.currentWorkout?._id === action.payload._id) {
          state.currentWorkout = action.payload;
        }
      });

    // Add/Update/Delete exercise
    builder
      .addCase(addExercise.fulfilled, (state, action) => {
        const index = state.workouts.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.workouts[index] = action.payload;
        }
        if (state.currentWorkout?._id === action.payload._id) {
          state.currentWorkout = action.payload;
        }
      })
      .addCase(updateExercise.fulfilled, (state, action) => {
        const index = state.workouts.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.workouts[index] = action.payload;
        }
        if (state.currentWorkout?._id === action.payload._id) {
          state.currentWorkout = action.payload;
        }
      })
      .addCase(deleteExercise.fulfilled, (state, action) => {
        const index = state.workouts.findIndex(w => w._id === action.payload._id);
        if (index !== -1) {
          state.workouts[index] = action.payload;
        }
        if (state.currentWorkout?._id === action.payload._id) {
          state.currentWorkout = action.payload;
        }
      });

    // Fetch workout stats
    builder
      .addCase(fetchWorkoutStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Fetch templates
    builder
      .addCase(fetchWorkoutTemplates.fulfilled, (state, action) => {
        state.templates = action.payload;
      });

    // Create from template
    builder
      .addCase(createWorkoutFromTemplate.fulfilled, (state, action) => {
        state.workouts.unshift(action.payload);
        state.currentWorkout = action.payload;
      });
  },
});

// Export actions
export const { setFilters, clearFilters, clearError, setCurrentWorkout, clearCurrentWorkout } = workoutSlice.actions;

// Export reducer
export default workoutSlice.reducer;
