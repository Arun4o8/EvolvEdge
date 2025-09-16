
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const LoginScreen: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would handle the login logic
        navigate('/home');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">Welcome Back!</h1>
                <p className="text-center text-slate-600 dark:text-slate-400 mb-8">Log in to continue your journey.</p>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input type="email" placeholder="you@example.com" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <input type="password" placeholder="••••••••" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div className="text-right">
                        <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline dark:text-primary-400">Forgot Password?</Link>
                    </div>
                    <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        Log In
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                    <span className="mx-4 text-slate-500 dark:text-slate-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                </div>

                <div className="space-y-3">
                     <button className="w-full flex items-center justify-center py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        Continue with Google
                    </button>
                    <button className="w-full flex items-center justify-center py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        Continue with Apple
                    </button>
                </div>
                
                <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    Don't have an account? <Link to="/signup" className="font-medium text-primary-600 hover:underline dark:text-primary-400">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};
