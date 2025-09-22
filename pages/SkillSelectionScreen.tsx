

import React, { useState, useContext } from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { SkillContext } from '../context/SkillContext';
import { SparklesIcon } from '../constants';

const SKILL_CATEGORIES = {
  "Tech & Data": ['Coding', 'Data Analysis', 'UX/UI Design', 'Product Mgmt', 'AI/ML'],
  "Communication": ['Public Speaking', 'Writing', 'Negotiation', 'Networking', 'Storytelling'],
  "Creative": ['Graphic Design', 'Video Editing', 'Music Production', 'Photography', 'Creative Writing'],
  "Leadership & Business": ['Leadership', 'Project Mgmt', 'Marketing', 'Sales', 'Business Strategy'],
  "Personal Finance": ['Investing', 'Budgeting', 'Financial Literacy', 'Saving Money'],
  "Wellness": ['Mindfulness', 'Fitness', 'Nutrition', 'Stress Mgmt', 'Sleep Hygiene']
};

export const SkillSelectionScreen: React.FC = () => {
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const skillContext = useContext(SkillContext);
    
    // State for custom skills
    const [customSkill, setCustomSkill] = useState('');
    const [userSkills, setUserSkills] = useState<string[]>([]);

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };
    
    const handleAddCustomSkill = (e: React.FormEvent) => {
        e.preventDefault();
        const formattedSkill = customSkill.trim();
        if (!formattedSkill) return;

        // Check if skill already exists anywhere to prevent duplicates
        const allPredefinedSkills = Object.values(SKILL_CATEGORIES).flat();
        const allCurrentSkills = [...allPredefinedSkills, ...userSkills];
        const existingSkill = allCurrentSkills.find(s => s.toLowerCase() === formattedSkill.toLowerCase());

        if (existingSkill) {
            // If it exists but isn't selected, select it.
            if (!selectedSkills.includes(existingSkill)) {
                 toggleSkill(existingSkill);
            }
        } else {
            // If it's a new skill, add it to the custom list and select it.
            setUserSkills(prev => [...prev, formattedSkill]);
            if (!selectedSkills.includes(formattedSkill)) {
                setSelectedSkills(prev => [...prev, formattedSkill]);
            }
        }
        setCustomSkill('');
    };

    const handleContinue = async () => {
        if (!skillContext || selectedSkills.length === 0) return;
        
        setIsSubmitting(true);
        const initialSkills = selectedSkills.map(subject => ({
            subject,
            level: 10, // Start all skills at a baseline level
        }));

        await skillContext.initializeSkills(initialSkills);
        setIsSubmitting(false);
        navigate('/routine-selection');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-600 dark:text-primary-300 mb-6">
                        <SparklesIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">What do you want to improve?</h1>
                    <p className="text-slate-600 dark:text-slate-400">Select skills to track, or add your own.</p>
                </div>

                <form onSubmit={handleAddCustomSkill} className="flex gap-2 mb-8">
                    <input
                        type="text"
                        value={customSkill}
                        onChange={(e) => setCustomSkill(e.target.value)}
                        placeholder="Enter a custom skill..."
                        className="flex-grow px-3 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={!customSkill.trim()}
                        className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                    >
                        Add
                    </button>
                </form>

                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 mb-8">
                  {userSkills.length > 0 && (
                     <div>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Custom Skills</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {userSkills.map(skill => {
                            const isSelected = selectedSkills.includes(skill);
                            return (
                                <button
                                    key={skill}
                                    onClick={() => toggleSkill(skill)}
                                    className={`p-3 rounded-lg font-semibold text-sm transition-all duration-200 border-2 text-center ${
                                        isSelected
                                            ? 'bg-primary-500 text-white border-primary-500 shadow-lg'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500'
                                    }`}
                                >
                                    {skill}
                                </button>
                            );
                        })}
                      </div>
                    </div>
                  )}
                  {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => (
                    <div key={category}>
                      <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">{category}</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {skills.map(skill => {
                            const isSelected = selectedSkills.includes(skill);
                            return (
                                <button
                                    key={skill}
                                    onClick={() => toggleSkill(skill)}
                                    className={`p-3 rounded-lg font-semibold text-sm transition-all duration-200 border-2 text-center ${
                                        isSelected
                                            ? 'bg-primary-500 text-white border-primary-500 shadow-lg'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500'
                                    }`}
                                >
                                    {skill}
                                </button>
                            );
                        })}
                      </div>
                    </div>
                  ))}
                </div>


                <button
                    onClick={handleContinue}
                    disabled={selectedSkills.length === 0 || isSubmitting}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Saving...' : `Continue with ${selectedSkills.length} skill${selectedSkills.length === 1 ? '' : 's'}`}
                </button>
            </div>
        </div>
    );
};
