import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  value,
  description,
  icon,
  accentColor = 'border-slate-100',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-100 p-6 rounded-2xl shadow-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {icon && (
          <div className="p-2 bg-slate-50 rounded-xl text-slate-500">
            {icon}
          </div>
        )}
      </div>
      
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
      
      {/* Dynamic Accent strip */}
      <div className={`mt-4 border-b-2 rounded-full ${accentColor}`} />
    </div>
  );
};
