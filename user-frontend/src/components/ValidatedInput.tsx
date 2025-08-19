import React, { useState, useEffect } from 'react';
import { validateField, containsContactInfo } from '../utils/validation';

interface ValidatedInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'email' | 'tel';
  required?: boolean;
  className?: string;
  maxLength?: number;
  rows?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = false,
  className = '',
  maxLength,
  rows = 3,
  onKeyDown
}) => {
  const [error, setError] = useState<string>('');
  const [isTouched, setIsTouched] = useState(false);

  // 驗證輸入值
  useEffect(() => {
    if (isTouched && value) {
      const validation = validateField(value, label);
      setError(validation.message);
    } else {
      setError('');
    }
  }, [value, label, isTouched]);

  // 處理輸入變化
  const handleChange = (newValue: string) => {
    // 實時檢查是否包含聯絡資料
    if (containsContactInfo(newValue)) {
      setError(`請勿在${label}中包含聯絡資料，違反平台條款將導致帳號被停用`);
    } else {
      setError('');
    }
    
    onChange(newValue);
  };

  // 處理失去焦點
  const handleBlur = () => {
    setIsTouched(true);
    if (value) {
      const validation = validateField(value, label);
      setError(validation.message);
    }
  };

  // 渲染輸入字段
  const renderInput = () => {
    const baseClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? 'border-red-500' : 'border-gray-300'
    }`;

    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          required={required}
          className={`${baseClasses} resize-vertical`}
          maxLength={maxLength}
          rows={rows}
        />
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        required={required}
        className={baseClasses}
        maxLength={maxLength}
      />
    );
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {error && (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}
      
      {maxLength && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};

export default ValidatedInput; 