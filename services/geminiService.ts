import { LearningResource, Skill } from '../types';

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
        const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

        if (!API_KEY) {
            console.error("API_KEY environment variable not set. AI features will be disabled.");
            return null;
        }

        try {
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

    const plannerTool = {
        functionDeclarations: [
            {
                name: 'create_plan',
                description: 'Creates a new event or task in the user\'s planner. Use to schedule learning sessions, work tasks, or personal appointments.',
                parameters: {
                    type: gemini.Type.OBJECT,
                    properties: {
                        title: {
                            type: gemini.Type.STRING,
                            description: 'The title or name of the event. E.g., "Learn React Hooks".'
                        },
                        date: {
                            type: gemini.Type.STRING,
                            description: 'The date of the event in YYYY-MM-DD format. If the user says "today" or "tomorrow", calculate the appropriate date. E.g., "2024-07-26".'
                        },
                        time: {
                            type: gemini.Type.STRING,
                            description: 'The time of the event. E.g., "10:00 AM".'
                        },
                        category: {
                            type: gemini.Type.STRING,
                            description: 'The category of the event. Must be one of: "work", "skill", or "personal".'
                        }
                    },
                    required: ['title', 'date', 'time', 'category']
                }
            }
        ]
    };

    return gemini.ai.chats.create({
        model: model,
        config: {
            systemInstruction: 'You are EvolvEdge AI, a smart personal development assistant. You help users track, grow, and optimize their skills, goals, and habits by providing guidance, insights, and personalized recommendations. You can also schedule events in the user\'s planner by using the `create_plan` tool. Keep your responses concise, encouraging, and actionable.'
        },
        tools: [plannerTool]
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
                thinkingConfig: { thinkingBudget: 10 }
            }
        });
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
            }
        });
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