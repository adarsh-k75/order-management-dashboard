import React, { useEffect } from 'react';

/**
 * A standard Dialog Modal component.
 * Displays a popup over a blurred backdrop, locks page scroll, and triggers onClose on overlay click.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) {
  // Lock or unlock body scrolling when modal is open or closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Clean up effect on unmount to make sure body scroll is restored
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // If the modal isn't open, don't render anything
  if (!isOpen) return null;

  // Max width mapping based on 'size' prop
  const maxW = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. Backdrop overlay */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose} // Close modal if user clicks outside
      />

      {/* 2. Modal Card Container */}
      <div
        className={`relative bg-white w-full ${maxW[size]} rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden transform transition-all duration-300`}
      >
        {/* Header (Title and Close button) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-slate-600">
          {children}
        </div>
      </div>
    </div>
  );
}
