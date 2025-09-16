
import React, { createContext, useState } from 'react';
import { PlannerEvent } from '../types';

interface PlannerContextType {
  events: PlannerEvent[];
  addEvent: (eventData: Omit<PlannerEvent, 'id'>) => void;
}

export const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const initialEvents: PlannerEvent[] = [
    { id: '1', date: new Date().toISOString().split('T')[0], time: '09:00 AM', title: 'Team Standup', category: 'work' },
    { id: '2', date: new Date().toISOString().split('T')[0], time: '10:00 AM', title: 'Learn React Hooks', category: 'skill' },
    { id: '3', date: new Date().toISOString().split('T')[0], time: '02:00 PM', title: 'Project Meeting', category: 'work' },
];

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<PlannerEvent[]>(initialEvents);

  const addEvent = (eventData: Omit<PlannerEvent, 'id'>) => {
    const newEvent: PlannerEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prevEvents => [...prevEvents, newEvent].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)));
  };

  return (
    <PlannerContext.Provider value={{ events, addEvent }}>
      {children}
    </PlannerContext.Provider>
  );
};
