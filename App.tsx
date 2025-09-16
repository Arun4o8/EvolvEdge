
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { PlannerProvider } from './context/PlannerContext';

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

function App() {
  return (
    <ThemeProvider>
      <PlannerProvider>
        <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 min-h-screen shadow-2xl shadow-slate-400/20 dark:shadow-slate-950/50">
            <HashRouter>
                <Routes>
                    <Route path="/" element={<SplashScreen />} />
                    <Route path="/onboarding" element={<OnboardingScreen />} />
                    <Route path="/login" element={<LoginScreen />} />
                    <Route path="/signup" element={<SignUpScreen />} />
                    <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
                    
                    {/* Authenticated Routes with Layout */}
                    <Route path="/home" element={<Layout />}>
                        <Route index element={<HomeScreen />} />
                    </Route>
                    <Route path="/skills" element={<Layout />}>
                        <Route index element={<SkillGraphScreen />} />
                    </Route>
                    <Route path="/goals" element={<Layout />}>
                        <Route index element={<GoalTrackerScreen />} />
                    </Route>
                    <Route path="/planner" element={<Layout />}>
                        <Route index element={<PlannerScreen />} />
                    </Route>
                    <Route path="/profile" element={<Layout />}>
                        <Route index element={<ProfileScreen />} />
                    </Route>

                    {/* Standalone Authenticated Routes */}
                    <Route path="/ai-chat" element={<AIChatScreen />} />
                    <Route path="/settings" element={<SettingsScreen />} />
                    <Route path="/notifications" element={<NotificationsScreen />} />
                    <Route path="/achievements" element={<AchievementsScreen />} />
                    <Route path="/resources" element={<ResourcesScreen />} />
                    <Route path="/support" element={<SupportScreen />} />
                    
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </HashRouter>
        </div>
      </PlannerProvider>
    </ThemeProvider>
  );
}

export default App;
