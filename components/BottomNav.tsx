
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV_ITEMS, SparklesIcon } from '../constants';

export const BottomNav: React.FC = () => {
    const location = useLocation();
    
    return (
        <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
            <nav className="flex justify-around items-center h-16">
                {NAV_ITEMS.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full transition-colors duration-200 ${
                                isActive
                                    ? 'text-primary-600 dark:text-primary-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-primary-500 dark:hover:text-primary-300'
                                }`
                            }
                        >
                            <item.icon />
                            <span className="text-xs font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
                 <NavLink
                    to="/ai-chat"
                     className={({ isActive }) =>
                        `absolute -top-6 flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all transform hover:scale-110 ${
                         isActive ? 'ring-4 ring-primary-300 dark:ring-primary-500' : ''
                        }`
                    }
                    style={{left: '50%', transform: 'translateX(-50%)'}}
                >
                    <SparklesIcon />
                </NavLink>
            </nav>
        </footer>
    );
};
