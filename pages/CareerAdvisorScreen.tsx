import React, { useState, useContext, useEffect } from 'react';
import { StandaloneHeader } from '../components/StandaloneHeader';
import { SparklesIcon, ChartIcon, TargetIcon } from '../constants';
import { SkillContext } from '../context/SkillContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { getCareerAdvice } from '../services/geminiService';
import { Skill, Goal } from '../types';

export const CareerAdvisorScreen: React.FC = () => {
    const { user } = useAuth();
    const skillContext = useContext(SkillContext);
    const [goals, setGoals] = useState<Pick<Goal, 'title' | 'completed'>[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [advice, setAdvice] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setIsLoadingData(false);
                return;
            }
            setIsLoadingData(true);
            try {
                // Fetch goals
                const { data: goalsData, error: goalsError } = await supabase
                    .from('goals')
                    .select('title, completed')
                    .eq('user_id', user.id);

                if (goalsError) throw goalsError;

                setGoals(goalsData || []);
            } catch (error: any) {
                console.error("Error fetching data for career advisor:", error.message);
            } finally {
                setIsLoadingData(false);
            }
        };
        fetchData();
    }, [user]);

    const handleGetAdvice = async () => {
        if (!skillContext) return;

        setIsGenerating(true);
        setAdvice('');
        try {
            const result = await getCareerAdvice(skillContext.skills, goals);
            setAdvice(result);
        } catch (error) {
            console.error("Failed to get career advice:", error);
            setAdvice("Sorry, an error occurred while generating your career advice.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const skills = skillContext?.skills || [];

    return (
        <div>
            <StandaloneHeader title="AI Career Advisor" />
            <main className="p-4 space-y-6">
                <div className="text-center">
                    <div className="inline-block p-4 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-600 dark:text-primary-300 mb-4">
                        <SparklesIcon />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                        Get personalized career path suggestions and an actionable roadmap based on your current skills and goals.
                    </p>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md space-y-4">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">Your Current Profile</h3>
                     {isLoadingData ? (
                         <p>Loading your profile...</p>
                     ) : (
                         <>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><ChartIcon /> Skills</h4>
                                {skills.length > 0 ? (
                                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                                        {skills.map(s => <li key={s.subject}>{s.subject} ({s.level}%)</li>)}
                                    </ul>
                                ) : <p className="text-sm text-slate-500">No skills added yet.</p>}
                            </div>
                             <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><TargetIcon /> Goals</h4>
                                {goals.length > 0 ? (
                                    <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400">
                                        {goals.map(g => <li key={g.title}>{g.title} ({g.completed ? 'Done' : 'In Progress'})</li>)}
                                    </ul>
                                ) : <p className="text-sm text-slate-500">No goals added yet.</p>}
                            </div>
                         </>
                     )}
                </div>

                {!advice && (
                    <button
                        onClick={handleGetAdvice}
                        disabled={isGenerating || isLoadingData}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md disabled:bg-primary-400"
                    >
                        {isGenerating ? 'Generating Advice...' : 'Get Career Advice'}
                    </button>
                )}

                {isGenerating && <p className="text-center p-4">Your AI advisor is thinking...</p>}

                {advice && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                            {advice.split('**').map((part, index) => 
                                index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                            )}
                        </div>
                         <button
                            onClick={handleGetAdvice}
                            disabled={isGenerating}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        >
                            Regenerate Advice
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};
