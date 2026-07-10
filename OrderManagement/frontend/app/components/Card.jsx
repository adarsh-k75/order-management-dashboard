import React from 'react';

/**
 * A standard, easy-to-read metric Card component.
 * Displays a title, a large value, helper description, an icon, and accepts an onClick callback.
 */
export function Card({
  title,
  value,
  description,
  icon,
  accentColor = 'border-slate-100',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-100 p-6 rounded-2xl shadow-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5' : ''
      }`}
    >
      {/* 1. Header (Title and Icon) */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {icon && (
          <div className="p-2 bg-slate-50 rounded-xl text-slate-500">
            {icon}
          </div>
        )}
      </div>
      
      {/* 2. Main Metric Content */}
      <div>
        <h3 className="text-3xl font-bold text-slate-800 tracking-tight leading-none">
          {value}
        </h3>
        {description && (
          <p className="mt-2 text-xs text-slate-400 font-normal">
            {description}
          </p>
        )}
      </div>
      
      {/* 3. Bottom Accent border line */}
      <div className={`mt-4 border-b-2 rounded-full ${accentColor}`} />
    </div>
  );
}
