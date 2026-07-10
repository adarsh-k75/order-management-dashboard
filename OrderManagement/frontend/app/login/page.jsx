'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function LoginPage() {
  // 1. useRouter: Next.js router instance to programmatically redirect users to other pages
  const router = useRouter();

  // 2. useState: Component state hooks to track inputs and errors
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 3. useEffect: Runs on initial page load.
  // If the user has a valid login token stored, they are immediately redirected to the dashboard.
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  // 4. handleSubmit: Triggered when the login form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop page from refreshing on form submit
    setError(null);

    // Form validation check
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Send login request to python backend
      await authService.login({ username: username.trim(), password });
      
      // Redirect user to the main dashboard after successful login
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Incorrect credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Login Container Card */}
      <div className="bg-white border border-slate-100 p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md transform transition-all duration-300">
        
        {/* Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 mb-3 border border-teal-100/50">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to manage your order dashboard</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-xs text-rose-600 font-medium">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Credentials hints for local review */}
        <div className="mb-6 p-4 bg-teal-50/50 border border-teal-100/50 rounded-2xl text-[11px] text-teal-800">
          <span className="font-bold">Local Test Credentials:</span>
          <div className="grid grid-cols-2 mt-1 gap-1">
            <span>Username: <code className="bg-white/80 px-1 py-0.5 rounded text-teal-700">admin</code></span>
            <span>Password: <code className="bg-white/80 px-1 py-0.5 rounded text-teal-700">admin123</code></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Username"
            type="text"
            placeholder="Enter admin username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>
      </div>
    </main>
  );
}
