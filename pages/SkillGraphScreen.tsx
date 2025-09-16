import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Skill } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { MicrophoneIcon } from '../constants';

const data: Skill[] = [
  { subject: 'Leadership', level: 85, fullMark: 100 },
  { subject: 'Coding', level: 90, fullMark: 100 },
  { subject: 'Public Speaking', level: 65, fullMark: 100 },
  { subject: 'Project Mgmt', level: 75, fullMark: 100 },
  { subject: 'Marketing', level: 50, fullMark: 100 },
  { subject: 'Design', level: 70, fullMark: 100 },
];

export const SkillGraphScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#475569';
  const gridColor = isDark ? '#475569' : '#d1d5db';
  
  const handleAskCoach = () => {
    navigate('/skill-coach', { state: { skills: data } });
  };

  return (
    <div className="space-y-6">
      <p className="text-slate-600 dark:text-slate-400">Here's a snapshot of your current skill levels. Keep tracking your learning to see them grow!</p>
      
       <button 
        onClick={handleAskCoach}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
      >
        <MicrophoneIcon />
        Ask AI Skill Coach
      </button>

      <div className="w-full h-80 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
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
       <div className="space-y-4">
        {data.map(skill => (
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
    </div>
  );
};