import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('fitness_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your internet connection.');
      return Promise.reject(error);
    }

    // Handle specific error status codes
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Unauthorized - remove token and redirect to login
        Cookies.remove('fitness_token');
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        break;
      case 403:
        toast.error('Access forbidden. You don\'t have permission to perform this action.');
        break;
      case 404:
        toast.error('Resource not found.');
        break;
      case 422:
        // Validation errors
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err: any) => toast.error(err.msg || err.message));
        } else {
          toast.error(data.message || 'Validation error.');
        }
        break;
      case 429:
        toast.error('Too many requests. Please try again later.');
        break;
      case 500:
        toast.error('Internal server error. Please try again later.');
        break;
      default:
        toast.error(data.message || 'An unexpected error occurred.');
        break;
    }

    return Promise.reject(error);
  }
);

// API response interfaces
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: any;
}

interface UserResponse {
  success: boolean;
  message?: string;
  user: any;
}

// Authentication API
export const authAPI = {
  // Login user
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  signup: async (userData: {
    name: string;
    email: string;
    password: string;
    dateOfBirth?: string;
    gender?: string;
    height?: { value: number; unit: string };
    activityLevel?: string;
    fitnessGoals?: string[];
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData: any): Promise<UserResponse> => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (passwords: { currentPassword: string; newPassword: string }): Promise<ApiResponse> => {
    const response = await api.put('/auth/change-password', passwords);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  // Get user stats
  getStats: async (): Promise<ApiResponse> => {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Delete user account
  deleteAccount: async (): Promise<ApiResponse> => {
    const response = await api.delete('/users/account');
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<ApiResponse> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Workout API
export const workoutAPI = {
  // Get all workouts
  getWorkouts: async (params = {}): Promise<ApiResponse> => {
    const response = await api.get('/workouts', { params });
    return response.data;
  },

  // Get single workout
  getWorkout: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/workouts/${id}`);
    return response.data;
  },

  // Create workout
  createWorkout: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/workouts', data);
    return response.data;
  },

  // Update workout
  updateWorkout: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/workouts/${id}`, data);
    return response.data;
  },

  // Delete workout
  deleteWorkout: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/workouts/${id}`);
    return response.data;
  },

  // Start workout
  startWorkout: async (id: string): Promise<ApiResponse> => {
    const response = await api.patch(`/workouts/${id}/start`);
    return response.data;
  },

  // Complete workout
  completeWorkout: async (id: string): Promise<ApiResponse> => {
    const response = await api.patch(`/workouts/${id}/complete`);
    return response.data;
  },

  // Add exercise to workout
  addExercise: async (workoutId: string, exercise: any): Promise<ApiResponse> => {
    const response = await api.post(`/workouts/${workoutId}/exercises`, exercise);
    return response.data;
  },

  // Update exercise
  updateExercise: async (workoutId: string, exerciseId: string, exercise: any): Promise<ApiResponse> => {
    const response = await api.put(`/workouts/${workoutId}/exercises/${exerciseId}`, exercise);
    return response.data;
  },

  // Delete exercise
  deleteExercise: async (workoutId: string, exerciseId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/workouts/${workoutId}/exercises/${exerciseId}`);
    return response.data;
  },

  // Get workout stats
  getStats: async (params = {}): Promise<ApiResponse> => {
    const response = await api.get('/workouts/stats/summary', { params });
    return response.data;
  },

  // Get workout templates
  getTemplates: async (): Promise<ApiResponse> => {
    const response = await api.get('/workouts/templates/list');
    return response.data;
  },

  // Create workout from template
  createFromTemplate: async (templateId: string, data = {}): Promise<ApiResponse> => {
    const response = await api.post(`/workouts/templates/${templateId}/create`, data);
    return response.data;
  },
};

// Nutrition API
export const nutritionAPI = {
  // Get all meals
  getMeals: async (params = {}): Promise<ApiResponse> => {
    const response = await api.get('/nutrition/meals', { params });
    return response.data;
  },

  // Get single meal
  getMeal: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/nutrition/meals/${id}`);
    return response.data;
  },

  // Create meal
  createMeal: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/nutrition/meals', data);
    return response.data;
  },

  // Update meal
  updateMeal: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/nutrition/meals/${id}`, data);
    return response.data;
  },

  // Delete meal
  deleteMeal: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/nutrition/meals/${id}`);
    return response.data;
  },

  // Get daily nutrition
  getDailyNutrition: async (date: string): Promise<ApiResponse> => {
    const response = await api.get(`/nutrition/daily/${date}`);
    return response.data;
  },

  // Update daily nutrition goals
  updateDailyGoals: async (date: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/nutrition/daily/${date}/goals`, data);
    return response.data;
  },

  // Add water intake
  addWaterIntake: async (date: string, data: any): Promise<ApiResponse> => {
    const response = await api.post(`/nutrition/daily/${date}/water`, data);
    return response.data;
  },

  // Get nutrition stats
  getStats: async (params = {}): Promise<ApiResponse> => {
    const response = await api.get('/nutrition/stats/summary', { params });
    return response.data;
  },

  // Get nutrition recommendations
  getRecommendations: async (): Promise<ApiResponse> => {
    const response = await api.get('/nutrition/goals/recommendations');
    return response.data;
  },

  // Get meal suggestions
  getSuggestions: async (params = {}): Promise<ApiResponse> => {
    const response = await api.get('/nutrition/suggestions', { params });
    return response.data;
  },
};

