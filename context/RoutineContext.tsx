import React, { createContext, useState, useEffect } from 'react';
import { Routine } from '../types';

interface RoutineContextType {
  routines: Routine[];
  initializeRoutines: (routines: Omit<Routine, 'id'|'completed'>[]) => void;
  toggleRoutine: (id: string) => void;
  isLoading: boolean;
}

export const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

const ROUTINES_STORAGE_KEY = 'evolvedge-user-routines';
const LAST_VISIT_STORAGE_KEY = 'evolvedge-last-visit-date';

export const RoutineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedRoutines = localStorage.getItem(ROUTINES_STORAGE_KEY);
            const lastVisit = localStorage.getItem(LAST_VISIT_STORAGE_KEY);
            const today = new Date().toISOString().split('T')[0];
            
            let routinesToLoad: Routine[] = [];
            if (storedRoutines) {
                routinesToLoad = JSON.parse(storedRoutines);
            }

            if (lastVisit !== today) {
                // If it's a new day, reset all routines to incomplete
                routinesToLoad = routinesToLoad.map(r => ({ ...r, completed: false }));
                localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routinesToLoad));
                localStorage.setItem(LAST_VISIT_STORAGE_KEY, today);
            }
            
            setRoutines(routinesToLoad);

        } catch (error) {
            console.error("Failed to load routines from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const persistRoutines = (newRoutines: Routine[]) => {
        setRoutines(newRoutines);
        localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(newRoutines));
    };

    const initializeRoutines = (initialRoutines: Omit<Routine, 'id'|'completed'>[]) => {
        const newRoutines = initialRoutines.map(r => ({
            ...r,
            id: r.title.replace(/\s+/g, '-').toLowerCase(),
            completed: false,
        }));
        persistRoutines(newRoutines);
    };

    const toggleRoutine = (id: string) => {
        const newRoutines = routines.map(routine =>
            routine.id === id ? { ...routine, completed: !routine.completed } : routine
        );
        persistRoutines(newRoutines);
    };

    return (
        <RoutineContext.Provider value={{ routines, initializeRoutines, toggleRoutine, isLoading }}>
            {children}
        </RoutineContext.Provider>
    );
};