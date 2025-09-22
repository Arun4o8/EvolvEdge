

import React, { useState, useContext } from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { RoutineContext } from '../context/RoutineContext';
import { TargetIcon } from '../constants';

const ROUTINE_CATEGORIES = {
  "Mindfulness": ['Morning Meditation', 'Journaling', 'Gratitude Practice', 'Mindful Breathing'],
  "Health & Fitness": ['Exercise', 'Drink 8 Glasses of Water', 'Eat a Healthy Meal', 'Go for a Walk'],
  "Learning & Growth": ['Read for 20 Minutes', 'Practice a Skill', 'Learn a New Word', 'Watch an Educational Video'],
  "Productivity": ['Plan Your Day', 'Tidy Up Workspace', 'Inbox Zero', 'Review Goals']
};

export const RoutineSelectionScreen: React.FC = () => {
    const [selectedRoutines, setSelectedRoutines] = useState<{title: string, category: string}[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const routineContext = useContext(RoutineContext);

    const toggleRoutine = (title: string, category: string) => {
        setSelectedRoutines(prev => {
            const isSelected = prev.some(r => r.title === title);
            if (isSelected) {
                return prev.filter(r => r.title !== title);
            } else {
                return [...prev, { title, category }];
            }
        });
    };

    const handleContinue = async () => {
        if (!routineContext) return;
        
        setIsSubmitting(true);
        if (selectedRoutines.length > 0) {
            await routineContext.initializeRoutines(selectedRoutines);
        }
        setIsSubmitting(false);
        navigate('/home');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-600 dark:text-primary-300 mb-6">
                        <TargetIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Build Your Daily Routine</h1>
                    <p className="text-slate-600 dark:text-slate-400">Select habits you want to build. You can skip this for now.</p>
                </div>

                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 mb-8">
                  {Object.entries(ROUTINE_CATEGORIES).map(([category, routines]) => (
                    <div key={category}>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">{category}</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {routines.map(routine => {
                            const isSelected = selectedRoutines.some(r => r.title === routine);
                            return (
                                <button
                                    key={routine}
                                    onClick={() => toggleRoutine(routine, category)}
                                    className={`p-3 rounded-lg font-semibold text-sm transition-all duration-200 border-2 text-center ${
                                        isSelected
                                            ? 'bg-primary-500 text-white border-primary-500 shadow-lg'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500'
                                    }`}
                                >
                                    {routine}
                                </button>
                            );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                    onClick={handleContinue}
                    disabled={isSubmitting}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-primary-400"
                >
                    {isSubmitting ? 'Saving...' : (selectedRoutines.length > 0 ? 'Finish Setup' : 'Skip & Finish')}
                </button>
            </div>
        </div>
    );
};