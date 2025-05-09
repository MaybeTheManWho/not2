import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  type = 'text',
  className = '',
  error,
  icon,
  ...props 
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-text-primary mb-2 font-medium">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={`
            block w-full px-4 py-2 bg-background-dark border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-primary 
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-accent' : 'border-background-light'}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1 text-accent text-sm">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;