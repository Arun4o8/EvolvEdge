
import React from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { SparklesIcon } from '../constants';
import { useAuth } from '../context/AuthContext';

export const WelcomeScreen: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const userName = user?.email?.split('@')[0] || 'there';

    const handleContinue = () => {
        navigate('/skill-selection');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-md">
                <div className="inline-block p-6 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-600 dark:text-primary-300 mb-8">
                    <SparklesIcon />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 capitalize">Welcome, {userName}!</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">We're excited to have you. Let's get your account set up and personalize your growth journey.</p>
                
                <button
                    onClick={handleContinue}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
                >
                    Let's Get Started
                </button>
            </div>
        </div>
    );
};
