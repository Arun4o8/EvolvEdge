

import React from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { BackIcon } from '../constants';

interface StandaloneHeaderProps {
  title: string;
  action?: React.ReactNode;
}

export const StandaloneHeader: React.FC<StandaloneHeaderProps> = ({ title, action }) => {
  const navigate = useNavigate();

  return (
    <header className="p-4 flex items-center border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
      <button 
        onClick={() => navigate(-1)} 
        className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors mr-2"
        aria-label="Go back"
      >
        <BackIcon />
      </button>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white flex-grow">{title}</h1>
      {action}
    </header>
  );
};