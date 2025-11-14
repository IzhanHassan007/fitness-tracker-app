import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/firebaseService';

// Initial state
type WeightState = {
  entries: any[];
  currentEntry: any | null;
  pagination: { page: number; limit: number; total: number; pages: number };
  trends: any | null;
  statistics: any | null;
  summary: any | null;
  comparison: any | null;
  filters: { startDate: string | null; endDate: string | null; sortBy: string; sortOrder: 'asc' | 'desc' };
  loading: { entries: boolean; create: boolean; update: boolean; delete: boolean; trends: boolean; stats: boolean; summary: boolean; bulkImport: boolean };
  error: { entries: string | null | undefined; create: string | null | undefined; update: string | null | undefined; delete: string | null | undefined; trends: string | null | undefined; stats: string | null | undefined; summary: string | null | undefined; bulkImport: string | null | undefined };
};

const initialState: WeightState = {
  entries: [],
  currentEntry: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  },
  trends: null,
  statistics: null,
  summary: null,
  comparison: null,
  filters: {
    startDate: null,
    endDate: null,
    sortBy: 'measuredAt',
    sortOrder: 'desc'
  },
  loading: {
    entries: false,
    create: false,
    update: false,
    delete: false,
    trends: false,
    stats: false,
    summary: false,
    bulkImport: false
  },
  error: {
    entries: null,
    create: null,
    update: null,
    delete: null,
    trends: null,
    stats: null,
    summary: null,
    bulkImport: null
  }
};

// Async thunks for API calls

// Get all weight entries
export const fetchWeightEntries = createAsyncThunk<any, Record<string, any> | undefined, { rejectValue: string }>(
  'weight/fetchEntries',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.weight.getEntries(params);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch weight entries');
    }
  }
);

// Get single weight entry
export const fetchWeightEntry = createAsyncThunk<any, string, { rejectValue: string }>(
  'weight/fetchEntry',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.weight.getEntry(id);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch weight entry');
    }
  }
);

// Create weight entry
export const createWeightEntry = createAsyncThunk<any, any, { rejectValue: string }>(
  'weight/createEntry',
  async (entryData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.weight.createEntry(entryData);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to create weight entry');
    }
  }
);

// Update weight entry
export const updateWeightEntry = createAsyncThunk<any, { id: string; data: any }, { rejectValue: string }>(
  'weight/updateEntry',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.weight.updateEntry(id, data);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to update weight entry');
    }
  }
);

// Delete weight entry
export const deleteWeightEntry = createAsyncThunk<string, string, { rejectValue: string }>(
  'weight/deleteEntry',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.weight.deleteEntry(id);
      return id;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to delete weight entry');
    }
  }
);

// Get weight trends
export const fetchWeightTrends = createAsyncThunk<any, Record<string, any> | undefined, { rejectValue: string }>(
  'weight/fetchTrends',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.weight.getTrends(params);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch weight trends');
    }
  }
);

// Get weight statistics
export const fetchWeightStatistics = createAsyncThunk<any, Record<string, any> | undefined, { rejectValue: string }>(
  'weight/fetchStatistics',
  async (params: Record<string, any> = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.weight.getStatistics(params);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch weight statistics');
    }
  }
);

// Get weight summary
export const fetchWeightSummary = createAsyncThunk<any, void, { rejectValue: string }>(
  'weight/fetchSummary',
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await apiService.weight.getSummary();
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch weight summary');
    }
  }
);

// Get latest weight entry
export const fetchLatestWeightEntry = createAsyncThunk<any, void, { rejectValue: string }>(
  'weight/fetchLatest',
  async (_: void, { rejectWithValue }) => {
    try {
      const response = await apiService.weight.getLatest();
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to fetch latest weight entry');
    }
  }
);

// Compare weight entries
export const compareWeightEntries = createAsyncThunk<any, { id1: string; id2: string }, { rejectValue: string }>(
  'weight/compareEntries',
  async ({ id1, id2 }: { id1: string; id2: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.weight.compareEntries(id1, id2);
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to compare weight entries');
    }
  }
);

