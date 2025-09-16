import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../types';
import { MoonIcon, SunIcon } from '../constants';
import { StandaloneHeader } from '../components/StandaloneHeader';

const SettingsItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        {children}
    </div>
);

const Toggle: React.FC = () => {
    const [on, setOn] = React.useState(true);
    return (
        <button onClick={() => setOn(!on)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${on ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
};

export const SettingsScreen: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div>
            <StandaloneHeader title="Settings" />
            <main className="p-4">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Appearance</h2>
                        <SettingsItem>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Dark Mode</span>
                            <button onClick={toggleTheme} className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                                {theme === Theme.Light ? <MoonIcon /> : <SunIcon />}
                            </button>
                        </SettingsItem>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Notifications</h2>
                        <div className="space-y-2">
                            <SettingsItem>
                                <span className="font-medium text-slate-700 dark:text-slate-300">Goal Reminders</span>
                                <Toggle />
                            </SettingsItem>
                            <SettingsItem>
                                <span className="font-medium text-slate-700 dark:text-slate-300">AI Suggestions</span>
                                <Toggle />
                            </SettingsItem>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Account</h2>
                        <div className="space-y-2">
                            <button className="w-full text-left p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm font-medium text-slate-700 dark:text-slate-300">Change Password</button>
                            <button onClick={handleLogout} className="w-full text-left p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm font-medium text-red-600 dark:text-red-400">Log Out</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};