// Weight API
export const weightAPI = {
  // Get all weight entries
  getEntries: async (params = {}): Promise<ApiResponse> => {
    const response = await api.get('/weight', { params });
    return response.data;
  },

  // Get single weight entry
  getEntry: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/weight/${id}`);
    return response.data;
  },

  // Create weight entry
  createEntry: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/weight', data);
    return response.data;
  },

  // Update weight entry
  updateEntry: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/weight/${id}`, data);
    return response.data;
  },

  // Delete weight entry
  deleteEntry: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/weight/${id}`);
    return response.data;
  },

  // Get weight trends
  getTrends: async (params = {}): Promise<ApiResponse> => {
    const response = await api.get('/weight/analytics/trends', { params });
    return response.data;
  },

  // Get weight statistics
  getStatistics: async (params = {}): Promise<ApiResponse> => {
    const response = await api.get('/weight/analytics/stats', { params });
    return response.data;
  },

  // Get weight summary
  getSummary: async (): Promise<ApiResponse> => {
    const response = await api.get('/weight/dashboard/summary');
    return response.data;
  },

  // Get latest weight entry
  getLatest: async (): Promise<ApiResponse> => {
    const response = await api.get('/weight/entry/latest');
    return response.data;
  },

  // Compare weight entries
  compareEntries: async (id1: string, id2: string): Promise<ApiResponse> => {
    const response = await api.get(`/weight/compare/${id1}/${id2}`);
    return response.data;
  },

  // Bulk import weight entries
  bulkImport: async (data: { entries: any[] }): Promise<ApiResponse> => {
    const response = await api.post('/weight/bulk-import', data);
    return response.data;
  },
};

// Goals API
export const goalsAPI = {
  // Get all goals
  getGoals: async (params = {}): Promise<ApiResponse> => {
    const response = await api.get('/goals', { params });
    return response.data;
  },

  // Get single goal
  getGoal: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  // Create goal
  createGoal: async (data: any): Promise<ApiResponse> => {
    const response = await api.post('/goals', data);
    return response.data;
  },

  // Update goal
  updateGoal: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },

  // Delete goal
  deleteGoal: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },

  // Update goal progress
  updateProgress: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await api.patch(`/goals/${id}/progress`, data);
    return response.data;
  },

  // Update goal status
  updateStatus: async (id: string, data: { status: string; reason?: string }): Promise<ApiResponse> => {
    const response = await api.patch(`/goals/${id}/status`, data);
    return response.data;
  },

  // Get goal analytics
  getAnalytics: async (): Promise<ApiResponse> => {
    const response = await api.get('/goals/analytics/overview');
    return response.data;
  },

  // Get goal summary
  getSummary: async (): Promise<ApiResponse> => {
    const response = await api.get('/goals/dashboard/summary');
    return response.data;
  },

  // Get goal insights
  getInsights: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/goals/${id}/insights`);
    return response.data;
  },

  // Sync goal with actual data
  syncGoal: async (id: string): Promise<ApiResponse> => {
    const response = await api.post(`/goals/${id}/sync`);
    return response.data;
  },
};

// Unified API Service object
export const apiService = {
  auth: authAPI,
  users: usersAPI,
  health: healthAPI,
  workouts: workoutAPI,
  nutrition: nutritionAPI,
  weight: weightAPI,
  goals: goalsAPI,
};

// Export default api instance
export default api;
