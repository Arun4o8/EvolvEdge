

import React from 'react';
import { useState } from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { SparklesIcon, TargetIcon, ChartIcon } from '../constants';

const onboardingSlides = [
    {
        icon: <TargetIcon />,
        title: "Set & Crush Your Goals",
        description: "Define your personal and professional goals, and track your progress with intuitive tools."
    },
    {
        icon: <ChartIcon />,
        title: "Visualize Your Growth",
        description: "See your skills evolve over time with beautiful, insightful graphs and charts."
    },
    {
        icon: <SparklesIcon />,
        title: "Get AI-Powered Insights",
        description: "Receive personalized guidance and resources from your AI assistant to accelerate your growth."
    }
];

export const OnboardingScreen: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    const handleNext = () => {
        if (currentSlide < onboardingSlides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigate('/signup');
        }
    };

    return (
        <div className="flex flex-col h-screen p-8 text-center text-slate-800 dark:text-slate-200">
            <div className="flex-grow flex flex-col items-center justify-center">
                <div className="p-6 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-600 dark:text-primary-300 mb-8">
                    {onboardingSlides[currentSlide].icon}
                </div>
                <h2 className="text-2xl font-bold mb-4">{onboardingSlides[currentSlide].title}</h2>
                <p className="text-slate-600 dark:text-slate-400">{onboardingSlides[currentSlide].description}</p>
            </div>
            <div className="flex items-center justify-center space-x-2 mb-8">
                {onboardingSlides.map((_, index) => (
                    <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                            index === currentSlide ? 'bg-primary-500 w-6' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                    />
                ))}
            </div>
            <button onClick={handleNext} className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                {currentSlide < onboardingSlides.length - 1 ? 'Next' : 'Get Started'}
            </button>
            <button onClick={() => navigate('/login')} className="mt-4 text-slate-500 dark:text-slate-400 font-medium">
                Already have an account?
            </button>
        </div>
    );
};