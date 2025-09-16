import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    CogIcon,
    StarIcon,
    BookOpenIcon,
    QuestionMarkCircleIcon,
    BellIcon,
    ArrowRightIcon
} from '../constants';

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
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center space-y-2 pt-4">
                <div className="w-24 h-24 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
                    <span className="text-4xl">🧑‍💻</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Alex Thompson</h2>
                <p className="text-slate-600 dark:text-slate-400">alex.thompson@example.com</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">12</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Goals Completed</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">5</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Skills Mastered</p>
                </div>
            </div>

            <div className="space-y-2">
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
        </div>
    );
};