'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { initializeAuth, getCurrentUser } from '../../store/slices/authSlice';

interface AuthInitializerProps {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const token = auth?.token;
  const user = auth?.user;
  const isAuthenticated = !!auth?.isAuthenticated;

  useEffect(() => {
    // Initialize auth state from cookies
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // If token exists but no user data, fetch current user
    if (token && !user && isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, user, isAuthenticated]);

  return <>{children}</>;
}
