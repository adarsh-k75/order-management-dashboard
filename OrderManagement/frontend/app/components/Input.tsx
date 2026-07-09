import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 ${
              error
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10'
                : 'border-slate-200 hover:border-slate-300'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-rose-500 font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-xs text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
