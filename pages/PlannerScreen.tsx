
import React, { useContext, useState } from 'react';
import { PlannerContext } from '../context/PlannerContext';
import { PlannerEvent } from '../types';
import { SearchIcon } from '../constants';

const categoryColors: Record<PlannerEvent['category'], string> = {
    work: 'bg-red-100 dark:bg-red-900/50 border-red-500',
    skill: 'bg-blue-100 dark:bg-blue-900/50 border-blue-500',
    personal: 'bg-green-100 dark:bg-green-900/50 border-green-500',
}

function getDisplayDate(dateString: string): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Add a time to avoid timezone issues where the date might be off by one day
  const eventDate = new Date(dateString + 'T00:00:00');

  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate.getTime() === today.getTime()) return 'Today';
  if (eventDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
  
  return eventDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}


export const PlannerScreen: React.FC = () => {
    const plannerContext = useContext(PlannerContext);
    const [searchQuery, setSearchQuery] = useState('');

    if (!plannerContext || plannerContext.isLoading) {
        return <div>Loading planner...</div>;
    }

    const { events } = plannerContext;

    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const groupedEvents = filteredEvents.reduce((acc, event) => {
        (acc[event.date] = acc[event.date] || []).push(event);
        return acc;
    }, {} as Record<string, PlannerEvent[]>);

    const sortedDates = Object.keys(groupedEvents).sort();

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Your Plan</h2>
                <p className="text-slate-600 dark:text-slate-400">Organized by your AI assistant.</p>
            </div>

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search events by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    aria-label="Search planner events"
                />
            </div>

            {sortedDates.length > 0 ? (
                sortedDates.map(date => (
                    <div key={date}>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2 pb-2 border-b-2 border-slate-200 dark:border-slate-700">
                           {getDisplayDate(date)}
                        </h3>
                        <div className="space-y-3">
                            {groupedEvents[date].sort((a,b) => a.time.localeCompare(b.time)).map(event => (
                                <div key={event.id} className={`flex items-center p-3 rounded-lg ${categoryColors[event.category]} border-l-4`}>
                                    <div className="w-24 text-sm font-semibold text-slate-800 dark:text-slate-200">{event.time}</div>
                                    <div className="flex-grow text-slate-700 dark:text-slate-300">{event.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10 px-4 bg-white dark:bg-slate-800 rounded-lg">
                    {searchQuery ? (
                         <p className="text-slate-500 dark:text-slate-400">No events found matching your search.</p>
                    ) : (
                        <>
                            <p className="text-slate-500 dark:text-slate-400">Your planner is empty.</p>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Try asking the AI assistant to schedule something for you!</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
