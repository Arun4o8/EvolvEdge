import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
    const skillContext = useContext(SkillContext);

    const toggleSkill = (skill: string) => {
        setSelectedSkills(prev =>
            prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
        );
    };

    const handleContinue = () => {
        if (!skillContext || selectedSkills.length === 0) return;
        
        const initialSkills = selectedSkills.map(subject => ({
            subject,
            level: 10, // Start all skills at a baseline level
            fullMark: 100
        }));

        skillContext.initializeSkills(initialSkills);
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
                    <p className="text-slate-600 dark:text-slate-400">Select at least one skill to track. This will help us personalize your journey.</p>
                </div>

                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 mb-8">
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
                    disabled={selectedSkills.length === 0}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};