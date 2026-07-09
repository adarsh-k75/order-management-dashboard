'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './services/authService';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Determine target route based on authentication state
    if (authService.isAuthenticated()) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Redirecting...</span>
      </div>
    </div>
  );
}