// Bulk import weight entries
export const bulkImportWeightEntries = createAsyncThunk<any, any[], { rejectValue: string }>(
  'weight/bulkImport',
  async (entries: any[], { rejectWithValue }) => {
    try {
      const response = await apiService.weight.bulkImport({ entries });
      return response;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || 'Failed to import weight entries');
    }
  }
);

// Weight slice
const weightSlice = createSlice({
  name: 'weight',
  initialState,
  reducers: {
    // Clear errors
    clearWeightErrors: (state) => {
      state.error = { ...initialState.error };
    },
    
    // Clear current entry
    clearCurrentEntry: (state) => {
      state.currentEntry = null;
    },
    
    // Update filters
    updateFilters: (state, action: PayloadAction<Partial<WeightState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // Reset filters
    resetFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
    
    // Clear trends
    clearTrends: (state) => {
      state.trends = null;
    },
    
    // Clear statistics
    clearStatistics: (state) => {
      state.statistics = null;
    },
    
    // Clear comparison
    clearComparison: (state) => {
      state.comparison = null;
    },
    
    // Set pagination
    setPagination: (state, action: PayloadAction<Partial<WeightState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch weight entries
      .addCase(fetchWeightEntries.pending, (state) => {
        state.loading.entries = true;
        state.error.entries = null;
      })
      .addCase(fetchWeightEntries.fulfilled, (state, action) => {
        state.loading.entries = false;
        state.entries = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchWeightEntries.rejected, (state, action) => {
        state.loading.entries = false;
        state.error.entries = action.payload;
      })
      
      // Fetch single weight entry
      .addCase(fetchWeightEntry.pending, (state) => {
        state.loading.entries = true;
      })
      .addCase(fetchWeightEntry.fulfilled, (state, action) => {
        state.loading.entries = false;
        state.currentEntry = action.payload;
      })
      .addCase(fetchWeightEntry.rejected, (state, action) => {
        state.loading.entries = false;
        state.error.entries = action.payload;
      })
      
      // Create weight entry
      .addCase(createWeightEntry.pending, (state) => {
        state.loading.create = true;
        state.error.create = null;
      })
      .addCase(createWeightEntry.fulfilled, (state, action) => {
        state.loading.create = false;
        state.entries.unshift(action.payload);
        state.currentEntry = action.payload;
        // Update pagination total
        state.pagination.total += 1;
      })
      .addCase(createWeightEntry.rejected, (state, action) => {
        state.loading.create = false;
        state.error.create = action.payload;
      })
      
      // Update weight entry
      .addCase(updateWeightEntry.pending, (state) => {
        state.loading.update = true;
        state.error.update = null;
      })
      .addCase(updateWeightEntry.fulfilled, (state, action) => {
        state.loading.update = false;
        const index = state.entries.findIndex(entry => entry._id === action.payload._id);
        if (index !== -1) {
          state.entries[index] = action.payload;
        }
        if (state.currentEntry && state.currentEntry._id === action.payload._id) {
          state.currentEntry = action.payload;
        }
      })
      .addCase(updateWeightEntry.rejected, (state, action) => {
        state.loading.update = false;
        state.error.update = action.payload;
      })
      
      // Delete weight entry
      .addCase(deleteWeightEntry.pending, (state) => {
        state.loading.delete = true;
        state.error.delete = null;
      })
      .addCase(deleteWeightEntry.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.entries = state.entries.filter(entry => entry._id !== action.payload);
        if (state.currentEntry && state.currentEntry._id === action.payload) {
          state.currentEntry = null;
        }
        // Update pagination total
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteWeightEntry.rejected, (state, action) => {
        state.loading.delete = false;
        state.error.delete = action.payload;
      })
      
      // Fetch weight trends
      .addCase(fetchWeightTrends.pending, (state) => {
        state.loading.trends = true;
        state.error.trends = null;
      })
      .addCase(fetchWeightTrends.fulfilled, (state, action) => {
        state.loading.trends = false;
        state.trends = action.payload;
      })
      .addCase(fetchWeightTrends.rejected, (state, action) => {
        state.loading.trends = false;
        state.error.trends = action.payload;
      })
      
      // Fetch weight statistics
      .addCase(fetchWeightStatistics.pending, (state) => {
        state.loading.stats = true;
        state.error.stats = null;
      })
      .addCase(fetchWeightStatistics.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.statistics = action.payload;
      })
      .addCase(fetchWeightStatistics.rejected, (state, action) => {
        state.loading.stats = false;
        state.error.stats = action.payload;
      })
      
      // Fetch weight summary
      .addCase(fetchWeightSummary.pending, (state) => {
        state.loading.summary = true;
        state.error.summary = null;
      })
      .addCase(fetchWeightSummary.fulfilled, (state, action) => {
        state.loading.summary = false;
        state.summary = action.payload;
      })
      .addCase(fetchWeightSummary.rejected, (state, action) => {
        state.loading.summary = false;
        state.error.summary = action.payload;
      })
      
      // Fetch latest weight entry
      .addCase(fetchLatestWeightEntry.fulfilled, (state, action) => {
        state.currentEntry = action.payload.entry;
        state.comparison = action.payload.comparison;
      })
      
      // Compare weight entries
      .addCase(compareWeightEntries.fulfilled, (state, action) => {
        state.comparison = action.payload;
      })
      
      // Bulk import weight entries
      .addCase(bulkImportWeightEntries.pending, (state) => {
        state.loading.bulkImport = true;
        state.error.bulkImport = null;
      })
      .addCase(bulkImportWeightEntries.fulfilled, (state, action) => {
        state.loading.bulkImport = false;
        // Add imported entries to the beginning of the array
        state.entries = [...action.payload.entries, ...state.entries];
        state.pagination.total += action.payload.imported;
      })
      .addCase(bulkImportWeightEntries.rejected, (state, action) => {
        state.loading.bulkImport = false;
        state.error.bulkImport = action.payload;
      });
  }
});

// Export actions
export const {
  clearWeightErrors,
  clearCurrentEntry,
  updateFilters,
  resetFilters,
  clearTrends,
  clearStatistics,
  clearComparison,
  setPagination
} = weightSlice.actions;

// Selectors
export const selectWeightEntries = (state) => state.weight.entries;
export const selectCurrentWeightEntry = (state) => state.weight.currentEntry;
export const selectWeightPagination = (state) => state.weight.pagination;
export const selectWeightTrends = (state) => state.weight.trends;
export const selectWeightStatistics = (state) => state.weight.statistics;
export const selectWeightSummary = (state) => state.weight.summary;
export const selectWeightComparison = (state) => state.weight.comparison;
export const selectWeightFilters = (state) => state.weight.filters;
export const selectWeightLoading = (state) => state.weight.loading;
export const selectWeightErrors = (state) => state.weight.error;

// Derived selectors
export const selectLatestWeightEntry = (state) => {
  const entries = state.weight.entries;
  return entries.length > 0 ? entries[0] : null;
};

export const selectWeightProgress = (state) => {
  const entries = state.weight.entries;
  if (entries.length < 2) return null;
  
  const latest = entries[0];
  const previous = entries[1];
  
  return {
    current: latest.weight.value,
    previous: previous.weight.value,
    change: latest.weight.value - previous.weight.value,
    changePercent: ((latest.weight.value - previous.weight.value) / previous.weight.value) * 100
  };
};

export const selectIsWeightLoading = (state) => {
  const loading = state.weight.loading;
  return Object.values(loading).some(isLoading => isLoading);
};

export const selectHasWeightErrors = (state) => {
  const errors = state.weight.error;
  return Object.values(errors).some(error => error !== null);
};

// Export reducer
export default weightSlice.reducer;
