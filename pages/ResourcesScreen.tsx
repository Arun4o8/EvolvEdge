import React from 'react';
import { useState, useEffect } from 'react';
import { LearningResource } from '../types';
import { getAIRecommendations } from '../services/geminiService';
import { StandaloneHeader } from '../components/StandaloneHeader';

const ResourceCard: React.FC<{ resource: LearningResource }> = ({ resource }) => {
    const iconMap = {
        article: '📄',
        video: '🎬',
        exercise: '🏋️'
    }
    return (
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <div className="flex items-start gap-4">
                <div className="text-2xl">{iconMap[resource.type]}</div>
                <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200">{resource.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{resource.source}</p>
                </div>
            </div>
        </a>
    )
};


export const ResourcesScreen: React.FC = () => {
    const [resources, setResources] = useState<LearningResource[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            const data = await getAIRecommendations();
            setResources(data);
            setLoading(false);
        };
        fetchResources();
    }, []);

    return (
         <div>
            <StandaloneHeader title="Learning Resources" />
            <main className="p-4 space-y-6">
                <p className="text-slate-600 dark:text-slate-400">Here are some resources recommended by your AI assistant based on your goals and skills.</p>
                {loading ? (
                    <p className="text-center text-slate-500 dark:text-slate-400">Loading recommendations...</p>
                ) : (
                    <div className="space-y-3">
                        {resources.map(res => <ResourceCard key={res.id} resource={res} />)}
                    </div>
                )}
            </main>
        </div>
    );
};