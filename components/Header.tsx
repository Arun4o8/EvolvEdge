
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BellIcon, CogIcon } from '../constants';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <div className="flex items-center space-x-2">
        <Link to="/notifications" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <BellIcon />
        </Link>
        <Link to="/settings" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <CogIcon />
        </Link>
      </div>
    </header>
  );
};
