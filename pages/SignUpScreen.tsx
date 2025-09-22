import React, { useState } from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { Link, useNavigate } = ReactRouterDOM;
import { useAuth } from '../context/AuthContext';

export const SignUpScreen: React.FC = () => {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { error } = await signUp({ email, password });
            if (error) {
                setError(error.message);
            } else {
                setEmailSent(true);
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                <div className="w-full max-w-sm">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Check your inbox!</h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        We've sent a confirmation link to <strong className="text-slate-800 dark:text-slate-200">{email}</strong>. Please click the link to activate your account.
                    </p>
                    <Link to="/login" className="w-full inline-block bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                        Back to Log In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <h1 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-2">Create Account</h1>
                <p className="text-center text-slate-600 dark:text-slate-400 mb-8">Start your evolution today.</p>

                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</p>}
                
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input 
                            type="email" 
                            placeholder="you@example.com" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" 
                        />
                    </div>
                    <div className="flex items-start">
                        <input id="terms" type="checkbox" className="h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 mt-1" required/>
                        <label htmlFor="terms" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                            I agree to the <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-400">Terms of Service</a> and <a href="#" className="font-medium text-primary-600 hover:underline dark:text-primary-400">Privacy Policy</a>.
                        </label>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-primary-400">
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                
                <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-400">Log In</Link>
                </p>
            </div>
        </div>
    );
};