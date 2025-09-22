
import React, { createContext, useState, useEffect } from 'react';
import { Skill } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

interface SkillContextType {
  skills: Skill[];
  initializeSkills: (skills: Omit<Skill, 'id' | 'user_id'>[]) => void;
  updateSkill: (subject: string, level: number) => void;
  isLoading: boolean;
}

export const SkillContext = createContext<SkillContextType | undefined>(undefined);

const MOCK_SKILLS: Skill[] = [
    { subject: 'Coding', level: 60 },
    { subject: 'Public Speaking', level: 75 },
    { subject: 'Data Analysis', level: 45 },
];

export const SkillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSkills = async () => {
            if (!user) {
                setSkills([]);
                setIsLoading(false);
                return;
            };
            setIsLoading(true);

            try {
                const { data, error } = await supabase
                    .from('skills')
                    .select('*')
                    .eq('user_id', user.id);
                if (error) throw error;
                setSkills(data || []);
            } catch (error: any) {
                if (error.message.includes('Could not find the table')) {
                    console.warn("Backend missing 'skills' table. Falling back to mock data.");
                    // For a new user, the skills table would be empty, so an empty array is correct.
                    // Mock data should only be a last resort for testing without a DB.
                    setSkills([]);
                } else {
                    console.error("Error fetching skills:", error.message);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchSkills();
    }, [user]);

    const initializeSkills = async (initialSkills: Omit<Skill, 'id'|'user_id'>[]) => {
        if (!user) return;

        const skillsToInsert = initialSkills.map(skill => ({
            ...skill,
            user_id: user.id
        }));

        // Optimistic update for UI
        setSkills(skillsToInsert as Skill[]);

        try {
            const { data, error } = await supabase
                .from('skills')
                .insert(skillsToInsert)
                .select();
            
            if (error) throw error;

            // Replace optimistic data with real data from DB
            setSkills(data || []);
        } catch (error: any) {
            if (error.message.includes('Could not find the table')) {
                 console.warn("Backend missing 'skills' table. New skills only saved to local state.");
            } else {
                console.error("Error initializing skills:", error.message);
                // Revert if there was a real error
                setSkills([]); 
            }
        }
    };

    const updateSkill = async (subject: string, level: number) => {
        if (!user) return;
        const newLevel = Math.min(100, Math.max(0, level));

        const oldSkills = skills;
        const newSkills = skills.map(skill =>
            skill.subject === subject ? { ...skill, level: newLevel } : skill
        );
        setSkills(newSkills);

        try {
            const { error } = await supabase
                .from('skills')
                .update({ level: newLevel })
                .eq('user_id', user.id)
                .eq('subject', subject);
            
            if (error) throw error;

        } catch (error: any) {
            if (error.message.includes('Could not find the table')) {
                console.warn("Backend missing 'skills' table. Skill update only saved to local state.");
            } else {
                console.error("Error updating skill:", error.message);
                setSkills(oldSkills);
            }
        }
    };

    return (
        <SkillContext.Provider value={{ skills, initializeSkills, updateSkill, isLoading }}>
            {children}
        </SkillContext.Provider>
    );
};