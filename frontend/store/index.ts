import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import workoutSlice from './slices/workoutSlice';
import nutritionSlice from './slices/nutritionSlice';
import weightSlice from './slices/weightSlice';
import goalsSlice from './slices/goalsSlice';

// Persist configuration
const persistConfig = {
  key: 'fitness-tracker-root',
  storage,
  whitelist: ['auth'], // Only persist auth state
  version: 1,
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  workouts: workoutSlice,
  nutrition: nutritionSlice,
  weight: weightSlice,
  goals: goalsSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
