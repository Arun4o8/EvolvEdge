import React, { useState, useContext } from 'react';
import { StandaloneHeader } from '../components/StandaloneHeader';
import { SkillContext } from '../context/SkillContext';
import { TrashIcon } from '../constants';
import { Skill } from '../types';

export const ManageSkillsScreen: React.FC = () => {
    const skillContext = useContext(SkillContext);
    const [newSkill, setNewSkill] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    if (!skillContext) {
        return (
            <div>
                <StandaloneHeader title="Add & Manage Skills" />
                <p className="p-4">Skill context not available.</p>
            </div>
        )
    }

    const { skills, isLoading, addSkill, deleteSkill } = skillContext;

    const handleAddSkill = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedSkill = newSkill.trim();
        if (!trimmedSkill) return;

        setIsAdding(true);
        await addSkill({ subject: trimmedSkill });
        setNewSkill('');
        setIsAdding(false);
    };

    const handleDeleteSkill = async (subject: string) => {
        await deleteSkill(subject);
    };

    return (
        <div>
            <StandaloneHeader title="Add & Manage Skills" />
            <main className="p-4 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Add a New Skill</h2>
                    <form onSubmit={handleAddSkill} className="flex gap-2">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="e.g., Public Speaking"
                            className="flex-grow px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            aria-label="New skill name"
                        />
                        <button
                            type="submit"
                            disabled={isAdding || !newSkill.trim()}
                            className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:bg-primary-300"
                        >
                            {isAdding ? 'Adding...' : 'Add'}
                        </button>
                    </form>
                </div>

                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3">Your Current Skills</h2>
                    {isLoading ? (
                        <p>Loading skills...</p>
                    ) : skills.length > 0 ? (
                        <div className="space-y-2">
                            {skills.map((skill: Skill) => (
                                <div key={skill.subject} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{skill.subject}</span>
                                    <button
                                        onClick={() => handleDeleteSkill(skill.subject)}
                                        className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                        aria-label={`Delete ${skill.subject}`}
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-4">You haven't added any skills yet.</p>
                    )}
                </div>
            </main>
        </div>
    );
};
