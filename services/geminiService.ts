
import { LearningResource, Skill, Goal } from '../types';

let geminiPromise: Promise<{
    ai: any;
    Type: any;
} | null> | null = null;

const model = 'gemini-2.5-flash';

function initializeGemini() {
    if (geminiPromise) {
        return geminiPromise;
    }

    geminiPromise = (async () => {
        // FIX: API key must be retrieved from process.env.API_KEY.
        const API_KEY = process.env.API_KEY;

        if (!API_KEY) {
            console.error("API_KEY environment variable not set. AI features will be disabled.");
            return null;
        }

        try {
            // FIX: Corrected import casing for GoogleGenAI.
            const { GoogleGenAI, Type } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: API_KEY });
            return { ai, Type };
        } catch (error) {
            console.error("Failed to load or initialize @google/genai:", error);
            return null;
        }
    })();
    
    return geminiPromise;
}

export const createAIChat = async (): Promise<any | null> => {
    const gemini = await initializeGemini();
    if (!gemini) return null;

    const tools = {
        functionDeclarations: [
            {
                name: 'create_plan',
                description: 'Creates a new event or task in the user\'s planner. Use to schedule learning sessions, work tasks, or personal appointments.',
                parameters: {
                    type: gemini.Type.OBJECT,
                    properties: {
                        title: { type: gemini.Type.STRING, description: 'The title or name of the event. E.g., "Learn React Hooks".' },
                        date: { type: gemini.Type.STRING, description: 'The date of the event in YYYY-MM-DD format. E.g., "2024-07-26".' },
                        time: { type: gemini.Type.STRING, description: 'The time of the event. E.g., "10:00 AM".' },
                        category: { type: gemini.Type.STRING, description: 'The category of the event. Must be one of: "work", "skill", or "personal".' }
                    },
                    required: ['title', 'date', 'time', 'category']
                }
            },
            {
                name: 'add_new_goal',
                description: 'Adds a new goal to the user\'s goal tracker.',
                parameters: {
                    type: gemini.Type.OBJECT,
                    properties: {
                        goalTitle: { type: gemini.Type.STRING, description: 'The title of the new goal. E.g., "Run a 10k marathon".' }
                    },
                    required: ['goalTitle']
                }
            },
            {
                name: 'add_daily_routine',
                description: 'Adds a new daily routine for the user to practice.',
                parameters: {
                    type: gemini.Type.OBJECT,
                    properties: {
                        routineTitle: { type: gemini.Type.STRING, description: 'The title of the new routine. E.g., "Read for 15 minutes".' },
                        category: { type: gemini.Type.STRING, description: 'A relevant category for the routine. E.g., "Mindfulness", "Learning".' }
                    },
                    required: ['routineTitle', 'category']
                }
            },
            {
                name: 'add_new_skill',
                description: 'Adds a new skill to the user\'s profile for tracking.',
                parameters: {
                    type: gemini.Type.OBJECT,
                    properties: {
                        skillName: { type: gemini.Type.STRING, description: 'The name of the skill to add. E.g., "Python".' }
                    },
                    required: ['skillName']
                }
            },
            {
                name: 'update_skill_level',
                description: 'Updates the user\'s proficiency level for an existing skill.',
                parameters: {
                    type: gemini.Type.OBJECT,
                    properties: {
                        skillName: { type: gemini.Type.STRING, description: 'The name of the skill to update. E.g., "Python".' },
                        newLevel: { type: gemini.Type.NUMBER, description: 'The new proficiency level, from 0 to 100.' }
                    },
                    required: ['skillName', 'newLevel']
                }
            },
            {
                name: 'create_learning_roadmap',
                description: 'Generates and saves a detailed, step-by-step learning roadmap for a new skill.',
                parameters: {
                    type: gemini.Type.OBJECT,
                    properties: {
                        skillName: { type: gemini.Type.STRING, description: 'The skill to create a roadmap for. E.g., "Machine Learning".' }
                    },
                    required: ['skillName']
                }
            }
        ]
    };

    return gemini.ai.chats.create({
        model: model,
        config: {
            systemInstruction: `You are EvolvEdge AI, a personal master AI assistant. You help users track, grow, and optimize their skills, goals, and habits. You have been upgraded with new abilities. You can now directly manage the user's profile by using your tools. You can:
- Schedule events in their planner (\`create_plan\`).
- Add new goals to their goal tracker (\`add_new_goal\`).
- Add new daily routines (\`add_daily_routine\`).
- Add new skills they want to learn (\`add_new_skill\`).
- Update their proficiency level in existing skills (\`update_skill_level\`).
- Generate and save a detailed learning roadmap for a new skill (\`create_learning_roadmap\`).
Be proactive and conversational. When a user asks for help, suggest concrete actions and use your tools to execute them. For example, if they say 'I want to get better at Python', you can add 'Python' as a skill, and ask if they want a learning roadmap.`
        },
        tools: [tools]
    });
};

