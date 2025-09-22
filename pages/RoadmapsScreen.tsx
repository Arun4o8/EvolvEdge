import React, { useState, useEffect } from 'react';
import { StandaloneHeader } from '../components/StandaloneHeader';
import { ClipboardListIcon, TrashIcon } from '../constants';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Roadmap {
    id: string;
    skill_title: string;
    roadmap_content: string;
    created_at: string;
}

const MOCK_ROADMAPS: Roadmap[] = [
    {
        id: 'mock-roadmap-1',
        skill_title: 'Public Speaking',
        roadmap_content: `**Initial Assessment:** You're starting fresh, which is great! It's a blank canvas.
**Learning Roadmap:**
**Phase 1: Foundations**
- Watch 3 TED talks and analyze their structure.
- Practice speaking in front of a mirror for 5 minutes daily.`,
        created_at: new Date().toISOString(),
    }
];

export const RoadmapsScreen: React.FC = () => {
    const { user } = useAuth();
    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRoadmaps = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('roadmaps')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setRoadmaps(data || []);
            } catch (error: any) {
                if (error.message.includes('Could not find the table')) {
                    console.warn("Backend missing 'roadmaps' table. Falling back to mock data.");
                    setRoadmaps(MOCK_ROADMAPS);
                } else {
                    console.error("Error fetching roadmaps:", error.message);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoadmaps();
    }, [user]);
    
    const handleDeleteRoadmap = async (id: string) => {
        const oldRoadmaps = roadmaps;
        setRoadmaps(prev => prev.filter(r => r.id !== id));
        try {
            const { error } = await supabase.from('roadmaps').delete().eq('id', id);
            if (error) throw error;
        } catch (error: any) {
            if (error.message.includes('Could not find the table')) {
                console.warn("Backend missing 'roadmaps' table. Roadmap only deleted locally.");
            } else {
                console.error("Error deleting roadmap:", error.message);
                setRoadmaps(oldRoadmaps);
            }
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-center text-slate-500 dark:text-slate-400 mt-8">Loading your roadmaps...</p>;
        }

        if (roadmaps.length === 0) {
            return (
                <div className="text-center bg-white dark:bg-slate-800 rounded-lg p-8 mt-4 space-y-4">
                    <div className="inline-block p-4 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-600 dark:text-primary-300">
                        <ClipboardListIcon />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Roadmaps Saved</h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        Your saved AI-generated learning roadmaps will appear here.
                    </p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm">
                        You can generate a new roadmap using the "Assess a New Skill" feature on the Skills screen.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4 mt-4">
                {roadmaps.map(roadmap => (
                    <details key={roadmap.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden group">
                        <summary className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 list-none">
                            <div className="flex-grow">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{roadmap.skill_title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Saved on {new Date(roadmap.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDeleteRoadmap(roadmap.id)
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"
                                    aria-label={`Delete roadmap for ${roadmap.skill_title}`}
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                                <div className="text-slate-400 transform transition-transform duration-200 group-open:rotate-90">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        </summary>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                                {roadmap.roadmap_content.split('**').map((part, index) => 
                                    index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                                )}
                            </div>
                        </div>
                    </details>
                ))}
            </div>
        );
    };

    return (
        <div>
            <StandaloneHeader title="Learning Roadmaps" />
            <main className="p-4">
                {renderContent()}
            </main>
        </div>
    );
};
