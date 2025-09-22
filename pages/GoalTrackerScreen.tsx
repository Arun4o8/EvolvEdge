
import React, { useState } from 'react';
import { Goal, Task } from '../types';
import { CloseIcon, TrashIcon } from '../constants';
import { StandaloneHeader } from '../components/StandaloneHeader';
import { useGoals } from '../context/GoalContext';

const GoalItem: React.FC<{ goal: Goal; onDelete: (id: string) => void; onToggle: (id: string, completed: boolean) => void; onTaskToggle: (id: string, completed: boolean) => void; }> = ({ goal, onDelete, onToggle, onTaskToggle }) => {
    const completedTasks = goal.tasks.filter(t => t.completed).length;
    const progress = goal.tasks.length > 0 ? (completedTasks / goal.tasks.length) * 100 : (goal.completed ? 100 : 0);

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md space-y-3">
            <div className="flex justify-between items-center">
                <h3 className={`font-semibold text-slate-800 dark:text-slate-200 ${goal.completed ? 'line-through' : ''}`}>{goal.title}</h3>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => onDelete(goal.id)} 
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        aria-label={`Delete goal: ${goal.title}`}
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                    <input 
                        type="checkbox" 
                        checked={goal.completed} 
                        onChange={(e) => onToggle(goal.id, e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                    />
                </div>
            </div>
            {goal.tasks.length > 0 && (
                 <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            )}
            {goal.tasks.map((task) => (
                <div key={task.id} className="flex items-center">
                    <input 
                        type="checkbox" 
                        checked={task.completed} 
                        onChange={(e) => onTaskToggle(task.id, e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                    />
                    <label className={`ml-2 text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>{task.description}</label>
                </div>
            ))}
        </div>
    )
}

export const GoalTrackerScreen: React.FC = () => {
    const { goals, isLoading, addGoal, deleteGoal, toggleGoal, toggleTask } = useGoals();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState('');

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newGoalTitle.trim() === '') return;
        await addGoal({ title: newGoalTitle.trim() });
        setNewGoalTitle('');
        setIsModalOpen(false);
    };

    if (isLoading) {
        return (
            <div>
                <StandaloneHeader title="Track Your Goals" />
                <p className="text-center p-8">Loading your goals...</p>
            </div>
        );
    }

    return (
        <div>
            <StandaloneHeader title="Track Your Goals" />
            <main className="p-4">
                <div className="space-y-6">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                        aria-label="Add new goal"
                    >
                        + Add New Goal
                    </button>
                    <div className="space-y-4">
                        {goals.filter(g => !g.completed).map(goal => <GoalItem key={goal.id} goal={goal} onDelete={deleteGoal} onToggle={toggleGoal} onTaskToggle={toggleTask} />)}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-400 dark:text-slate-500 my-4">Completed</h3>
                        <div className="space-y-4 opacity-60">
                            {goals.filter(g => g.completed).map(goal => <GoalItem key={goal.id} goal={goal} onDelete={deleteGoal} onToggle={toggleGoal} onTaskToggle={toggleTask} />)}
                        </div>
                    </div>

                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                                    <h2 className="text-lg font-bold">Add New Goal</h2>
                                    <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><CloseIcon /></button>
                                </div>
                                <form onSubmit={handleAddGoal} className="p-4 space-y-4">
                                    <div>
                                        <label htmlFor="goalTitle" className="text-sm font-medium text-slate-700 dark:text-slate-300">Goal Title</label>
                                        <input
                                            id="goalTitle"
                                            type="text"
                                            value={newGoalTitle}
                                            onChange={(e) => setNewGoalTitle(e.target.value)}
                                            placeholder="e.g., Learn a new language"
                                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:bg-primary-300" disabled={!newGoalTitle.trim()}>
                                            Add Goal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};