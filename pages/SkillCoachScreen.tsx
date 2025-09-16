import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CloseIcon, MicrophoneIcon, SparklesIcon } from '../constants';
import { getSkillCoachResponse } from '../services/geminiService';
import { Skill } from '../types';

export const SkillCoachScreen: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
    const [aiResponse, setAiResponse] = useState<string>('');
    const [userTranscript, setUserTranscript] = useState<string>('');
    
    const navigate = useNavigate();
    const location = useLocation();
    const skills = location.state?.skills as Skill[] || [];

    const recognitionRef = useRef<any>(null);
    
    useEffect(() => {
        // @ts-ignore
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            console.error("Speech Recognition API not supported.");
            setAiResponse("Sorry, voice commands are not supported on this browser.");
            return;
        }
        
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setStatus('listening');
            setAiResponse('');
            setUserTranscript('');
        };
        
        recognition.onend = () => {
            // Check status to avoid race condition where onresult sets status to 'processing' first
            if (recognitionRef.current && status === 'listening') {
                 setStatus('idle');
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setStatus('idle');
        };

        recognition.onresult = async (event: any) => {
            const transcript = event.results[0][0].transcript;
            setUserTranscript(transcript);
            setStatus('processing');

            try {
                const response = await getSkillCoachResponse(transcript, skills);
                setAiResponse(response);
                setStatus('speaking');
                
                const utterance = new SpeechSynthesisUtterance(response);
                utterance.onend = () => setStatus('idle');
                window.speechSynthesis.speak(utterance);
                
            } catch (error) {
                console.error("Error getting AI response:", error);
                const errorMessage = "Sorry, I couldn't process that. Please try again.";
                setAiResponse(errorMessage);
                setStatus('speaking');
                
                const utterance = new SpeechSynthesisUtterance(errorMessage);
                utterance.onend = () => setStatus('idle');
                window.speechSynthesis.speak(utterance);
            }
        };

        recognitionRef.current = recognition;
        
        return () => {
            window.speechSynthesis.cancel();
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [skills, status]);


    const handleMicClick = () => {
        if (!recognitionRef.current) return;
        
        if (status === 'listening') {
            recognitionRef.current.stop();
        } else if (status === 'idle' || status === 'speaking') {
            window.speechSynthesis.cancel();
            recognitionRef.current.start();
        }
    };
    
    const getStatusText = () => {
        switch (status) {
            case 'listening': return 'Listening...';
            case 'processing': return 'Thinking...';
            case 'speaking': return 'Tap the mic to interrupt and ask a new question.';
            default: return 'Tap the mic and ask about your skills.';
        }
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col z-50 p-6">
            <header className="flex justify-end">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                    <CloseIcon />
                </button>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center text-center">
                <div className={`relative w-48 h-48 flex items-center justify-center transition-all duration-500 ${status !== 'idle' ? 'scale-110' : ''}`}>
                    <div className={`absolute inset-0 bg-primary-500/20 rounded-full ${status === 'listening' || status === 'speaking' ? 'animate-pulse' : ''}`}></div>
                    <div className={`w-32 h-32 bg-primary-500/50 rounded-full flex items-center justify-center`}>
                        {status === 'processing' ? <SparklesIcon /> : <MicrophoneIcon />}
                    </div>
                </div>

                <div className="h-40 mt-8 text-lg font-light text-slate-200 transition-opacity duration-300">
                    {aiResponse && <p>{aiResponse}</p>}
                    {status === 'processing' && userTranscript && <p className="text-slate-400 italic">You: "{userTranscript}"</p>}
                </div>

                <p className="mt-4 text-slate-400 min-h-[20px]">{getStatusText()}</p>
            </main>

            <footer className="flex justify-center items-center pb-8">
                <button 
                    onClick={handleMicClick}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-90 ${status === 'listening' ? 'bg-red-500' : 'bg-primary-600 hover:bg-primary-500'}`}
                    aria-label={status === 'listening' ? 'Stop listening' : 'Start listening'}
                >
                    <MicrophoneIcon />
                </button>
            </footer>
        </div>
    );
};