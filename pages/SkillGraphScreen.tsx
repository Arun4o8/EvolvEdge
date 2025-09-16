import React, { useContext, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skill } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { MicrophoneIcon, SparklesIcon } from '../constants';
import { SkillContext } from '../context/SkillContext';
import { getSkillAnalytics } from '../services/geminiService';

export const SkillGraphScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const skillContext = useContext(SkillContext);
  
  const [analytics, setAnalytics] = useState<string>('');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#475569';
  const gridColor = isDark ? '#475569' : '#d1d5db';

  if (!skillContext) return null; // Or a loading spinner
  const { skills, isLoading } = skillContext;
  
  const handleAskCoach = () => {
    navigate('/skill-coach', { state: { skills } });
  };
  
  const handleGetAnalytics = async () => {
    setLoadingAnalytics(true);
    setAnalytics('');
    try {
      const result = await getSkillAnalytics(skills);
      setAnalytics(result);
    } catch (error) {
      console.error("Failed to get skill analytics:", error);
      setAnalytics("Sorry, an error occurred while analyzing your skills.");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (isLoading) {
    return <p>Loading skills...</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-600 dark:text-slate-400">Here's a snapshot of your current skill levels. Ask the AI for an analysis or for coaching!</p>
      
      <button 
        onClick={handleAskCoach}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
      >
        <MicrophoneIcon />
        Ask AI Skill Coach
      </button>

      {skills.length > 0 ? (
        <>
          <div className="w-full h-80 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skills}>
                <PolarGrid stroke={gridColor} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: textColor, fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                <Radar name="Current Level" dataKey="level" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <SparklesIcon />
              AI-Powered Analytics
            </h3>
            {analytics ? (
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {analytics.split('**').map((part, index) => 
                  index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                )}
              </div>
            ) : (
              <button
                onClick={handleGetAnalytics}
                disabled={loadingAnalytics}
                className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {loadingAnalytics ? 'Analyzing...' : 'Analyze My Skills'}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {skills.map(skill => (
              <div key={skill.subject} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{skill.subject}</span>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{skill.level}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${skill.level}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-10 px-4 bg-white dark:bg-slate-800 rounded-lg">
          <p className="text-slate-500 dark:text-slate-400">You haven't selected any skills yet.</p>
          <button onClick={() => navigate('/skill-selection')} className="mt-4 font-medium text-primary-600 hover:underline dark:text-primary-400">
            Select your skills to get started!
          </button>
        </div>
      )}
    </div>
  );
};