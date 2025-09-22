import React, { useState, useEffect } from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { Link, useNavigate } = ReactRouterDOM;
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
    const { user, signInWithPassword, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Navigate away if the user is already logged in (e.g., after Google Sign-In mock)
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { error } = await signInWithPassword({ email, password });
            if (error) {
                setError(error.message);
            } else {
                navigate('/home');
            }
        } catch (err: any) {
             setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            const { error } = await signInWithGoogle();
            if (error) {
                setError(error.message);
                setLoading(false);
            }
            // In the original app, Supabase handles the redirect.
            // In our demo, the useEffect will catch the user change and navigate.
        } catch (err: any) {
             setError(err.message || 'An unexpected error occurred.');
             setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">Welcome Back!</h1>
                <p className="text-center text-slate-600 dark:text-slate-400 mb-8">Log in to continue your journey.</p>
                
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input 
                            type="email" 
                            placeholder="you@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" 
                        />
                    </div>
                    <div className="text-right">
                        <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline dark:text-primary-400">Forgot Password?</Link>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-primary-400">
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>
                </form>

                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                    <span className="mx-4 text-slate-500 dark:text-slate-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                </div>

                <div className="space-y-3">
                     <button 
                        onClick={handleGoogleLogin} 
                        disabled={loading} 
                        className="w-full flex items-center justify-center py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
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