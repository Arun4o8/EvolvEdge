import React, { useState, useContext, useEffect } from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { Link } = ReactRouterDOM;
import {
    CogIcon,
    StarIcon,
    BookOpenIcon,
    QuestionMarkCircleIcon,
    BellIcon,
    ArrowRightIcon,
    PencilIcon,
    CloseIcon,
    TargetIcon,
    SparklesIcon
} from '../constants';
import { useAuth } from '../context/AuthContext';
import { SkillContext } from '../context/SkillContext';
import { supabase } from '../lib/supabaseClient';
import { Goal } from '../types';

const ProfileLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
    <Link to={to} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
        <div className="flex items-center space-x-4">
            <div className="text-primary-600 dark:text-primary-400">{icon}</div>
            <span className="font-medium text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <ArrowRightIcon />
    </Link>
);

export const ProfileScreen: React.FC = () => {
    const { user, signOut, updateUser } = useAuth();
    const skillContext = useContext(SkillContext);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
    const [isSaving, setIsSaving] = useState(false);
    const [goals, setGoals] = useState<Pick<Goal, 'completed'>[]>([]);
    const [goalsLoading, setGoalsLoading] = useState(true);

    useEffect(() => {
        const fetchGoals = async () => {
            if (!user) {
                setGoalsLoading(false);
                return;
            }
            setGoalsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('goals')
                    .select('completed')
                    .eq('user_id', user.id);
                
                if (error) throw error;

                setGoals(data || []);
            } catch (error: any) {
                console.error("Error fetching goals for profile:", error.message);
            } finally {
                setGoalsLoading(false);
            }
        };
        fetchGoals();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
    };

    const handleSaveName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName.trim() || !user) return;

        setIsSaving(true);
        const { error } = await updateUser({ data: { display_name: displayName.trim() } });
        if (error) {
            console.error("Failed to update name:", error.message);
        } else {
            setIsEditModalOpen(false);
        }
        setIsSaving(false);
    };
    
    const userName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';
    const skillsMasteredCount = skillContext?.skills.filter(s => s.level >= 90).length ?? 0;
    const completedGoalsCount = goals.filter(g => g.completed).length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center space-y-2 pt-4">
                <div className="w-24 h-24 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                    <span className="text-4xl">🧑‍💻</span>
                </div>
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 capitalize">{userName}</h2>
                    <button onClick={() => { setDisplayName(userName); setIsEditModalOpen(true); }} className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700">
                        <PencilIcon className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{user?.email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{skillContext?.isLoading ? '...' : skillsMasteredCount}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Skills Mastered</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{goalsLoading ? '...' : completedGoalsCount}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Goals Completed</p>
                </div>
            </div>

            <div className="space-y-2">
                <ProfileLink to="/goals" icon={<TargetIcon />} label="Track Goals" />
                <ProfileLink to="/career-advisor" icon={<SparklesIcon />} label="AI Career Advisor" />
                <ProfileLink to="/achievements" icon={<StarIcon />} label="Achievements" />
                <ProfileLink to="/notifications" icon={<BellIcon />} label="Notifications" />
                <ProfileLink to="/resources" icon={<BookOpenIcon />} label="Learning Resources" />
                <ProfileLink to="/settings" icon={<CogIcon />} label="Settings" />
                <ProfileLink to="/support" icon={<QuestionMarkCircleIcon />} label="Help & Support" />
            </div>

            <div className="pt-4">
                 <button 
                    onClick={handleLogout}
                    className="w-full text-center p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    Log Out
                </button>
            </div>

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-bold">Edit Display Name</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><CloseIcon /></button>
                        </div>
                        <form onSubmit={handleSaveName} className="p-4 space-y-4">
                            <div>
                                <label htmlFor="displayName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                                <input
                                    id="displayName"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:bg-primary-300" disabled={isSaving || !displayName.trim()}>
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};