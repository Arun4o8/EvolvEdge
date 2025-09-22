
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Goal, Task } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

interface GoalContextType {
  goals: Goal[];
  addGoal: (goalData: { title: string }) => Promise<Goal | null>;
  deleteGoal: (id: string) => Promise<void>;
  toggleGoal: (id: string, completed: boolean) => Promise<void>;
  toggleTask: (id: string, completed: boolean) => Promise<void>;
  isLoading: boolean;
}

export const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};

const MOCK_GOALS: Goal[] = [
    { id: 'mock-g-1', title: 'Run a 5k marathon', completed: false, tasks: [
        { id: 'mock-t-1', description: 'Run 1k', completed: true },
        { id: 'mock-t-2', description: 'Run 3k', completed: false },
    ]},
    { id: 'mock-g-2', title: 'Learn to cook a new dish', completed: true, tasks: [] },
];

export const GoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      };
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*, tasks(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setGoals(data as Goal[]);

      } catch (error: any) {
        if (error.message.includes('Could not find the table')) {
          console.warn("Backend missing 'goals' table. Falling back to mock data.");
          setGoals(MOCK_GOALS);
        } else {
          console.error("Error fetching goals:", error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, [user]);

  const addGoal = async (goalData: { title: string }): Promise<Goal | null> => {
    if (!user) return null;

    const tempId = `mock-g-${Date.now()}`;
    const newGoal: Goal = {
      id: tempId,
      title: goalData.title,
      completed: false,
      tasks: [],
    };
    setGoals(prevGoals => [newGoal, ...prevGoals]);

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({ title: goalData.title, user_id: user.id })
        .select('*, tasks(*)')
        .single();
      
      if (error) throw error;
      
      if (data) {
        const newGoalFromDb = data as Goal;
        setGoals(prevGoals => prevGoals.map(g => g.id === tempId ? newGoalFromDb : g));
        return newGoalFromDb;
      }
      return null;
    } catch (error: any) {
      if (error.message.includes('Could not find the table')) {
        console.warn("Backend missing 'goals' table. Goal only added to local state.");
        return newGoal; // return optimistic goal
      } else {
        console.error("Error adding goal:", error.message);
        setGoals(prevGoals => prevGoals.filter(g => g.id !== tempId));
        return null;
      }
    }
  };

  const deleteGoal = async (goalId: string) => {
    const oldGoals = goals;
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
    
    try {
      const { error } = await supabase.from('goals').delete().eq('id', goalId);
      if (error) throw error;
    } catch (error: any) {
      if (error.message.includes('Could not find the table')) {
        console.warn("Backend missing 'goals' table. Goal only deleted from local state.");
      } else {
        console.error("Error deleting goal:", error.message);
        setGoals(oldGoals);
      }
    }
  };

  const toggleGoal = async (goalId: string, completed: boolean) => {
    const oldGoals = goals;
    setGoals(prevGoals => prevGoals.map(g => g.id === goalId ? {...g, completed} : g));
    
    try {
      const { error } = await supabase.from('goals').update({ completed }).eq('id', goalId);
      if (error) throw error;
    } catch(error: any) {
      if (error.message.includes('Could not find the table')) {
        console.warn("Backend missing 'goals' table. Goal toggle only saved to local state.");
      } else {
        console.error("Error toggling goal:", error.message);
        setGoals(oldGoals);
      }
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    const oldGoals = goals;
    setGoals(prevGoals => prevGoals.map(g => ({
      ...g,
      tasks: g.tasks.map(t => t.id === taskId ? {...t, completed} : t)
    })));
    
    try {
      const { error } = await supabase.from('tasks').update({ completed }).eq('id', taskId);
      if (error) throw error;
    } catch(error: any) {
      if (error.message.includes('Could not find the table')) {
        console.warn("Backend missing 'tasks' table. Task toggle only saved to local state.");
      } else {
        console.error("Error toggling task:", error.message);
        setGoals(oldGoals);
      }
    }
  };
  
  return (
    <GoalContext.Provider value={{ goals, addGoal, deleteGoal, toggleGoal, toggleTask, isLoading }}>
      {children}
    </GoalContext.Provider>
  );
};