import React, { createContext, useState, useEffect } from 'react';
import { PlannerEvent } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface PlannerContextType {
  events: PlannerEvent[];
  addEvent: (eventData: Omit<PlannerEvent, 'id' | 'user_id'>) => void;
  isLoading: boolean;
}

export const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

const MOCK_EVENTS: PlannerEvent[] = [
    { id: 'mock-1', date: new Date().toISOString().split('T')[0], time: '10:00', title: 'Learn React Hooks', category: 'skill' },
    { id: 'mock-2', date: new Date().toISOString().split('T')[0], time: '14:00', title: 'Team Meeting', category: 'work' },
];

export const PlannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
        if (!user) {
          setEvents([]);
          setIsLoading(false);
          return;
        };
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('planner_events')
                .select('*')
                .eq('user_id', user.id);
            
            if (error) throw error;

            setEvents(data || []);
        } catch (error: any) {
            if (error.message.includes('Could not find the table')) {
                console.warn("Backend missing 'planner_events' table. Falling back to mock data.");
                setEvents(MOCK_EVENTS);
            } else {
                console.error("Error fetching planner events:", error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };
    fetchEvents();
  }, [user]);

  const addEvent = async (eventData: Omit<PlannerEvent, 'id' | 'user_id'>) => {
    if (!user) return;
    
    const tempId = `mock-${Date.now()}`;
    const newEventForState: PlannerEvent = {
      ...eventData,
      id: tempId,
    };
    setEvents(prevEvents => [...prevEvents, newEventForState].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.time.localeCompare(b.time)));

    const newEventForDb = {
      ...eventData,
      user_id: user.id,
    };
    
    try {
        const { data, error } = await supabase
            .from('planner_events')
            .insert(newEventForDb)
            .select()
            .single();

        if (error) throw error;
        
        if (data) {
            setEvents(prevEvents => prevEvents.map(e => e.id === tempId ? data as PlannerEvent : e));
        }
    } catch(error: any) {
        if (error.message.includes('Could not find the table')) {
            console.warn("Backend missing 'planner_events' table. Event only added to local state.");
        } else {
            console.error("Error adding event:", error.message);
            // Revert optimistic update on real errors
            setEvents(prevEvents => prevEvents.filter(e => e.id !== tempId));
        }
    }
  };

  return (
    <PlannerContext.Provider value={{ events, addEvent, isLoading }}>
      {children}
    </PlannerContext.Provider>
  );
};