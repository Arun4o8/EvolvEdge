import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
// FIX: The bundler/TS setup seems to have trouble with named imports from '@supabase/supabase-js', causing type and method resolution to fail.
// Using a namespace import as a workaround, similar to fixes in other parts of the application.
import * as Supabase from '@supabase/supabase-js';

// Define types from the namespace import.
type Session = Supabase.Session;
type User = Supabase.User;
type AuthError = Supabase.AuthError;
type SignUpWithPasswordCredentials = Supabase.SignUpWithPasswordCredentials;
// FIX: Replaced `UserUpdate` with `UserAttributes` as it is the correct type for `updateUser` arguments.
type UserUpdate = Supabase.UserAttributes;

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (args: SignUpWithPasswordCredentials) => Promise<{ data: any; error: AuthError | null }>;
    signInWithPassword: (args: SignUpWithPasswordCredentials) => Promise<{ data: any; error: AuthError | null }>;
    signInWithGoogle: () => Promise<{ data: any; error: AuthError | null }>;
    signOut: () => Promise<{ error: AuthError | null }>;
    updateUser: (args: UserUpdate) => Promise<{ data: { user: User | null }; error: AuthError | null; }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };
        getSession();
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);
    
    const signUp = async (credentials: SignUpWithPasswordCredentials) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signUp(credentials);
        setLoading(false);
        return { data, error };
    };

    const signInWithPassword = async (credentials: SignUpWithPasswordCredentials) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword(credentials);
        setLoading(false);
        return { data, error };
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        // setLoading will be handled by onAuthStateChange
        return { data, error };
    };

    const signOut = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        // user/session will be cleared by onAuthStateChange
        setLoading(false);
        return { error };
    };

    const updateUser = async (args: UserUpdate) => {
        const { data, error } = await supabase.auth.updateUser(args);
        // The onAuthStateChange listener will automatically update the user state.
        return { data, error };
    };

    const value: AuthContextType = {
        user,
        session,
        loading,
        signUp,
        signInWithPassword,
        signInWithGoogle,
        signOut,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
