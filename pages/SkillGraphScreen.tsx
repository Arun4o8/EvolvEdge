
import React, { useContext, useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Skill } from '../types';
import { useTheme } from '../hooks/useTheme';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { useNavigate } = ReactRouterDOM;
import { CloseIcon, MicrophoneIcon, SearchIcon, SparklesIcon } from '../constants';
import { SkillContext } from '../context/SkillContext';
import { getSkillAnalytics, getSkillAssessmentAndRoadmap } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

const SKILL_CATEGORIES = {
  "Tech & Data": ['Coding', 'Data Analysis', 'UX/UI Design', 'Product Mgmt', 'AI/ML'],
  "Communication": ['Public Speaking', 'Writing', 'Negotiation', 'Networking', 'Storytelling'],
  "Creative": ['Graphic Design', 'Video Editing', 'Music Production', 'Photography', 'Creative Writing'],
  "Leadership & Business": ['Leadership', 'Project Mgmt', 'Marketing', 'Sales', 'Business Strategy'],
  "Personal Finance": ['Investing', 'Budgeting', 'Financial Literacy', 'Saving Money'],
  "Wellness": ['Mindfulness', 'Fitness', 'Nutrition', 'Stress Mgmt', 'Sleep Hygiene']
};

export const SkillGraphScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const skillContext = useContext(SkillContext);
  const { user } = useAuth();
  
  const [analytics, setAnalytics] = useState<string>('');
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [newSkillQuery, setNewSkillQuery] = useState('');
  const [assessmentResult, setAssessmentResult] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [isSavingRoadmap, setIsSavingRoadmap] = useState(false);
  const [roadmapSaved, setRoadmapSaved] = useState(false);

  const isDark = theme === 'dark';
  const textColor = isDark ? '#e2e8f0' : '#475569';
  const gridColor = isDark ? '#475569' : '#d1d5db';
  const tooltipStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
  };

  if (!skillContext) return null; // Or a loading spinner
  const { skills, isLoading } = skillContext;
  
  const handleAskCoach = () => {
    navigate('/ai-chat');
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

  const handleGetAssessment = async () => {
    if (!newSkillQuery.trim()) return;
    setIsAssessing(true);
    setAssessmentResult('');
    setRoadmapSaved(false);
    try {
      const result = await getSkillAssessmentAndRoadmap(newSkillQuery, skills);
      setAssessmentResult(result);
    } catch (error) {
      console.error("Failed to get skill assessment:", error);
      setAssessmentResult("Sorry, an error occurred while assessing this skill.");
    } finally {
      setIsAssessing(false);
    }
  };

  const handleSaveRoadmap = async () => {
    if (!user || !newSkillQuery.trim() || !assessmentResult) return;
    setIsSavingRoadmap(true);
    setRoadmapSaved(false);
    try {
        const { error } = await supabase.from('roadmaps').insert({
            user_id: user.id,
            skill_title: newSkillQuery.trim(),
            roadmap_content: assessmentResult,
        });
        if (error) throw error;
        setRoadmapSaved(true);
        setTimeout(() => {
            closeAssessmentModal();
            navigate('/roadmaps');
        }, 1000);
    } catch (error: any) {
        if (error.message.includes('Could not find the table')) {
            console.warn("Backend missing 'roadmaps' table. Roadmap not saved.");
        } else {
            console.error("Error saving roadmap:", error.message);
        }
    } finally {
        setIsSavingRoadmap(false);
    }
  };

  const closeAssessmentModal = () => {
    setIsAssessmentModalOpen(false);
    setAssessmentResult('');
    setNewSkillQuery('');
    setRoadmapSaved(false);
  };

  if (isLoading) {
    return <p>Loading skills...</p>;
  }
  
  const skillToCategory: { [key: string]: string } = {};
  Object.entries(SKILL_CATEGORIES).forEach(([category, skillList]) => {
      skillList.forEach(skill => {
          skillToCategory[skill] = category;
      });
  });

  const groupedSkills = skills.reduce((acc, skill) => {
      const category = skillToCategory[skill.subject] || 'Other';
      if (!acc[category]) {
          acc[category] = [];
      }
      acc[category].push(skill);
      return acc;
  }, {} as Record<string, Skill[]>);

  const categoryOrder = Object.keys(SKILL_CATEGORIES).filter(cat => groupedSkills[cat]);
  if (groupedSkills['Other']) {
      categoryOrder.push('Other');
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-600 dark:text-slate-400">Here's a snapshot of your current skill levels. Ask the AI for an analysis or for coaching!</p>
      
      <div className="space-y-4">
        <button 
          onClick={handleAskCoach}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-md"
        >
          <SparklesIcon />
          Ask Your Master AI
        </button>
        <button 
          onClick={() => setIsAssessmentModalOpen(true)}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-md border border-slate-200 dark:border-slate-600"
        >
          <SearchIcon />
          Assess a New Skill
        </button>
      </div>


      {skills.length > 0 ? (
        <>
          <div className="w-full h-80 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
            {skills.length >= 3 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skills}>
                  <PolarGrid stroke={gridColor} />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: textColor, fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
                  <Radar name="Current Level" dataKey="level" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skills} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: textColor, fontSize: 12 }} />
                      <YAxis type="category" dataKey="subject" width={80} tick={{ fill: textColor, fontSize: 12 }} interval={0} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.5)' }}/>
                      <Bar dataKey="level" name="Current Level" fill="#3b82f6" barSize={20} />
                  </BarChart>
              </ResponsiveContainer>
            )}
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
          
          <div className="space-y-6">
            {categoryOrder.map(category => (
              <div key={category}>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">{category}</h3>
                  <div className="space-y-4">
                      {groupedSkills[category].map(skill => (
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

      {isAssessmentModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeAssessmentModal}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold flex items-center gap-2"><SparklesIcon /> Assess a New Skill</h2>
              <button onClick={closeAssessmentModal} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><CloseIcon /></button>
            </div>
            
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">Enter a skill you'd like to learn, and the AI will create a personalized roadmap for you.</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkillQuery}
                  onChange={(e) => setNewSkillQuery(e.target.value)}
                  placeholder="e.g., 'Python' or 'Digital Marketing'"
                  className="flex-grow px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  autoFocus
                />
                <button onClick={handleGetAssessment} disabled={isAssessing || !newSkillQuery.trim()} className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 disabled:bg-primary-300">
                  {isAssessing ? '...' : 'Assess'}
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-4 pb-4">
              {isAssessing && <p className="text-center p-4">Generating your roadmap...</p>}
              {!isAssessing && assessmentResult && (
                 <div className="space-y-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                        {assessmentResult.split('**').map((part, index) => 
                        index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                        )}
                    </div>
                     <button
                        onClick={handleSaveRoadmap}
                        disabled={isSavingRoadmap || roadmapSaved}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-green-400 dark:disabled:bg-green-800 transition-colors"
                    >
                        {isSavingRoadmap ? 'Saving...' : roadmapSaved ? '✓ Saved!' : 'Save Roadmap'}
                    </button>
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};