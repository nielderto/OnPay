import React from 'react';

interface CircularProgressProps {
  size?: number;
  color?: string;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 40,
  color = 'currentColor',
  className = '',
}) => {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-t-transparent ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: color,
        borderTopColor: 'transparent',
      }}
    />
  );
};

export default CircularProgress;