
import React from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon, TargetIcon, ChartIcon } from '../constants';

const Card: React.FC<{ title: string; link: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, link, children, icon }) => (
    <Link to={link} className="block bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
        <div className="flex items-center mb-3">
            <div className="text-primary-600 dark:text-primary-400 mr-3">{icon}</div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>
        </div>
        <div className="text-slate-600 dark:text-slate-400">{children}</div>
    </Link>
);


export const HomeScreen: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Hello, Alex!</h2>
                <p className="text-slate-600 dark:text-slate-400">Ready to grow today?</p>
            </div>

            <Card title="AI Suggestions" link="/ai-chat" icon={<SparklesIcon />}>
                <p>Your AI assistant has new recommendations for you. Let's check them out!</p>
            </Card>

            <Card title="Current Goals" link="/goals" icon={<TargetIcon />}>
                <p>You have <strong>3 active goals</strong>. You're 75% done with "Read 12 books this year". Keep going!</p>
            </Card>

            <Card title="Skill Progress" link="/skills" icon={<ChartIcon />}>
                <p>Your "Public Speaking" skill has increased by <strong>15%</strong> this month. Great job!</p>
            </Card>
            
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">Today's Focus</h3>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
                    <ul className="space-y-3">
                        <li className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                            <span className="ml-3 text-slate-700 dark:text-slate-300">Practice presentation for 30 mins</span>
                        </li>
                        <li className="flex items-center">
                            <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                            <span className="ml-3 text-slate-700 dark:text-slate-300 line-through">Read one chapter of "Atomic Habits"</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
