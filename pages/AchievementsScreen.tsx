import React from 'react';
import { Achievement } from '../types';
import { StandaloneHeader } from '../components/StandaloneHeader';

const achievements: Achievement[] = [
    { id: '1', title: 'Goal Getter', description: 'Complete your first goal', unlocked: true, date: '2023-10-15' },
    { id: '2', title: 'Consistent Learner', description: 'Maintain a 7-day streak', unlocked: true, date: '2023-11-01' },
    { id: '3', title: 'Skill Master', description: 'Reach 90% in any skill', unlocked: true, date: '2023-11-20' },
    { id: '4', title: 'AI Collaborator', description: 'Chat with the AI 10 times', unlocked: false },
    { id: '5', title: 'Century Mark', description: 'Complete 100 tasks', unlocked: false },
    { id: '6', title: 'Planner Pro', description: 'Schedule 30 events', unlocked: false },
];

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className={`p-4 text-center border-2 rounded-lg flex flex-col items-center justify-center ${achievement.unlocked ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/50' : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-60'}`}>
        <div className={`text-3xl mb-2 ${achievement.unlocked ? 'text-amber-500' : 'text-slate-500'}`}>{achievement.unlocked ? '🏆' : '🔒'}</div>
        <h3 className="font-bold text-slate-800 dark:text-slate-200">{achievement.title}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{achievement.description}</p>
        {achievement.unlocked && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Unlocked {achievement.date}</p>}
    </div>
);


export const AchievementsScreen: React.FC = () => {
    return (
        <div>
            <StandaloneHeader title="Achievements" />
            <main className="p-4">
                <div className="grid grid-cols-2 gap-4">
                    {achievements.map(ach => <AchievementBadge key={ach.id} achievement={ach} />)}
                </div>
            </main>
        </div>
    );
};