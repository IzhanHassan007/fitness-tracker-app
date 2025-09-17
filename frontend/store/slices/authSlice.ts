import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  height?: {
    value: number;
    unit: 'cm' | 'ft';
  };
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  fitnessGoals?: string[];
  age?: number;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        // Store token in cookies
        Cookies.set('fitness_token', response.token, { expires: 7 });
        toast.success('Login successful!');
        return { user: response.user, token: response.token };
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData: {
    name: string;
    email: string;
    password: string;
    dateOfBirth?: string;
    gender?: string;
    height?: { value: number; unit: string };
    activityLevel?: string;
    fitnessGoals?: string[];
  }, { rejectWithValue }) => {
    try {
      const response = await authAPI.signup(userData);
      
      if (response.success) {
        // Store token in cookies
        Cookies.set('fitness_token', response.token, { expires: 7 });
        toast.success('Account created successfully!');
        return { user: response.user, token: response.token };
      } else {
        return rejectWithValue(response.message || 'Signup failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Signup failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      
      if (response.success) {
        return response.user;
      } else {
        return rejectWithValue(response.message || 'Failed to fetch user');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user';
      return rejectWithValue(message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await authAPI.updateProfile(userData);
      
      if (response.success) {
        toast.success('Profile updated successfully!');
        return response.user;
      } else {
        return rejectWithValue(response.message || 'Update failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Update failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwords: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.changePassword(passwords);
      
      if (response.success) {
        toast.success('Password changed successfully!');
        return response.message;
      } else {
        return rejectWithValue(response.message || 'Password change failed');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Password change failed';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Remove token from cookies
      Cookies.remove('fitness_token');
      toast.success('Logged out successfully');
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    initializeAuth: (state) => {
      const token = Cookies.get('fitness_token');
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Get current user
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        // Clear invalid token
        Cookies.remove('fitness_token');
        state.token = null;
      });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Change password
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { logout, clearError, setToken, initializeAuth } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