export const getAIQuote = async (): Promise<string> => {
    const gemini = await initializeGemini();
    const fallbackQuote = "The only way to do great work is to love what you do.";

    if (!gemini) {
        return fallbackQuote;
    }

    try {
        const response = await gemini.ai.models.generateContent({
            model: model,
            contents: "Generate one short, impactful, motivational quote about personal growth or learning. Return only the quote text, without any introductory phrases or quotation marks.",
            config: {
                maxOutputTokens: 50,
                temperature: 0.9,
                // FIX: Added thinkingBudget because maxOutputTokens is set for gemini-2.5-flash model
                thinkingConfig: { thinkingBudget: 10 }
            }
        });
        // FIX: The `.text` property directly provides the string output from the `GenerateContentResponse`.
        const text = response.text;
        if (!text) {
            console.warn("AI quote response was empty or blocked.");
            return fallbackQuote;
        }
        return text.trim();
    } catch (error) {
        console.error("Failed to get AI quote:", error);
        return fallbackQuote;
    }
};

export const getAIRecommendations = async (): Promise<LearningResource[]> => {
    const gemini = await initializeGemini();

    const fallbackData: LearningResource[] = [
         { id: '1', type: 'article', title: 'The Power of Habit: Why We Do What We Do', source: 'Charles Duhigg', url: '#' },
         { id: '2', type: 'video', title: 'How to Learn Anything in 20 Hours', source: 'Josh Kaufman | TEDx', url: '#' },
         { id: '3', type: 'exercise', title: 'Practice the Pomodoro Technique', source: 'Productivity Challenge', url: '#' },
         { id: '4', type: 'article', title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits', source: 'James Clear', url: '#' },
    ];

    if (!gemini) {
        return fallbackData.slice(0, 2);
    }
    
    try {
        const response = await gemini.ai.models.generateContent({
            model: model,
            contents: "List exactly 4 popular and highly-rated learning resources (a mix of articles, videos, or exercises) for personal development and productivity. Provide a URL for each.",
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: gemini.Type.OBJECT,
                    properties: {
                        resources: {
                            type: gemini.Type.ARRAY,
                            items: {
                                type: gemini.Type.OBJECT,
                                properties: {
                                    type: { type: gemini.Type.STRING, description: "Can be 'article', 'video', or 'exercise'." },
                                    title: { type: gemini.Type.STRING, description: "The title of the resource." },
                                    source: { type: gemini.Type.STRING, description: "The author or source (e.g., 'James Clear', 'TEDx')." },
                                    url: { type: gemini.Type.STRING, description: "A valid URL to the resource." }
                                },
                                required: ['type', 'title', 'source', 'url']
                            }
                        }
                    },
                    required: ['resources']
                }
            }
        });

        // FIX: The `.text` property directly provides the string output from the `GenerateContentResponse`.
        const jsonText = response.text;
        if (!jsonText) {
            console.warn("AI recommendations response was empty or blocked.");
            return fallbackData;
        }

        const parsedResponse = JSON.parse(jsonText.trim());
        const resources = parsedResponse.resources || [];
        
        return resources.map((r: any, index: number) => ({ ...r, id: (index + 1).toString() } as LearningResource));

    } catch (error) {
        console.error("Failed to get AI recommendations:", error);
        return fallbackData;
    }
};

