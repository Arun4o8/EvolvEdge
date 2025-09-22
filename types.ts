
import React from 'react';

export interface Skill {
  subject: string;
  level: number;
}

export interface Goal {
  id: string;
  title: string;
  completed: boolean;
  tasks: { description: string; completed: boolean }[];
}

export interface Achievement {
  id:string;
  title: string;
  description: string;
  unlocked: boolean;
  date?: string;
}

export interface Notification {
    id: string;
    type: 'reminder' | 'milestone' | 'suggestion';
    message: string;
    timestamp: string;
    read: boolean;
}

export interface LearningResource {
    id: string;
    type: 'article' | 'video' | 'exercise';
    title: string;
    source: string;
    url: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
    error?: boolean;
}

export interface ChatConversation {
    id:string;
    title: string;
    messages: ChatMessage[];
    timestamp: string;
    // FIX: Add user_id to align type with database schema and fix usage in AIChatScreen.
    user_id?: string;
}

export interface PlannerEvent {
    id: string;
    date: string; // YYYY-MM-DD
    time: string;
    title: string;
    category: 'work' | 'skill' | 'personal';
}

export interface Routine {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
}