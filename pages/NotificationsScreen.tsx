import React from 'react';
import { Notification } from '../types';
import { TargetIcon, SparklesIcon, CalendarIcon } from '../constants';
import { StandaloneHeader } from '../components/StandaloneHeader';

const notifications: Notification[] = [
    { id: '1', type: 'milestone', message: 'Congratulations! You completed your goal "Run a 5k marathon".', timestamp: '2 hours ago', read: false },
    { id: '2', type: 'suggestion', message: 'New AI recommendation: A video on advanced TypeScript techniques.', timestamp: '1 day ago', read: false },
    { id: '3', type: 'reminder', message: 'Don\'t forget your "Practice Public Speaking" session today at 4 PM.', timestamp: '3 days ago', read: true },
    { id: '4', type: 'milestone', message: 'You\'ve maintained a 7-day learning streak! Keep it up.', timestamp: '4 days ago', read: true },
];

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    const iconMap = {
        milestone: <TargetIcon />,
        suggestion: <SparklesIcon />,
        reminder: <CalendarIcon />,
    };
    const colorMap = {
        milestone: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
        suggestion: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
        reminder: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    };
    return <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[type]}`}>{iconMap[type]}</div>;
};

export const NotificationsScreen: React.FC = () => {
    return (
        <div>
            <StandaloneHeader title="Notifications" />
            <main className="p-4 space-y-4">
                {notifications.map(notif => (
                    <div key={notif.id} className={`flex items-start gap-4 p-4 rounded-lg ${notif.read ? 'bg-transparent' : 'bg-white dark:bg-slate-800'}`}>
                        <NotificationIcon type={notif.type} />
                        <div>
                            <p className="text-slate-800 dark:text-slate-200">{notif.message}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{notif.timestamp}</p>
                        </div>
                        {!notif.read && <div className="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0 mt-1"></div>}
                    </div>
                ))}
            </main>
        </div>
    );
};