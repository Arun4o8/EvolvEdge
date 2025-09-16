
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const SignUpScreen: React.FC = () => {
    const navigate = useNavigate();

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would handle the sign up logic
        navigate('/home');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">Create Account</h1>
                <p className="text-center text-slate-600 dark:text-slate-400 mb-8">Start your evolution today.</p>
                
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                        <input type="text" placeholder="John Doe" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input type="email" placeholder="you@example.com" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <input type="password" placeholder="••••••••" className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <div className="flex items-start">
                        <input id="terms" type="checkbox" className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 mt-1" />
                        <label htmlFor="terms" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                            I agree to the <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-400">Terms of Service</a> and <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-400">Privacy Policy</a>.
                        </label>
                    </div>
                    <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        Sign Up
                    </button>
                </form>
                
                <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">Log In</Link>
                </p>
            </div>
        </div>
    );
};
