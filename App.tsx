


import React, { useContext } from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { HashRouter, Routes, Route, Navigate, Outlet } = ReactRouterDOM;
import { ThemeProvider } from './context/ThemeContext';
import { PlannerProvider } from './context/PlannerContext';
import { SkillProvider, SkillContext } from './context/SkillContext';
import { RoutineProvider } from './context/RoutineContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoalProvider } from './context/GoalContext';

import { Layout } from './components/Layout';
import { SplashScreen } from './pages/SplashScreen';
import { OnboardingScreen } from './pages/OnboardingScreen';
import { LoginScreen } from './pages/LoginScreen';
import { SignUpScreen } from './pages/SignUpScreen';
import { ForgotPasswordScreen } from './pages/ForgotPasswordScreen';
import { HomeScreen } from './pages/HomeScreen';
import { AIChatScreen } from './pages/AIChatScreen';
import { SkillGraphScreen } from './pages/SkillGraphScreen';
import { GoalTrackerScreen } from './pages/GoalTrackerScreen';
import { PlannerScreen } from './pages/PlannerScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { SettingsScreen } from './pages/SettingsScreen';
import { NotificationsScreen } from './pages/NotificationsScreen';
import { AchievementsScreen } from './pages/AchievementsScreen';
import { ResourcesScreen } from './pages/ResourcesScreen';
import { SupportScreen } from './pages/SupportScreen';
import { SkillCoachScreen } from './pages/SkillCoachScreen';
import { SkillSelectionScreen } from './pages/SkillSelectionScreen';
import { RoutineSelectionScreen } from './pages/RoutineSelectionScreen';
import { WelcomeScreen } from './pages/WelcomeScreen';
import { RoadmapsScreen } from './pages/RoadmapsScreen';
import { CareerAdvisorScreen } from './pages/CareerAdvisorScreen';
import { ManageSkillsScreen } from './pages/ManageSkillsScreen';

const ProtectedRoute: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

const PostLoginRedirect: React.FC = () => {
    const skillContext = useContext(SkillContext);
    
    if (!skillContext || skillContext.isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading user data...</div>;
    }

    // If user has no skills, they haven't completed onboarding.
    if (skillContext.skills.length === 0) {
        return <Navigate to="/welcome" replace />;
    }
      
    // Otherwise, they're a returning user.
    return <Navigate to="/home" replace />;
};

const AuthRoute: React.FC = () => {
    const { user, loading } = useAuth();
     if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }
    if (user) {
        // If a user is already logged in, they shouldn't be on the auth pages.
        // Redirect them directly to the main application screen.
        return <Navigate to="/home" replace />;
    }
    return <Outlet />;
};


function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlannerProvider>
          <SkillProvider>
            <GoalProvider>
              <RoutineProvider>
                <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 min-h-screen shadow-2xl shadow-slate-400/20 dark:shadow-slate-950/50">
                    <HashRouter>
                        <Routes>
                            <Route path="/" element={<SplashScreen />} />

                            <Route element={<AuthRoute />}>
                                <Route path="/onboarding" element={<OnboardingScreen />} />
                                <Route path="/login" element={<LoginScreen />} />
                                <Route path="/signup" element={<SignUpScreen />} />
                                <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
                            </Route>

                            <Route element={<ProtectedRoute />}>
                                <Route path="/post-login" element={<PostLoginRedirect />} />
                                <Route path="/welcome" element={<WelcomeScreen />} />
                                <Route path="/skill-selection" element={<SkillSelectionScreen />} />
                                <Route path="/routine-selection" element={<RoutineSelectionScreen />} />
                                
                                {/* Standalone Authenticated Routes */}
                                <Route path="/ai-chat" element={<AIChatScreen />} />
                                <Route path="/settings" element={<SettingsScreen />} />
                                <Route path="/notifications" element={<NotificationsScreen />} />
                                <Route path="/achievements" element={<AchievementsScreen />} />
                                <Route path="/resources" element={<ResourcesScreen />} />
                                <Route path="/support" element={<SupportScreen />} />
                                <Route path="/skill-coach" element={<SkillCoachScreen />} />
                                <Route path="/career-advisor" element={<CareerAdvisorScreen />} />
                                <Route path="/goals" element={<GoalTrackerScreen />} />
                                <Route path="/manage-skills" element={<ManageSkillsScreen />} />
                                
                                <Route element={<Layout />}>
                                    <Route path="/home" element={<HomeScreen />} />
                                    <Route path="/skills" element={<SkillGraphScreen />} />
                                    <Route path="/roadmaps" element={<RoadmapsScreen />} />
                                    <Route path="/planner" element={<PlannerScreen />} />
                                    <Route path="/profile" element={<ProfileScreen />} />
                                </Route>
                            </Route>
                            
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </HashRouter>
                </div>
              </RoutineProvider>
            </GoalProvider>
          </SkillProvider>
        </PlannerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;