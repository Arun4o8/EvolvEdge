

import React from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM;

export const ForgotPasswordScreen: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">Forgot Password?</h1>
                <p className="text-center text-slate-600 dark:text-slate-400 mb-8">Enter your email and we'll send you a link to reset your password.</p>
                
                <form className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input type="email" placeholder="you@example.com" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        Send Reset Link
                    </button>
                </form>
                
                <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    Remembered your password? <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">Log In</Link>
                </p>
            </div>
        </div>
    );
};