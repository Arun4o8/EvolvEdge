import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { TargetIcon, ChartIcon } from '../constants';
import { QuoteOfTheDay } from '../components/QuoteOfTheDay';
import { PlannerContext } from '../context/PlannerContext';
import { LearningResource, PlannerEvent } from '../types';
import { getAIRecommendations } from '../services/geminiService';

const ResourceCard: React.FC<{ resource: LearningResource }> = ({ resource }) => {
    const iconMap = {
        article: '📄',
        video: '🎬',
        exercise: '🏋️'
    }
    return (
        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <div className="flex items-start gap-3">
                <div className="text-xl mt-1">{iconMap[resource.type]}</div>
                <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">{resource.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{resource.source}</p>
                </div>
            </div>
        </a>
    )
};

const SummaryCard: React.FC<{ title: string; link: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, link, children, icon }) => (
    <Link to={link} className="block bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-3">
            <div className="text-primary-600 dark:text-primary-400 mr-3">{icon}</div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
        </div>
        <div className="text-slate-600 dark:text-slate-400">{children}</div>
    </Link>
);

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning, Alex!";
    if (hour < 18) return "Good afternoon, Alex!";
    return "Good evening, Alex!";
};

const categoryColors: Record<PlannerEvent['category'], string> = {
    work: 'border-red-500',
    skill: 'border-blue-500',
    personal: 'border-green-500',
}

export const HomeScreen: React.FC = () => {
    const [resources, setResources] = useState<LearningResource[]>([]);
    const [loadingResources, setLoadingResources] = useState(true);
    
    const plannerContext = useContext(PlannerContext);
    const todaysEvents = plannerContext?.events.filter(event => event.date === new Date().toISOString().split('T')[0]) || [];

    useEffect(() => {
        const fetchResources = async () => {
            setLoadingResources(true);
            try {
                const data = await getAIRecommendations();
                setResources(data.slice(0, 2));
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setLoadingResources(false);
            }
        };
        fetchResources();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{getGreeting()}</h2>
                <p className="text-slate-600 dark:text-slate-400">Ready to grow today?</p>
            </div>
            
            <QuoteOfTheDay />

            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">Today's Focus</h3>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
                    {todaysEvents.length > 0 ? (
                        <ul className="space-y-3">
                            {todaysEvents.map(event => (
                                <li key={event.id} className={`flex items-center p-2 rounded-md border-l-4 ${categoryColors[event.category]}`}>
                                    <span className="font-semibold text-sm w-20 text-slate-600 dark:text-slate-400">{event.time}</span>
                                    <span className="text-slate-700 dark:text-slate-300">{event.title}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-center py-4">Nothing scheduled for today. Ask the AI to plan your day!</p>
                    )}
                </div>
            </div>
            
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">Recommended For You</h3>
                 {loadingResources ? (
                    <div className="space-y-3">
                        <div className="h-20 bg-white dark:bg-slate-800 rounded-lg animate-pulse"></div>
                        <div className="h-20 bg-white dark:bg-slate-800 rounded-lg animate-pulse"></div>
                    </div>
                 ) : (
                    <div className="space-y-3">
                        {resources.map(res => <ResourceCard key={res.id} resource={res} />)}
                    </div>
                 )}
            </div>

            <SummaryCard title="Current Goals" link="/goals" icon={<TargetIcon />}>
                <p>You have <strong>3 active goals</strong>. You're 75% done with "Read 12 books this year". Keep going!</p>
            </SummaryCard>

            <SummaryCard title="Skill Progress" link="/skills" icon={<ChartIcon />}>
                <p>Your "Public Speaking" skill has increased by <strong>15%</strong> this month. Great job!</p>
            </SummaryCard>
        </div>
    );
};