export const getSkillCoachResponse = async (question: string, skills: Skill[]): Promise<string> => {
    const gemini = await initializeGemini();
    const fallbackResponse = "I'm sorry, I can't provide skill advice right now. Please try again later.";

    if (!gemini) {
        return fallbackResponse;
    }

    const skillSummary = skills.map(s => `${s.subject} is at ${s.level}%`).join(', ');

    try {
        const response = await gemini.ai.models.generateContent({
            model: model,
            contents: `The user's current skills are: ${skillSummary}. The user asked: "${question}"`,
            config: {
                systemInstruction: "You are an AI Skill Coach. Your role is to provide clear, concise, and encouraging advice based on the user's skill levels. Answer their questions about how to improve, what to learn next, or explain concepts related to their skills. Keep your responses conversational and brief, as they will be spoken aloud.",
                temperature: 0.7,
                maxOutputTokens: 150,
                // FIX: Added thinkingBudget because maxOutputTokens is set for gemini-2.5-flash model
                thinkingConfig: { thinkingBudget: 50 },
            }
        });
        // FIX: The `.text` property directly provides the string output from the `GenerateContentResponse`.
        const text = response.text;
        if (!text) {
             console.warn("AI skill coach response was empty or blocked.");
             return fallbackResponse;
        }
        return text.trim();
    } catch (error) {
        console.error("Failed to get AI skill coach response:", error);
        return fallbackResponse;
    }
};

export const getSkillAnalytics = async (skills: Skill[]): Promise<string> => {
    const gemini = await initializeGemini();
    const fallbackResponse = "I'm sorry, I can't provide skill analytics right now. Please try again later.";

    if (!gemini) {
        return fallbackResponse;
    }
    
    if (skills.length === 0) {
        return "You haven't selected any skills to analyze. Go to the skills page to add some!";
    }

    const skillSummary = skills.map(s => `${s.subject} at ${s.level}%`).join(', ');

    try {
        const response = await gemini.ai.models.generateContent({
            model: model,
            contents: `The user's skills are: ${skillSummary}.`,
            config: {
                systemInstruction: `You are an expert personal development coach. Analyze the user's skills and provide actionable insights.
                Format your response with clear sections. Use **bold** for headings.
                1.  **Overall Summary:** A brief, encouraging summary of their skill profile.
                2.  **Strongest Skill:** Identify their strongest skill, explain why it's valuable, and suggest how they can leverage it.
                3.  **Area for Improvement:** Identify their weakest skill and provide a concrete, actionable tip to improve it this week.
                4.  **Suggested Focus:** Recommend one or two skills to focus on for balanced growth.`,
                temperature: 0.7,
                maxOutputTokens: 400,
                // FIX: Added thinkingBudget because maxOutputTokens is set for gemini-2.5-flash model
                thinkingConfig: { thinkingBudget: 100 },
            }
        });
        // FIX: The `.text` property directly provides the string output from the `GenerateContentResponse`.
        const text = response.text;
        if (!text) {
             console.warn("AI skill analytics response was empty or blocked.");
             return fallbackResponse;
        }
        return text.trim();
    } catch (error) {
        console.error("Failed to get AI skill analytics:", error);
        return fallbackResponse;
    }
};

