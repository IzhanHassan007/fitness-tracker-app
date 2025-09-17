import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // Progress percentage (0-100)
  total?: number; // Total value (optional)
  current?: number; // Current value (optional)
  height?: 'sm' | 'md' | 'lg' | 'xl'; // Height variants
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo' | 'pink' | 'cyan';
  showLabel?: boolean; // Show progress label
  showValues?: boolean; // Show current/total values
  animated?: boolean; // Animated progress bar
  striped?: boolean; // Striped pattern
  gradient?: boolean; // Gradient effect
  glow?: boolean; // Glowing effect
  pulse?: boolean; // Pulsing effect
  label?: string; // Custom label
  unit?: string; // Unit for values (e.g., 'kg', 'lbs', 'reps')
  className?: string; // Additional classes
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  current,
  height = 'md',
  color = 'blue',
  showLabel = true,
  showValues = false,
  animated = true,
  striped = false,
  gradient = true,
  glow = false,
  pulse = false,
  label,
  unit = '',
  className = ''
}) => {
  // Ensure progress is between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Height classes
  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8'
  };

  // Color classes with gradients
  const colorClasses = {
    blue: gradient ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700' : 'bg-blue-600',
    green: gradient ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-green-600' : 'bg-green-600',
    red: gradient ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700' : 'bg-red-600',
    yellow: gradient ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600' : 'bg-yellow-500',
    purple: gradient ? 'bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600' : 'bg-purple-600',
    indigo: gradient ? 'bg-gradient-to-r from-indigo-500 via-blue-600 to-blue-700' : 'bg-indigo-600',
    pink: gradient ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600' : 'bg-pink-600',
    cyan: gradient ? 'bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-500' : 'bg-cyan-600'
  };

  // Background color classes (subtle gradients)
  const backgroundColorClasses = {
    blue: 'bg-gradient-to-r from-blue-50 to-blue-100',
    green: 'bg-gradient-to-r from-emerald-50 to-green-100',
    red: 'bg-gradient-to-r from-red-50 to-red-100',
    yellow: 'bg-gradient-to-r from-yellow-50 to-yellow-100',
    purple: 'bg-gradient-to-r from-purple-50 to-indigo-100',
    indigo: 'bg-gradient-to-r from-indigo-50 to-blue-100',
    pink: 'bg-gradient-to-r from-pink-50 to-rose-100',
    cyan: 'bg-gradient-to-r from-cyan-50 to-blue-100'
  };

  // Text color classes
  const textColorClasses = {
    blue: 'text-blue-700',
    green: 'text-emerald-700',
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    purple: 'text-purple-700',
    indigo: 'text-indigo-700',
    pink: 'text-pink-700',
    cyan: 'text-cyan-700'
  };

  // Glow effects
  const glowClasses = {
    blue: 'shadow-glow-primary',
    green: 'shadow-glow-success',
    red: 'shadow-glow-danger',
    yellow: 'shadow-glow-warning',
    purple: 'shadow-lg shadow-purple-500/30',
    indigo: 'shadow-lg shadow-indigo-500/30',
    pink: 'shadow-lg shadow-pink-500/30',
    cyan: 'shadow-lg shadow-cyan-500/30'
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header with label and values */}
      {(showLabel || showValues) && (
        <div className="flex justify-between items-center mb-3">
          {showLabel && (
            <div className={`text-sm font-semibold ${textColorClasses[color]}`}>
              {label || `${clampedProgress.toFixed(0)}% Complete`}
            </div>
          )}
          {showValues && current !== undefined && total !== undefined && (
            <div className="text-sm font-medium text-gray-600">
              {current.toFixed(1)} / {total.toFixed(1)} {unit}
            </div>
          )}
          {!showValues && (
            <div className={`text-sm font-bold ${
              clampedProgress >= 80 ? 'text-green-600' :
              clampedProgress >= 60 ? 'text-blue-600' :
              clampedProgress >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {clampedProgress.toFixed(0)}%
            </div>
          )}
        </div>
      )}

      {/* Progress bar container */}
      <div className={`relative w-full ${backgroundColorClasses[color]} rounded-full ${heightClasses[height]} overflow-hidden shadow-inner ${pulse ? 'animate-pulse-glow' : ''}`}>
        {/* Progress fill */}
        <motion.div
          className={`
            ${colorClasses[color]} 
            ${heightClasses[height]} 
            rounded-full 
            relative
            overflow-hidden
            ${animated ? 'transition-all duration-700 ease-out' : ''}
            ${striped ? 'animate-shimmer' : ''}
            ${glow ? glowClasses[color] : ''}
          `}
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: animated ? 1.2 : 0, ease: "easeOut" }}
        >
          {/* Shine effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
          
          {/* Pulse overlay */}
          {pulse && (
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
          )}
          
          {/* Striped pattern */}
          {striped && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 bg-[length:1rem_1rem] animate-[slide_1s_linear_infinite]" />
          )}
        </motion.div>

        {/* Progress indicator dot */}
        {clampedProgress > 0 && height !== 'sm' && (
          <motion.div 
            className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border-2 border-current z-10"
            style={{ color: colorClasses[color].includes('gradient') ? '#3b82f6' : colorClasses[color] }}
            initial={{ left: 0 }}
            animate={{ left: `calc(${clampedProgress}% - 6px)` }}
            transition={{ duration: animated ? 1.2 : 0, ease: "easeOut" }}
          />
        )}
      </div>

      {/* Progress percentage text (if not showing label) */}
      {!showLabel && height !== 'sm' && (
        <div className="text-center mt-2">
          <span className={`text-xs font-semibold ${textColorClasses[color]}`}>
            {clampedProgress.toFixed(0)}%
          </span>
        </div>
      )}

      {/* Success indicator */}
      {clampedProgress === 100 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          className="flex items-center justify-center mt-2"
        >
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            ✨ Complete!
          </span>
        </motion.div>
      )}
    </div>
  );
};

// Enhanced progress bar with multiple segments
interface MultiProgressBarProps {
  segments: Array<{
    value: number;
    color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo' | 'pink' | 'cyan';
    label: string;
  }>;
  total: number;
  height?: 'sm' | 'md' | 'lg' | 'xl';
  showLabels?: boolean;
  gradient?: boolean;
  glow?: boolean;
  className?: string;
}

export const MultiProgressBar: React.FC<MultiProgressBarProps> = ({
  segments,
  total,
  height = 'md',
  showLabels = true,
  gradient = true,
  glow = false,
  className = ''
}) => {
  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
    xl: 'h-8'
  };

  const colorClasses = {
    blue: gradient ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-blue-500',
    green: gradient ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-green-500',
    red: gradient ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-red-500',
    yellow: gradient ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-yellow-500',
    purple: gradient ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-purple-500',
    indigo: gradient ? 'bg-gradient-to-r from-indigo-500 to-blue-500' : 'bg-indigo-500',
    pink: gradient ? 'bg-gradient-to-r from-pink-500 to-rose-500' : 'bg-pink-500',
    cyan: gradient ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-cyan-500'
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Labels */}
      {showLabels && (
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${colorClasses[segment.color]} mr-2 shadow-sm`}></div>
              <span className="text-gray-700 font-medium">
                {segment.label}: <span className="font-semibold">{segment.value}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Multi-segment progress bar */}
      <div className={`w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full ${heightClasses[height]} overflow-hidden shadow-inner ${glow ? 'shadow-card' : ''}`}>
        <div className="flex h-full">
          {segments.map((segment, index) => {
            const percentage = (segment.value / total) * 100;
            return (
              <motion.div
                key={index}
                className={`${colorClasses[segment.color]} transition-all duration-700 ease-out relative overflow-hidden`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                title={`${segment.label}: ${segment.value} (${percentage.toFixed(1)}%)`}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Total progress */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-600">
          Total Progress
        </span>
        <span className="text-xs font-semibold text-gray-800">
          {segments.reduce((sum, seg) => sum + seg.value, 0)} / {total}
        </span>
      </div>
    </div>
  );
};

// Circular progress bar with beautiful styling
interface CircularProgressBarProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo' | 'pink' | 'cyan';
  showPercentage?: boolean;
  label?: string;
  gradient?: boolean;
  glow?: boolean;
  pulse?: boolean;
  animated?: boolean;
  className?: string;
}

export const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  progress,
  size = 100,
  strokeWidth = 8,
  color = 'blue',
  showPercentage = true,
  label,
  gradient = true,
  glow = false,
  pulse = false,
  animated = true,
  className = ''
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  const gradientIds = {
    blue: 'blue-gradient',
    green: 'green-gradient',
    red: 'red-gradient',
    yellow: 'yellow-gradient',
    purple: 'purple-gradient',
    indigo: 'indigo-gradient',
    pink: 'pink-gradient',
    cyan: 'cyan-gradient'
  };
  
  const gradientColors = {
    blue: { from: '#3b82f6', to: '#1d4ed8' },
    green: { from: '#10b981', to: '#047857' },
    red: { from: '#ef4444', to: '#dc2626' },
    yellow: { from: '#f59e0b', to: '#d97706' },
    purple: { from: '#8b5cf6', to: '#6366f1' },
    indigo: { from: '#6366f1', to: '#4f46e5' },
    pink: { from: '#ec4899', to: '#db2777' },
    cyan: { from: '#06b6d4', to: '#0891b2' }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className} ${glow ? 'filter drop-shadow-lg' : ''} ${pulse ? 'animate-pulse-glow' : ''}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 filter drop-shadow-sm"
      >
        <defs>
          {gradient && (
            <linearGradient id={gradientIds[color]} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={gradientColors[color].from} />
              <stop offset="100%" stopColor={gradientColors[color].to} />
            </linearGradient>
          )}
          
          {/* Glow filter */}
          {glow && (
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          )}
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth - 1}
          className="opacity-30"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientIds[color]})` : gradientColors[color].from}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: strokeDashoffset }}
          transition={{ duration: animated ? 1.5 : 0, ease: "easeOut" }}
          filter={glow ? "url(#glow)" : "none"}
          className={pulse ? 'animate-pulse' : ''}
        />

        {/* Animated dots on the progress line */}
        {clampedProgress > 0 && animated && (
          <motion.circle
            r="3"
            fill={gradientColors[color].to}
            initial={{
              cx: size / 2,
              cy: strokeWidth / 2
            }}
            animate={{
              cx: size / 2 + radius * Math.cos((clampedProgress / 100) * 2 * Math.PI - Math.PI / 2),
              cy: size / 2 + radius * Math.sin((clampedProgress / 100) * 2 * Math.PI - Math.PI / 2)
            }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="drop-shadow-sm"
          />
        )}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <motion.span 
            className="text-2xl font-bold bg-gradient-to-br from-gray-700 to-gray-900 bg-clip-text text-transparent"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
          >
            {Math.round(clampedProgress)}%
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-gray-600 text-center px-2 mt-1 font-medium">
            {label}
          </span>
        )}
        
        {/* Success indicator */}
        {clampedProgress === 100 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1, type: "spring", stiffness: 300 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md"
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
