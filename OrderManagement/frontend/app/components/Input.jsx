import React from 'react';

/**
 * A standard, easy-to-read Input component.
 * It accepts label, error, helperText, custom className, and other standard input props (like placeholder, value, onChange).
 */
export function Input({ label, error, helperText, className = '', ...props }) {
  return (
    <div className="w-full">
      {/* 1. Render the label if it exists */}
      {label && (
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* 2. Render the input field itself */}
      <div className="relative">
        <input
          className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-800 placeholder-slate-400 transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/10 focus:border-teal-600 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10'
              : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          {...props} // Pass through other props like type, value, onChange, placeholder, disabled, required, etc.
        />
      </div>

      {/* 3. Render the error message if an error is present */}
      {error && (
        <p className="mt-1 text-xs text-rose-500 font-medium">
          {error}
        </p>
      )}

      {/* 4. Otherwise, render helper text if provided */}
      {!error && helperText && (
        <p className="mt-1 text-xs text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
