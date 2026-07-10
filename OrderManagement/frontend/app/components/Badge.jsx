import React from 'react';

/**
 * A simple Badge component that color-codes orders based on their status.
 * Status can be: 'Pending', 'Processing', 'Completed', 'Cancelled'.
 */
export function Badge({ status }) {
  // Returns different color styles depending on the order status
  const getColors = () => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'Processing':
        return 'bg-sky-50 text-sky-700 border-sky-200/60';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getColors()} transition-colors duration-150`}
    >
      {status}
    </span>
  );
}
