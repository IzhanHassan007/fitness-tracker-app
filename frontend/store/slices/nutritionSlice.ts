import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { nutritionAPI } from '../../services/firebaseService';
import toast from 'react-hot-toast';

// Types
export interface FoodItem {
  name: string;
  brand?: string;
  category?: string;
  quantity: {
    value: number;
    unit: string;
  };
  calories: {
    total: number;
    per100g?: number;
  };
  macronutrients: {
    protein: number;
    carbohydrates: number;
    fiber?: number;
    sugar?: number;
    fat: {
      total: number;
      saturated?: number;
      unsaturated?: number;
      trans?: number;
    };
  };
  micronutrients?: {
    sodium?: number;
    cholesterol?: number;
    vitamins?: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
    minerals?: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  notes?: string;
}

export interface Meal {
  _id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout' | 'other';
  name?: string;
  foods: FoodItem[];
  mealTime: string;
  location?: string;
  mood?: {
    before?: number;
    after?: number;
  };
  hungerLevel?: {
    before?: number;
    after?: number;
  };
  satisfactionLevel?: number;
  waterIntake?: {
    value: number;
    unit: string;
  };
  tags?: string[];
  recipe?: {
    ingredients: Array<{
      name: string;
      quantity: string;
    }>;
    instructions: Array<{
      step: number;
      description: string;
    }>;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
  };
  cost?: {
    value: number;
    currency: string;
  };
  photos?: Array<{
    url: string;
    caption?: string;
    uploadedAt: string;
  }>;
  isRecipe?: boolean;
  isPublic?: boolean;
  likes?: string[];
  comments?: Array<{
    user: string;
    text: string;
    createdAt: string;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Virtuals
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
}

export interface NutritionGoals {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
}

export interface DailyNutrition {
  _id?: string;
  date: string;
  meals: Meal[];
  waterIntake: {
    total: number;
    unit: string;
    goal?: number;
  };
  goals?: NutritionGoals;
  supplements?: Array<{
    name: string;
    dosage: {
      value: number;
      unit: string;
    };
    timeOfDay?: string;
    taken: boolean;
    notes?: string;
  }>;
  bodyWeight?: {
    value: number;
    unit: string;
  };
  symptoms?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Virtuals
  goalProgress?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    water: number;
  };
}

export interface NutritionStats {
  totalMeals: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  mealTypes: string[];
  recentMeals: Partial<Meal>[];
  favoriteFoods: Array<{
    _id: string;
    count: number;
    avgCalories: number;
    category: string;
  }>;
  dailyAverages: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    avgWater: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
}

export interface NutritionRecommendations {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  water: number;
  ratios: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  bmr: number;
  tdee: number;
}

export interface NutritionState {
  meals: Meal[];
  currentMeal: Meal | null;
  dailyNutrition: { [date: string]: DailyNutrition };
  currentDate: string;
  stats: NutritionStats | null;
  recommendations: NutritionRecommendations | null;
  suggestions: Meal[];
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
    startDate?: string;
    endDate?: string;
    search?: string;
  };
}

// Initial state
const initialState: NutritionState = {
  meals: [],
  currentMeal: null,
  dailyNutrition: {},
  currentDate: new Date().toISOString().split('T')[0],
  stats: null,
  recommendations: null,
  suggestions: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  pagination: null,
  filters: {},
};

// Async thunks
export const fetchMeals = createAsyncThunk(
  'nutrition/fetchMeals',
  async (params: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const data = await nutritionAPI.getMeals(params);
      return data;
    } catch (error: any) {
      const message = error.message || 'Failed to fetch meals';
      return rejectWithValue(message);
    }
  }
);

export const fetchMeal = createAsyncThunk(
  'nutrition/fetchMeal',
  async (mealId: string, { rejectWithValue }) => {
    try {
      const data = await nutritionAPI.getMeal(mealId);
      return data;
    } catch (error: any) {
      const message = error.message || 'Failed to fetch meal';
      return rejectWithValue(message);
    }
  }
);

