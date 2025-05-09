import React from 'react';

interface TagCheckboxProps {
  label: string;
  value: string;
  isSelected: boolean;
  onToggle: (value: string) => void;
}

export default function TagCheckbox({ label, value, isSelected, onToggle }: TagCheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors
        ${isSelected 
          ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500' 
          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
        }`}
    >
      {label}
    </button>
  );
} 