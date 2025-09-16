
import React from 'react';
import { useState } from 'react';
import { Goal } from '../types';

const initialGoals: Goal[] = [
    { 
        id: '1', 
        title: 'Read 12 books this year', 
        completed: false, 
        tasks: [
            { description: 'Read "Atomic Habits"', completed: true },
            { description: 'Read "The Psychology of Money"', completed: true },
            { description: 'Read "Sapiens"', completed: false },
        ] 
    },
    { 
        id: '2', 
        title: 'Launch a side project', 
        completed: false, 
        tasks: [
            { description: 'Brainstorm ideas', completed: true },
            { description: 'Create a business plan', completed: false },
            { description: 'Build a prototype', completed: false },
        ] 
    },
    { id: '3', title: 'Run a 5k marathon', completed: true, tasks: [] },
];

const GoalItem: React.FC<{ goal: Goal }> = ({ goal }) => {
    const completedTasks = goal.tasks.filter(t => t.completed).length;
    const progress = goal.tasks.length > 0 ? (completedTasks / goal.tasks.length) * 100 : (goal.completed ? 100 : 0);

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md space-y-3">
            <div className="flex justify-between items-center">
                <h3 className={`font-semibold text-slate-800 dark:text-slate-200 ${goal.completed ? 'line-through' : ''}`}>{goal.title}</h3>
                <input type="checkbox" defaultChecked={goal.completed} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
            </div>
            {goal.tasks.length > 0 && (
                 <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            )}
            {goal.tasks.map((task, index) => (
                <div key={index} className="flex items-center">
                    <input type="checkbox" defaultChecked={task.completed} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <label className={`ml-2 text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>{task.description}</label>
                </div>
            ))}
        </div>
    )
}

export const GoalTrackerScreen: React.FC = () => {
    const [goals, setGoals] = useState(initialGoals);

    return (
        <div className="space-y-6">
            <button className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                + Add New Goal
            </button>
            <div className="space-y-4">
                {goals.filter(g => !g.completed).map(goal => <GoalItem key={goal.id} goal={goal} />)}
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 my-4">Completed</h3>
                <div className="space-y-4 opacity-60">
                    {goals.filter(g => g.completed).map(goal => <GoalItem key={goal.id} goal={goal} />)}
                </div>
            </div>
        </div>
    );
};
