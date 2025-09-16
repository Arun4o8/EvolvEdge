import React, { createContext, useState, useEffect } from 'react';
import { Skill } from '../types';

interface SkillContextType {
  skills: Skill[];
  initializeSkills: (skills: Skill[]) => void;
  updateSkill: (subject: string, level: number) => void;
  isLoading: boolean;
}

export const SkillContext = createContext<SkillContextType | undefined>(undefined);

const SKILLS_STORAGE_KEY = 'evolvedge-user-skills';

export const SkillProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedSkills = localStorage.getItem(SKILLS_STORAGE_KEY);
            if (storedSkills) {
                setSkills(JSON.parse(storedSkills));
            }
        } catch (error) {
            console.error("Failed to load skills from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const persistSkills = (newSkills: Skill[]) => {
        setSkills(newSkills);
        localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(newSkills));
    };

    const initializeSkills = (initialSkills: Skill[]) => {
        persistSkills(initialSkills);
    };

    const updateSkill = (subject: string, level: number) => {
        const newSkills = skills.map(skill =>
            skill.subject === subject ? { ...skill, level: Math.min(100, Math.max(0, level)) } : skill
        );
        persistSkills(newSkills);
    };

    return (
        <SkillContext.Provider value={{ skills, initializeSkills, updateSkill, isLoading }}>
            {children}
        </SkillContext.Provider>
    );
};