export const getSkillAssessmentAndRoadmap = async (newSkill: string, existingSkills: Skill[]): Promise<string> => {
    const gemini = await initializeGemini();
    const fallbackResponse = "I'm sorry, I can't provide a skill assessment right now. Please try again later.";

    if (!gemini) {
        return fallbackResponse;
    }
    
    const skillSummary = existingSkills.length > 0
        ? `Their current skills are: ${existingSkills.map(s => `${s.subject} at ${s.level}%`).join(', ')}.`
        : "They have not listed any existing skills yet.";

    try {
        const response = await gemini.ai.models.generateContent({
            model: model,
            contents: `The user wants to learn a new skill: "${newSkill}". ${skillSummary}`,
            config: {
                systemInstruction: `You are an expert learning coach. A user wants to learn a new skill. Assume they are a complete beginner in the new skill.
                
                Format your response with clear sections using Markdown. Use **bold** for headings.
                1.  **Initial Assessment:** Briefly assess how their existing skills (if any) might help them learn the new one and provide encouragement.
                2.  **Learning Roadmap:** Create a step-by-step plan with 3 clear phases (e.g., Phase 1: Foundations, Phase 2: Practical Application, Phase 3: Advanced Topics). For each phase, list 2-3 key topics, projects, or concepts to focus on.
                
                Keep the tone positive, concise, and actionable.`,
                temperature: 0.7,
                maxOutputTokens: 500,
                // FIX: Added thinkingBudget because maxOutputTokens is set for gemini-2.5-flash model
                thinkingConfig: { thinkingBudget: 100 },
            }
        });
        const text = response.text;
        if (!text) {
             console.warn("AI skill assessment response was empty or blocked.");
             return fallbackResponse;
        }
        return text.trim();
    } catch (error) {
        console.error("Failed to get AI skill assessment:", error);
        return fallbackResponse;
    }
};

export const getCareerAdvice = async (skills: Skill[], goals: Pick<Goal, 'title' | 'completed'>[]): Promise<string> => {
    const gemini = await initializeGemini();
    const fallbackResponse = "I'm sorry, I can't provide career advice right now. Please try again later.";

    if (!gemini) {
        return fallbackResponse;
    }

    if (skills.length === 0 && goals.length === 0) {
        return "You haven't added any skills or goals yet. Add some from the Skills and Profile pages so I can give you personalized career advice!";
    }

    const skillSummary = skills.length > 0
        ? `Current Skills: ${skills.map(s => `${s.subject} (Proficiency: ${s.level}/100)`).join(', ')}.`
        : "No skills listed.";

    const goalSummary = goals.length > 0
        ? `Current Goals: ${goals.map(g => `${g.title} (${g.completed ? 'Completed' : 'In Progress'})`).join(', ')}.`
        : "No goals listed.";

    try {
        const response = await gemini.ai.models.generateContent({
            model: model,
            contents: `Based on the user's profile, provide career advice.\n\n${skillSummary}\n${goalSummary}`,
            config: {
                systemInstruction: `You are an expert career advisor. Your goal is to give actionable, encouraging, and personalized career recommendations based on the user's skills and goals.
                
                Format your response with clear sections using Markdown. Use **bold** for headings.
                1.  **Career Path Suggestions:** Based on their current skills and goals, suggest 2-3 specific job roles or career paths that would be a good fit. For each, briefly explain why.
                2.  **Skill Gap Analysis:** Identify any key skills they might be missing for these roles and suggest how their current skills can be leveraged.
                3.  **Actionable Roadmap:** Provide a simple, 3-step action plan to help them move towards these career goals. This could include learning a new skill, a type of project to build, or networking advice.
                
                Keep the tone positive and empowering.`,
                temperature: 0.8,
                maxOutputTokens: 600,
                // FIX: Added thinkingBudget because maxOutputTokens is set for gemini-2.5-flash model
                thinkingConfig: { thinkingBudget: 100 },
            }
        });
        const text = response.text;
        if (!text) {
             console.warn("AI career advice response was empty or blocked.");
             return fallbackResponse;
        }
        return text.trim();
    } catch (error) {
        console.error("Failed to get AI career advice:", error);
        return fallbackResponse;
    }
};
