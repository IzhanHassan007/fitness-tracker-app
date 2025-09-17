import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'white';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const colorClasses = {
  primary: 'text-primary-600',
  secondary: 'text-secondary-600',
  success: 'text-success-600',
  danger: 'text-danger-600',
  white: 'text-white',
};

export default function LoadingSpinner({ 
  size = 'md', 
  className = '',
  color = 'primary'
}: LoadingSpinnerProps) {
  return (
    <div className={clsx('spinner', sizeClasses[size], colorClasses[color], className)} />
  );
}