export const createMeal = createAsyncThunk(
  'nutrition/createMeal',
  async (mealData: Partial<Meal>, { rejectWithValue }) => {
    try {
      const data = await nutritionAPI.createMeal(mealData);
      toast.success('Meal logged successfully!');
      return data;
    } catch (error: any) {
      const message = error.message || 'Failed to create meal';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateMeal = createAsyncThunk(
  'nutrition/updateMeal',
  async ({ id, data }: { id: string; data: Partial<Meal> }, { rejectWithValue }) => {
    try {
      const updated = await nutritionAPI.updateMeal(id, data);
      toast.success('Meal updated successfully!');
      return updated;
    } catch (error: any) {
      const message = error.message || 'Failed to update meal';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteMeal = createAsyncThunk(
  'nutrition/deleteMeal',
  async (mealId: string, { rejectWithValue }) => {
    try {
      await nutritionAPI.deleteMeal(mealId);
      toast.success('Meal deleted successfully!');
      return mealId;
    } catch (error: any) {
      const message = error.message || 'Failed to delete meal';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchDailyNutrition = createAsyncThunk(
  'nutrition/fetchDailyNutrition',
  async (date: string, { rejectWithValue }) => {
    try {
      const data = await nutritionAPI.getDailyNutrition(date);
      return { date, data };
    } catch (error: any) {
      const message = error.message || 'Failed to fetch daily nutrition';
      return rejectWithValue(message);
    }
  }
);

export const updateDailyNutritionGoals = createAsyncThunk(
  'nutrition/updateDailyNutritionGoals',
  async ({ date, goals, waterIntake, supplements, bodyWeight, symptoms, notes }: {
    date: string;
    goals?: NutritionGoals;
    waterIntake?: DailyNutrition['waterIntake'];
    supplements?: DailyNutrition['supplements'];
    bodyWeight?: DailyNutrition['bodyWeight'];
    symptoms?: string[];
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      const data = await nutritionAPI.updateDailyGoals(date, {
        goals,
        waterIntake,
        supplements,
        bodyWeight,
        symptoms,
        notes
      });
      toast.success('Daily nutrition updated successfully!');
      return { date, data };
    } catch (error: any) {
      const message = error.message || 'Failed to update daily nutrition';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addWaterIntake = createAsyncThunk(
  'nutrition/addWaterIntake',
  async ({ date, amount, unit = 'ml' }: {
    date: string;
    amount: number;
    unit?: string;
  }, { rejectWithValue }) => {
    try {
      const data = await nutritionAPI.addWaterIntake(date, { amount, unit });
      toast.success('Water intake logged!');
      return { date, data };
    } catch (error: any) {
      const message = error.message || 'Failed to add water intake';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchNutritionStats = createAsyncThunk(
  'nutrition/fetchNutritionStats',
  async (params: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const data = await nutritionAPI.getStats(params);
      return data;
    } catch (error: any) {
      const message = error.message || 'Failed to fetch nutrition statistics';
      return rejectWithValue(message);
    }
  }
);

export const fetchNutritionRecommendations = createAsyncThunk(
  'nutrition/fetchNutritionRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const data = await nutritionAPI.getRecommendations();
      return data;
    } catch (error: any) {
      const message = error.message || 'Failed to fetch nutrition recommendations';
      return rejectWithValue(message);
    }
  }
);

export const fetchMealSuggestions = createAsyncThunk(
  'nutrition/fetchMealSuggestions',
  async (params: { mealType?: string; calories?: number } = {}, { rejectWithValue }) => {
    try {
      const data = await nutritionAPI.getSuggestions(params);
      return data;
    } catch (error: any) {
      const message = error.message || 'Failed to fetch meal suggestions';
      return rejectWithValue(message);
    }
  }
);

// Nutrition slice
const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<NutritionState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentMeal: (state, action: PayloadAction<Meal | null>) => {
      state.currentMeal = action.payload;
    },
    clearCurrentMeal: (state) => {
      state.currentMeal = null;
    },
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.currentDate = action.payload;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch meals
    builder
      .addCase(fetchMeals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMeals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.meals = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchMeals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single meal
    builder
      .addCase(fetchMeal.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMeal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMeal = action.payload;
        state.error = null;
      })
      .addCase(fetchMeal.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create meal
    builder
      .addCase(createMeal.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createMeal.fulfilled, (state, action) => {
        state.isCreating = false;
        state.meals.unshift(action.payload);
        state.currentMeal = action.payload;
        state.error = null;
        
        // Update daily nutrition for meal date
        const mealDate = new Date(action.payload.mealTime).toISOString().split('T')[0];
        if (state.dailyNutrition[mealDate]) {
          state.dailyNutrition[mealDate].meals.push(action.payload);
        }
      })
      .addCase(createMeal.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update meal
    builder
      .addCase(updateMeal.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateMeal.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.meals.findIndex(m => m._id === action.payload._id);
        if (index !== -1) {
          state.meals[index] = action.payload;
        }
        if (state.currentMeal?._id === action.payload._id) {
          state.currentMeal = action.payload;
        }
        
        // Update daily nutrition for meal date
        const mealDate = new Date(action.payload.mealTime).toISOString().split('T')[0];
        if (state.dailyNutrition[mealDate]) {
          const mealIndex = state.dailyNutrition[mealDate].meals.findIndex(m => m._id === action.payload._id);
          if (mealIndex !== -1) {
            state.dailyNutrition[mealDate].meals[mealIndex] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateMeal.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete meal
    builder
      .addCase(deleteMeal.fulfilled, (state, action) => {
        const mealToDelete = state.meals.find(m => m._id === action.payload);
        if (mealToDelete) {
          state.meals = state.meals.filter(m => m._id !== action.payload);
          if (state.currentMeal?._id === action.payload) {
            state.currentMeal = null;
          }
          
          // Remove from daily nutrition
          const mealDate = new Date(mealToDelete.mealTime).toISOString().split('T')[0];
          if (state.dailyNutrition[mealDate]) {
            state.dailyNutrition[mealDate].meals = state.dailyNutrition[mealDate].meals.filter(
              m => m._id !== action.payload
            );
          }
        }
      });

    // Fetch daily nutrition
    builder
      .addCase(fetchDailyNutrition.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDailyNutrition.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dailyNutrition[action.payload.date] = action.payload.data;
        state.error = null;
      })
      .addCase(fetchDailyNutrition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update daily nutrition goals
    builder
      .addCase(updateDailyNutritionGoals.fulfilled, (state, action) => {
        state.dailyNutrition[action.payload.date] = action.payload.data;
      });

    // Add water intake
    builder
      .addCase(addWaterIntake.fulfilled, (state, action) => {
        if (state.dailyNutrition[action.payload.date]) {
          state.dailyNutrition[action.payload.date].waterIntake = action.payload.data;
        }
      });

    // Fetch nutrition stats
    builder
      .addCase(fetchNutritionStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });

    // Fetch recommendations
    builder
      .addCase(fetchNutritionRecommendations.fulfilled, (state, action) => {
        state.recommendations = action.payload;
      });

    // Fetch suggestions
    builder
      .addCase(fetchMealSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      });
  },
});

// Export actions
export const {
  setFilters,
  clearFilters,
  clearError,
  setCurrentMeal,
  clearCurrentMeal,
  setCurrentDate,
  clearSuggestions,
} = nutritionSlice.actions;

// Export reducer
export default nutritionSlice.reducer;
