import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md',
  color = 'primary'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    primary: 'border-primary',
    white: 'border-white',
    gray: 'border-gray-500'
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`
          inline-block animate-spin rounded-full 
          border-2 border-t-transparent 
          ${sizeClasses[size]} 
          ${colorClasses[color as keyof typeof colorClasses] || 'border-primary'}
        `}
      />
    </div>
  );
};

export default LoadingSpinner; 