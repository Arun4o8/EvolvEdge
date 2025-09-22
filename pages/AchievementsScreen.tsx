import React, { useState, useEffect } from 'react';
import { Achievement } from '../types';
import { StandaloneHeader } from '../components/StandaloneHeader';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface UserAchievement {
    id: string;
    achievement_id: string;
    title: string;
    description: string;
    unlocked_at: string;
    context_data?: {
        imageUrl?: string;
        skillName?: string;
    }
}

const PREDEFINED_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'date' | 'imageUrl'>[] = [
    { id: 'goal_getter', title: 'Goal Getter', description: 'Complete your first goal' },
    { id: 'consistent_learner', title: 'Consistent Learner', description: 'Maintain a 7-day streak' },
    { id: 'skill_master', title: 'Skill Master', description: 'Reach 90% in any skill' },
    { id: 'verified_pro', title: 'Verified Pro', description: 'Validate a skill with a certificate' },
    { id: 'ai_collaborator', title: 'AI Collaborator', description: 'Chat with the AI 10 times' },
    { id: 'century_mark', title: 'Century Mark', description: 'Complete 100 tasks' },
];

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className={`p-4 text-center border-2 rounded-lg flex flex-col items-center justify-center space-y-2 ${achievement.unlocked ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/50' : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-60'}`}>
        {achievement.imageUrl ? (
            <img src={achievement.imageUrl} alt={achievement.title} className="w-16 h-16 rounded-full object-cover border-2 border-amber-400" />
        ) : (
            <div className={`text-3xl ${achievement.unlocked ? 'text-amber-500' : 'text-slate-500'}`}>{achievement.unlocked ? '🏆' : '🔒'}</div>
        )}
        <h3 className="font-bold text-slate-800 dark:text-slate-200">{achievement.title}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{achievement.description}</p>
        {achievement.unlocked && achievement.date && <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">Unlocked on {achievement.date}</p>}
    </div>
);


export const AchievementsScreen: React.FC = () => {
    const { user } = useAuth();
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAndMergeAchievements = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);

            try {
                const { data, error } = await supabase
                    .from('user_achievements')
                    .select('*')
                    .eq('user_id', user.id);
                
                if (error) throw error;
                const userAchievements: UserAchievement[] = data || [];

                // Hardcoded unlocked achievements for demo purposes
                const staticUnlockedIds = new Set(['goal_getter', 'consistent_learner', 'skill_master']);

                // Process static achievements (locked/unlocked)
                const processedStatic = PREDEFINED_ACHIEVEMENTS
                    .filter(pa => pa.id !== 'verified_pro') // Remove the generic 'verified_pro' placeholder
                    .map(pa => ({
                        ...pa,
                        unlocked: staticUnlockedIds.has(pa.id),
                        date: staticUnlockedIds.has(pa.id) ? 'a previous date' : undefined,
                    }));

                // Process dynamic "Verified Pro" achievements from the database
                const verifiedAchievements: Achievement[] = userAchievements
                    .filter(ua => ua.achievement_id === 'skill_verified' && ua.context_data)
                    .map(ua => ({
                        id: ua.id,
                        title: `Verified: ${ua.context_data!.skillName || 'Skill'}`,
                        description: 'Validated with certificate',
                        unlocked: true,
                        date: new Date(ua.unlocked_at).toLocaleDateString(),
                        imageUrl: ua.context_data!.imageUrl
                    }));

                // If no skills have been verified, add the locked "Verified Pro" placeholder back in
                if (verifiedAchievements.length === 0) {
                    const placeholder = PREDEFINED_ACHIEVEMENTS.find(pa => pa.id === 'verified_pro');
                    if(placeholder) {
                        // FIX: Add missing 'date' property to match the type of elements in 'processedStatic'.
                        processedStatic.push({ ...placeholder, unlocked: false, date: undefined });
                    }
                }
                
                // Combine verified achievements (which should appear first) with the rest
                setAchievements([...verifiedAchievements, ...processedStatic]);

            } catch (error: any) {
                 if (error.message.includes('Could not find the table')) {
                    console.warn("Backend missing 'user_achievements' table.");
                    // FIX: Explicitly type `lockedAchievements` as `Achievement[]` so that the optional `date` property can be assigned.
                    const lockedAchievements: Achievement[] = PREDEFINED_ACHIEVEMENTS.map(a => ({...a, unlocked: false}));
                    // For demo, let's unlock some anyway
                    lockedAchievements[0].unlocked = true;
                    lockedAchievements[0].date = '2023-10-15';
                    lockedAchievements[1].unlocked = true;
                    lockedAchievements[1].date = '2023-11-01';
                    setAchievements(lockedAchievements);
                } else {
                    console.error("Error fetching achievements:", error.message);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndMergeAchievements();
    }, [user]);

    return (
        <div>
            <StandaloneHeader title="Achievements" />
            <main className="p-4">
                {isLoading ? (
                    <p className="text-center text-slate-500 dark:text-slate-400">Loading achievements...</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {achievements.map(ach => <AchievementBadge key={ach.id} achievement={ach} />)}
                    </div>
                )}
            </main>
        </div>
    );
};
