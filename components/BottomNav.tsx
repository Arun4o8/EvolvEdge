import React from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { NavLink, useLocation } = ReactRouterDOM;
import { NAV_ITEMS } from '../constants';

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
                            className={
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
            </nav>
        </footer>
    );
};