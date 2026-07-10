import React from 'react';

/**
 * A customizable, reusable Button component.
 * Handles primary, secondary, outline, and danger variants, loading state, sizes, and normal button HTML attributes.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) {
  // Base CSS classes shared by all buttons
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';
  
  // Design variations matching Finpay design system
  const variants = {
    primary: 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-md hover:shadow-teal-600/10 focus:ring-teal-500',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 focus:ring-slate-300',
    outline: 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 focus:ring-slate-200',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white hover:shadow-md hover:shadow-rose-600/10 focus:ring-rose-500',
  };

  // Button sizes
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props} // Pass standard HTML button props like onClick, type, etc.
    >
      {/* Show dynamic spinner when isLoading is true */}
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
