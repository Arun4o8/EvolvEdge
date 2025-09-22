

import React from 'react';
import { useEffect } from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { SparklesIcon } from '../constants';

export const SplashScreen: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/onboarding');
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary-600 text-white">
            <div className="animate-pulse">
                <SparklesIcon />
            </div>
            <h1 className="text-4xl font-bold mt-4 animate-fade-in-up">EvolvEdge AI</h1>
            <p className="mt-2 text-primary-200 animate-fade-in-up animation-delay-300">Evolving Personal Growth with AI</p>
            <style>{`
                .animation-delay-300 { animation-delay: 300ms; }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
            `}</style>
        </div>
    );
};