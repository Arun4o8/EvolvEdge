import React from 'react';
import { useState, useRef, useEffect, useContext } from 'react';
import { ChatMessage, PlannerEvent, ChatConversation } from '../types';
import { createAIChat } from '../services/geminiService';
import { SendIcon, SparklesIcon, UserIcon, MicrophoneIcon, PlusIcon, HistoryIcon, TrashIcon, CloseIcon } from '../constants';
import { StandaloneHeader } from '../components/StandaloneHeader';
import { PlannerContext } from '../context/PlannerContext';

const OLD_CHAT_HISTORY_KEY = 'evolvedge-chat-history';
const CONVERSATIONS_KEY = 'evolvedge-chat-conversations';
const ACTIVE_CONVERSATION_ID_KEY = 'evolvedge-active-conversation-id';

const createInitialMessage = (): ChatMessage => ({
    id: '1',
    text: "Hello! How can I help you evolve today? You can ask me to schedule tasks for you.",
    sender: 'ai',
    timestamp: new Date().toISOString()
});

const createNewConversation = (): ChatConversation => {
    const newId = Date.now().toString();
    return {
        id: newId,
        title: 'New Chat',
        messages: [createInitialMessage()],
        timestamp: new Date().toISOString(),
    };
};

export const AIChatScreen: React.FC = () => {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<any | null>(null);
    const recognitionRef = useRef<any | null>(null);
    const plannerContext = useContext(PlannerContext);

    // Load from localStorage on mount
    useEffect(() => {
        let loadedConversations: ChatConversation[] = [];
        try {
            const savedConversationsJson = localStorage.getItem(CONVERSATIONS_KEY);
            const oldHistoryJson = localStorage.getItem(OLD_CHAT_HISTORY_KEY);

            if (!savedConversationsJson && oldHistoryJson) {
                // One-time migration from old format
                const oldMessages = JSON.parse(oldHistoryJson);
                if (Array.isArray(oldMessages) && oldMessages.length > 1) {
                    const firstUserMessage = oldMessages.find((m: ChatMessage) => m.sender === 'user');
                    const title = firstUserMessage ? (firstUserMessage.text.length > 30 ? firstUserMessage.text.substring(0, 27) + '...' : firstUserMessage.text) : 'Imported Chat';
                    const migratedConv: ChatConversation = {
                        id: Date.now().toString(),
                        title: title,
                        messages: oldMessages,
                        timestamp: new Date().toISOString()
                    };
                    loadedConversations.push(migratedConv);
                    localStorage.removeItem(OLD_CHAT_HISTORY_KEY);
                }
            } else if (savedConversationsJson) {
                loadedConversations = JSON.parse(savedConversationsJson);
            }
        } catch (error) {
            console.error("Failed to parse conversations from localStorage", error);
        }

        if (loadedConversations.length === 0) {
            const newConv = createNewConversation();
            loadedConversations.push(newConv);
            setActiveConversationId(newConv.id);
        } else {
            const savedActiveId = localStorage.getItem(ACTIVE_CONVERSATION_ID_KEY);
            if (savedActiveId && loadedConversations.some(c => c.id === savedActiveId)) {
                setActiveConversationId(savedActiveId);
            } else {
                const sorted = [...loadedConversations].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                setActiveConversationId(sorted[0].id);
            }
        }
        setConversations(loadedConversations);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
        }
        if (activeConversationId) {
            localStorage.setItem(ACTIVE_CONVERSATION_ID_KEY, activeConversationId);
        }
    }, [conversations, activeConversationId]);
    
    // Setup Speech Recognition
    useEffect(() => {
        // @ts-ignore
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
            setIsSpeechSupported(true);
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => (prev ? prev + ' ' : '') + transcript);
            };
            
            recognitionRef.current = recognition;

            return () => {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                }
            };
        }
    }, []);

    const initializeChat = async () => {
        const chatSession = await createAIChat();
        chatRef.current = chatSession;
        if (!chatSession) {
            // ... (error handling) ...
        }
    };
    
    useEffect(() => {
        initializeChat();
    }, []);

    const handleToggleListening = () => {
        if (!isSpeechSupported || !recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    const handleNewChat = async () => {
        setIsLoading(true);
        const newConv = createNewConversation();
        setConversations(prev => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
        setInput('');
        await initializeChat(); // Re-initialize for new context
        setIsLoading(false);
    };
    
    const handleSelectConversation = (id: string) => {
        setActiveConversationId(id);
        setShowHistory(false);
    };

    const handleDeleteConversation = (idToDelete: string) => {
        const remaining = conversations.filter(c => c.id !== idToDelete);
        if (remaining.length === 0) {
            const newConv = createNewConversation();
            setConversations([newConv]);
            setActiveConversationId(newConv.id);
        } else {
            setConversations(remaining);
            if (activeConversationId === idToDelete) {
                setActiveConversationId(remaining[0].id);
            }
        }
    };
    
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(scrollToBottom, [conversations, activeConversationId, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentInput = input.trim();
        if (currentInput === '' || isLoading || !plannerContext || !activeConversationId) return;

        const { addEvent } = plannerContext;
        const userMessage: ChatMessage = { id: Date.now().toString(), text: currentInput, sender: 'user', timestamp: new Date().toISOString() };
        
        setConversations(prev => {
            const newConversations = [...prev];
            const activeConvIndex = newConversations.findIndex(c => c.id === activeConversationId);
            if (activeConvIndex !== -1) {
                const activeConv = newConversations[activeConvIndex];
                if (activeConv.messages.filter(m => m.sender === 'user').length === 0) {
                    activeConv.title = currentInput.length > 30 ? currentInput.substring(0, 27) + '...' : currentInput;
                }
                activeConv.messages.push(userMessage);
                activeConv.timestamp = new Date().toISOString();
            }
            return newConversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        });
        
        setInput('');
        setIsLoading(true);

        try {
            if (!chatRef.current) throw new Error("Chat not initialized.");
            
            const streamResult = await chatRef.current.sendMessageStream({ message: currentInput });
            let firstChunk = true, aiMessageId = '', fullText = '';
            
            setIsLoading(false);
            for await (const chunk of streamResult) {
                if(chunk.text) {
                    if (firstChunk) {
                        firstChunk = false;
                        aiMessageId = Date.now().toString() + '-ai';
                        fullText = chunk.text;
                        const newAiMessage: ChatMessage = { id: aiMessageId, text: fullText, sender: 'ai', timestamp: new Date().toISOString() };
                        setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: [...c.messages, newAiMessage] } : c));
                    } else {
                        fullText += chunk.text;
                        setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: c.messages.map(m => m.id === aiMessageId ? { ...m, text: fullText } : m) } : c));
                    }
                }
                 // ... (function calling logic would need similar state update) ...
            }
        } catch (error) {
            console.error("AI chat failed:", error);
            setIsLoading(false);
            const errorMessage: ChatMessage = { id: Date.now().toString(), text: "Sorry, something went wrong.", sender: 'ai', timestamp: new Date().toISOString(), error: true };
            setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: [...c.messages, errorMessage] } : c));
        }
    };
    
    const activeConversation = conversations.find(c => c.id === activeConversationId);
    const messages = activeConversation ? activeConversation.messages : [];

    return (
        <div className="flex flex-col h-screen">
            <StandaloneHeader 
                title="AI Assistant"
                action={
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setShowHistory(true)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Chat History"><HistoryIcon /></button>
                        <button onClick={handleNewChat} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="New Chat"><PlusIcon /></button>
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
                        <div className="overflow-y-auto p-2">
                            {conversations.map(conv => (
                                <div key={conv.id} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${activeConversationId === conv.id ? 'bg-primary-100 dark:bg-primary-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                                    <div onClick={() => handleSelectConversation(conv.id)} className="flex-grow truncate pr-4">
                                        <p className="font-medium truncate">{conv.title}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(conv.timestamp).toLocaleString()}</p>
                                    </div>
                                    <button onClick={() => handleDeleteConversation(conv.id)} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 flex-shrink-0" aria-label="Delete chat"><TrashIcon /></button>
                                </div>
                            ))}
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
                {isLoading && (
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
                            disabled={isLoading}
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
                    <button type="submit" disabled={isLoading || input.trim() === ''} className="bg-primary-600 text-white p-3 rounded-full disabled:bg-primary-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed hover:bg-primary-700 transition-colors flex-shrink-0">
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};