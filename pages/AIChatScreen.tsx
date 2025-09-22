
import React from 'react';
import { useState, useRef, useEffect, useContext } from 'react';
import { ChatMessage, PlannerEvent, ChatConversation } from '../types';
import { createAIChat, getSkillAssessmentAndRoadmap } from '../services/geminiService';
import { SendIcon, SparklesIcon, UserIcon, MicrophoneIcon, PlusIcon, HistoryIcon, TrashIcon, CloseIcon, SearchIcon } from '../constants';
import { StandaloneHeader } from '../components/StandaloneHeader';
import { PlannerContext } from '../context/PlannerContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { SkillContext } from '../context/SkillContext';
import { useGoals } from '../context/GoalContext';
import { RoutineContext } from '../context/RoutineContext';

const createInitialMessage = (): ChatMessage => ({
    id: '1',
    text: "Hello! I am your personal Master AI. How can I help you evolve today? I can now manage your skills, goals, routines, and planner.",
    sender: 'ai',
    timestamp: new Date().toISOString()
});

const createMockConversation = (): ChatConversation => ({
    id: 'mock-conv-1',
    title: 'Mock Conversation',
    messages: [],
    timestamp: new Date().toISOString()
});

export const AIChatScreen: React.FC = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([createInitialMessage()]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<any | null>(null);
    const recognitionRef = useRef<any | null>(null);

    const plannerContext = useContext(PlannerContext);
    const skillContext = useContext(SkillContext);
    const goalContext = useGoals();
    const routineContext = useContext(RoutineContext);


    useEffect(() => {
        if (!user) return;

        const fetchConversations = async () => {
            setIsFetchingHistory(true);
            try {
                const { data, error } = await supabase
                    .from('chat_conversations')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('timestamp', { ascending: false });

                if (error) throw error;
                
                if (data && data.length > 0) {
                    setConversations(data as ChatConversation[]);
                    setActiveConversationId(data[0].id);
                } else {
                    handleNewChat(true); // Create a new chat if none exist
                }

            } catch (error: any) {
                if (error.message.includes('Could not find the table')) {
                     console.warn("Backend missing 'chat_conversations' table. Falling back to mock data.");
                     const mockConv = createMockConversation();
                     setConversations([mockConv]);
                     setActiveConversationId(mockConv.id);
                } else {
                    console.error("Error fetching conversations:", error.message);
                }
            } finally {
                setIsFetchingHistory(false);
            }
        };
        fetchConversations();
    }, [user]);

    useEffect(() => {
        if (!activeConversationId) return;
        
        // Don't fetch messages for mock conversations
        if (activeConversationId.startsWith('mock-')) {
            setMessages([createInitialMessage()]);
            return;
        }

        const fetchMessages = async () => {
            try {
                const { data, error } = await supabase
                    .from('chat_messages')
                    .select('*')
                    .eq('conversation_id', activeConversationId)
                    .order('timestamp', { ascending: true });
                
                if (error) throw error;

                if (data && data.length > 0) {
                    setMessages(data as ChatMessage[]);
                } else {
                     setMessages([createInitialMessage()]);
                }
            } catch (error: any) {
                if (error.message.includes('Could not find the table')) {
                     console.warn("Backend missing 'chat_messages' table. Using in-memory messages.");
                     setMessages([createInitialMessage()]);
                } else {
                    console.error("Error fetching messages:", error.message);
                }
            }
        };
        fetchMessages();
    }, [activeConversationId]);
    
    useEffect(() => {
        // FIX: Property 'SpeechRecognition' does not exist on type 'Window & typeof globalThis'. Cast to any to fix.
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
            setIsSpeechSupported(true);
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => { console.error('Speech recognition error:', event.error); setIsListening(false); };
            recognition.onresult = (event: any) => { setInput(prev => (prev ? prev + ' ' : '') + event.results[0][0].transcript); };
            recognitionRef.current = recognition;
            return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
        }
    }, []);

    const initializeChat = async () => {
        const chatSession = await createAIChat();
        chatRef.current = chatSession;
        if (!chatSession) {
            setMessages(prev => [...prev, { id: 'init-error', text: "Could not connect to AI assistant.", sender: 'ai', timestamp: new Date().toISOString(), error: true }]);
        }
    };
    
    useEffect(() => { initializeChat(); }, []);

    const handleToggleListening = () => { if (!isSpeechSupported || !recognitionRef.current) return; isListening ? recognitionRef.current.stop() : recognitionRef.current.start(); };

    const handleNewChat = async (isInitial = false) => {
        if (!user) return;
        setIsSending(true);

        const tempId = `mock-conv-${Date.now()}`;
        const newConv: ChatConversation = {
            id: tempId,
            user_id: user.id,
            title: 'New Chat',
            timestamp: new Date().toISOString(),
            messages: []
        };
        
        if(!isInitial) {
            setConversations(prev => [newConv, ...prev]);
        }
        setActiveConversationId(newConv.id);
        setMessages([createInitialMessage()]);
        setInput('');
        await initializeChat();
        
        try {
            const { data, error } = await supabase.from('chat_conversations').insert({ user_id: user.id, title: 'New Chat' }).select().single();
            if (error) throw error;
            if (data) {
                setConversations(prev => prev.map(c => c.id === tempId ? data as ChatConversation : c));
                setActiveConversationId(data.id);
            }
        } catch (error: any) {
            if (error.message.includes('Could not find the table')) {
                 console.warn("Backend missing 'chat_conversations' table. New chat only created in local state.");
            } else {
                console.error("Failed to create new chat", error.message);
                setConversations(prev => prev.filter(c => c.id !== tempId));
            }
        } finally {
            setIsSending(false);
        }
    };
    
    const handleSelectConversation = (id: string) => { setActiveConversationId(id); setShowHistory(false); };

    const handleDeleteConversation = async (idToDelete: string) => {
        const oldConversations = conversations;
        const remaining = conversations.filter(c => c.id !== idToDelete);
        setConversations(remaining);
        if (activeConversationId === idToDelete) { remaining.length > 0 ? setActiveConversationId(remaining[0].id) : await handleNewChat(); }
        
        try {
            const { error } = await supabase.from('chat_conversations').delete().eq('id', idToDelete);
            if (error) throw error;
        } catch(error: any) {
             if (error.message.includes('Could not find the table')) {
                console.warn("Backend missing 'chat_conversations' table. Conversation only deleted from local state.");
             } else {
                console.error("Failed to delete conversation", error.message);
                setConversations(oldConversations);
             }
        }
    };
    
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [messages]);

    const saveRoadmap = async (skillTitle: string, roadmapContent: string): Promise<{ success: boolean; message: string }> => {
        if (!user) return { success: false, message: "User not logged in." };
        try {
            const { error } = await supabase.from('roadmaps').insert({
                user_id: user.id,
                skill_title: skillTitle.trim(),
                roadmap_content: roadmapContent,
            });
            if (error) throw error;
            return { success: true, message: `Roadmap for ${skillTitle} saved successfully.` };
        } catch (error: any) {
            if (error.message.includes('Could not find the table')) {
                console.warn("Backend missing 'roadmaps' table. Roadmap not saved.");
                return { success: false, message: "Could not save roadmap due to a database configuration issue." };
            }
            console.error("Error saving roadmap:", error.message);
            return { success: false, message: "An error occurred while saving the roadmap." };
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (currentInput === '' || isSending || !user || !activeConversationId || !plannerContext || !skillContext || !goalContext || !routineContext ) return;

        setIsSending(true);
        setInput('');

        const userMessage: ChatMessage = { id: `temp-user-${Date.now()}`, text: currentInput, sender: 'user', timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);

        try {
            if (!activeConversationId.startsWith('mock-')) {
                await supabase.from('chat_messages').insert({ text: currentInput, sender: 'user', conversation_id: activeConversationId });
            }
            
            if (messages.length <= 1) { 
                const newTitle = currentInput.substring(0, 30) + (currentInput.length > 30 ? '...' : '');
                setConversations(prev => prev.map(c => c.id === activeConversationId ? {...c, title: newTitle} : c));
                if (!activeConversationId.startsWith('mock-')) {
                    await supabase.from('chat_conversations').update({ title: newTitle }).eq('id', activeConversationId);
                }
            }
            
            if (!chatRef.current) throw new Error("Chat not initialized.");
            
            let response = await chatRef.current.sendMessage({ message: currentInput });

            // Loop to handle multiple sequential tool calls
            while (true) {
                const functionCallPart = response.candidates?.[0]?.content?.parts?.find((part: any) => part.functionCall);
                if (!functionCallPart) break;
                
                const { name, args } = functionCallPart.functionCall;
                let functionResponse = { success: false, message: 'Function not recognized or failed.' };

                if (name === 'create_plan' && args.title && args.date && args.time && args.category) {
                    plannerContext.addEvent(args);
                    functionResponse = { success: true, message: `Event '${args.title}' scheduled.` };
                } else if (name === 'add_new_goal' && args.goalTitle) {
                    await goalContext.addGoal({ title: args.goalTitle });
                    functionResponse = { success: true, message: `Goal '${args.goalTitle}' has been added.` };
                } else if (name === 'add_new_skill' && args.skillName) {
                    await skillContext.addSkill({ subject: args.skillName });
                    functionResponse = { success: true, message: `Skill '${args.skillName}' has been added to your profile.` };
                } else if (name === 'update_skill_level' && args.skillName && args.newLevel !== undefined) {
                    skillContext.updateSkill(args.skillName, args.newLevel);
                    functionResponse = { success: true, message: `Skill '${args.skillName}' updated to ${args.newLevel}%.` };
                } else if (name === 'add_daily_routine' && args.routineTitle && args.category) {
                    routineContext.initializeRoutines([{ title: args.routineTitle, category: args.category }]);
                    functionResponse = { success: true, message: `Routine '${args.routineTitle}' has been added.` };
                } else if (name === 'create_learning_roadmap' && args.skillName) {
                    const roadmapContent = await getSkillAssessmentAndRoadmap(args.skillName, skillContext.skills);
                    if (roadmapContent.includes("Sorry")) {
                         functionResponse = { success: false, message: roadmapContent };
                    } else {
                        const saveResult = await saveRoadmap(args.skillName, roadmapContent);
                        functionResponse = saveResult;
                    }
                }

                response = await chatRef.current.sendMessage({ message: { functionResponse: { name, response: functionResponse } } });
            }
            
            const aiText = response.text;
            if (aiText) {
                const aiMessage: ChatMessage = { id: `temp-ai-${Date.now()}`, text: aiText, sender: 'ai', timestamp: new Date().toISOString() };
                setMessages(prev => [...prev, aiMessage]);
                if (!activeConversationId.startsWith('mock-')) {
                    await supabase.from('chat_messages').insert({ text: aiText, sender: 'ai', conversation_id: activeConversationId });
                }
            } else if (!response.candidates?.[0]?.content?.parts?.find((part: any) => part.functionCall)) {
                setMessages(prev => [...prev, { id: Date.now().toString(), text: "I'm not sure how to respond to that.", sender: 'ai', timestamp: new Date().toISOString(), error: true }]);
            }

        } catch (error: any) {
            console.error("AI chat failed:", error.message);
            setMessages(prev => [...prev, { id: Date.now().toString(), text: "Sorry, something went wrong.", sender: 'ai', timestamp: new Date().toISOString(), error: true }]);
        } finally {
            setIsSending(false);
        }
    };
    
    const filteredConversations = conversations.filter(c => c.title.toLowerCase().includes(historySearch.toLowerCase()));
    
    return (
        <div className="flex flex-col h-screen">
            <StandaloneHeader 
                title="AI Assistant"
                action={
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setShowHistory(true)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Chat History"><HistoryIcon /></button>
                        <button onClick={() => handleNewChat(false)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="New Chat"><PlusIcon /></button>
                    </div>
                }
            />
            
            {showHistory && (
                <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center p-4" onClick={() => setShowHistory(false)}>
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-bold">Chat History</h2>
                            <button onClick={() => setShowHistory(false)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><CloseIcon /></button>
                        </div>
                        <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by title..."
                                    value={historySearch}
                                    onChange={(e) => setHistorySearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="overflow-y-auto p-2">
                            {isFetchingHistory ? (
                                <p className="p-4 text-center">Loading history...</p>
                            ) : conversations.length === 0 ? (
                                <p className="p-4 text-center text-slate-500 dark:text-slate-400">Your chat history is empty.</p>
                            ) : filteredConversations.length > 0 ? (
                                filteredConversations.map(conv => (
                                    <div key={conv.id} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${activeConversationId === conv.id ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                                        <div onClick={() => handleSelectConversation(conv.id)} className="flex-grow truncate pr-4">
                                            <p className="font-medium truncate">{conv.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(conv.timestamp).toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => handleDeleteConversation(conv.id)} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 flex-shrink-0" aria-label="Delete chat"><TrashIcon /></button>
                                    </div>
                                ))
                            ) : (
                                <p className="p-4 text-center text-slate-500 dark:text-slate-400">No conversations match your search.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0"><SparklesIcon/></div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${
                            message.sender === 'user' 
                                ? 'bg-primary-600 text-white rounded-br-none' 
                                : message.error 
                                    ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-bl-none'
                                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                        }`}>
                            <p className="whitespace-pre-wrap">{message.text}</p>
                        </div>
                        {message.sender === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 text-slate-500 flex items-center justify-center flex-shrink-0"><UserIcon/></div>}
                    </div>
                ))}
                {isSending && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0"><SparklesIcon/></div>
                        <div className="max-w-xs p-3 rounded-2xl bg-white dark:bg-slate-700 rounded-bl-none">
                            <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-center space-x-3">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Ask me anything..."}
                            className="w-full block pl-4 pr-12 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                            disabled={isSending}
                        />
                         {isSpeechSupported && (
                            <button
                                type="button"
                                onClick={handleToggleListening}
                                className={`absolute inset-y-0 right-0 flex items-center pr-4 transition-colors ${
                                    isListening ? 'text-red-500 animate-pulse' : 'text-slate-500 hover:text-primary-600'
                                }`}
                                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                            >
                                <MicrophoneIcon />
                            </button>
                        )}
                    </div>
                    <button type="submit" disabled={isSending || input.trim() === ''} className="bg-primary-600 text-white p-3 rounded-full disabled:bg-primary-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors flex-shrink-0">
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};