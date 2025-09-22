import React, { createContext, useState, useEffect } from 'react';
import { Skill } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

interface SkillContextType {
  skills: Skill[];
  initializeSkills: (skills: Omit<Skill, 'id' | 'user_id'>[]) => void;
  addSkill: (newSkill: { subject: string, level?: number }) => Promise<void>;
  updateSkill: (subject: string, level: number) => void;
  deleteSkill: (subject: string) => Promise<void>;
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

        const skillsToUpsert = initialSkills.map(skill => ({
            ...skill,
            user_id: user.id
        }));

        try {
            // FIX: Replaced `insert` with `upsert` and `ignoreDuplicates: true`.
            // This robustly handles the "duplicate key" error by inserting only new skills
            // and ignoring any that the user already has, preserving existing progress.
            const { error: upsertError } = await supabase
                .from('skills')
                .upsert(skillsToUpsert, { 
                    onConflict: 'user_id,subject',
                    ignoreDuplicates: true 
                });
            
            if (upsertError) throw upsertError;

            // After upserting, fetch the definitive list of skills from the database
            // to ensure the local state is perfectly synchronized.
            const { data: updatedSkills, error: fetchError } = await supabase
                .from('skills')
                .select('*')
                .eq('user_id', user.id);

            if (fetchError) throw fetchError;

            setSkills(updatedSkills || []);
            
        } catch (error: any) {
            if (error.message.includes('Could not find the table')) {
                console.warn("Backend missing 'skills' table. New skills only saved to local state.");
                // Fallback to optimistic update if DB is not available
                const existingSubjects = new Set(skills.map(s => s.subject));
                const newSkills = skillsToUpsert.filter(s => !existingSubjects.has(s.subject));
                setSkills(prev => [...prev, ...newSkills as Skill[]]);
            } else {
                console.error("Error initializing skills:", error.message);
            }
        }
    };

    const addSkill = async (newSkill: { subject: string, level?: number }) => {
        if (!user) return;
        
        if (skills.find(s => s.subject.toLowerCase() === newSkill.subject.toLowerCase())) {
            console.warn(`Skill "${newSkill.subject}" already exists.`);
            return;
        }

        const skillToInsert = {
            subject: newSkill.subject,
            level: newSkill.level || 10,
            user_id: user.id,
        };

        const oldSkills = skills;
        setSkills(prev => [...prev, skillToInsert as Skill]);

        try {
            const { data, error } = await supabase.from('skills').insert(skillToInsert).select().single();
            if (error) throw error;
            if (data) {
                setSkills(prev => prev.map(s => s.subject === data.subject ? data : s));
            }
        } catch (error: any) {
             if (error.message.includes('Could not find the table')) {
                console.warn("Backend missing 'skills' table. New skill only saved to local state.");
             } else {
                console.error("Error adding skill:", error.message);
                setSkills(oldSkills);
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

    const deleteSkill = async (subject: string) => {
        if (!user) return;
        
        const oldSkills = skills;
        setSkills(prev => prev.filter(s => s.subject !== subject));

        try {
            const { error } = await supabase
                .from('skills')
                .delete()
                .eq('user_id', user.id)
                .eq('subject', subject);
            
            if (error) throw error;
        } catch (error: any) {
            if (error.message.includes('Could not find the table')) {
                console.warn("Backend missing 'skills' table. Skill deleted from local state only.");
            } else {
                console.error("Error deleting skill:", error.message);
                setSkills(oldSkills);
            }
        }
    };

    return (
        <SkillContext.Provider value={{ skills, initializeSkills, addSkill, updateSkill, deleteSkill, isLoading }}>
            {children}
        </SkillContext.Provider>
    );
};