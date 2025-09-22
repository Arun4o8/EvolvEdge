
import React, { createContext, useState, useEffect } from 'react';
import { Routine } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

interface RoutineContextType {
  routines: Routine[];
  initializeRoutines: (routines: Omit<Routine, 'id'|'completed'|'user_id'>[]) => void;
  toggleRoutine: (id: string) => void;
  isLoading: boolean;
}

export const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

const MOCK_ROUTINES: Routine[] = [
    { id: 'mock-r-1', title: 'Morning Meditation', category: 'Mindfulness', completed: false },
    { id: 'mock-r-2', title: 'Read for 20 Minutes', category: 'Learning & Growth', completed: true },
    { id: 'mock-r-3', title: 'Plan Your Day', category: 'Productivity', completed: false },
];

export const RoutineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRoutines = async () => {
             if (!user) {
                setRoutines([]);
                setIsLoading(false);
                return;
            };
            setIsLoading(true);

            try {
                // Try to reset routines, but don't fail if the function doesn't exist
                const { error: rpcError } = await supabase.rpc('reset_daily_routines_for_user', { p_user_id: user.id });
                if (rpcError && !rpcError.message.includes('Could not find the function')) {
                    console.warn("Error calling reset_daily_routines_for_user, but proceeding:", rpcError.message);
                }
                
                const { data, error } = await supabase
                    .from('routines')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) throw error;

                setRoutines(data || []);

            } catch (error: any) {
                if (error.message.includes('Could not find the table') || error.message.includes('Could not find the function')) {
                    console.warn("Backend missing 'routines' table/function. Falling back to mock data.");
                    setRoutines(MOCK_ROUTINES);
                } else {
                    console.error("Error fetching routines:", error.message);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoutines();
    }, [user]);

    const initializeRoutines = async (initialRoutines: Omit<Routine, 'id'|'completed'|'user_id'>[]) => {
        if (!user) return;
        
        // Filter out routines that already exist for the user to prevent duplicates
        const existingRoutineTitles = new Set(routines.map(r => r.title));
        const uniqueNewRoutines = initialRoutines.filter(r => !existingRoutineTitles.has(r.title));

        if (uniqueNewRoutines.length === 0) {
            return; // Nothing new to add
        }

        const newRoutinesToInsert = uniqueNewRoutines.map(r => ({
            ...r,
            user_id: user.id,
            completed: false,
        }));
        
        const mockRoutinesWithIds = newRoutinesToInsert.map((r, i) => ({ ...r, id: `mock-r-${Date.now() + i}`}));
        setRoutines(prev => [...prev, ...mockRoutinesWithIds]);
        
        try {
            const { data, error } = await supabase.from('routines').insert(newRoutinesToInsert).select();
            if (error) throw error;
            // Replace mock routines with real ones from DB
            setRoutines(prev => [...prev.filter(r => !r.id.startsWith('mock-r-')), ...data]);
        } catch (error: any) {
             if (error.message.includes('Could not find the table')) {
                 console.warn("Backend missing 'routines' table. New routines only saved to local state.");
             } else {
                console.error("Error initializing routines", error.message);
                setRoutines(prev => prev.filter(r => !mockRoutinesWithIds.some(mock => mock.id === r.id)));
             }
        }
    };

    const toggleRoutine = async (id: string) => {
        if (!user) return;
        const routine = routines.find(r => r.id === id);
        if (!routine) return;

        const oldRoutines = routines;
        const newCompletedStatus = !routine.completed;
        const today = new Date().toISOString().split('T')[0];

        setRoutines(prev => prev.map(r => r.id === id ? { ...r, completed: newCompletedStatus } : r));

        try {
            const { error } = await supabase
                .from('routines')
                .update({ completed: newCompletedStatus, last_completed_date: today })
                .eq('id', id)
                .eq('user_id', user.id);
            if (error) throw error;
        } catch(error: any) {
            if (error.message.includes('Could not find the table')) {
                console.warn("Backend missing 'routines' table. Routine toggle only saved to local state.");
            } else {
                console.error("Error toggling routine:", error.message);
                setRoutines(oldRoutines);
            }
        }
    };

    return (
        <RoutineContext.Provider value={{ routines, initializeRoutines, toggleRoutine, isLoading }}>
            {children}
        </RoutineContext.Provider>
    );
};