

import React, { useState, useEffect, useRef } from 'react';
// FIX: The bundler/TS setup seems to have trouble with named imports from 'react-router-dom'. Using a namespace import instead.
import * as ReactRouterDOM from 'react-router-dom';
const { useLocation, useNavigate } = ReactRouterDOM;
import { CloseIcon, MicrophoneIcon, SparklesIcon } from '../constants';
import { getSkillCoachResponse } from '../services/geminiService';
import { Skill } from '../types';

export const SkillCoachScreen: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
    const [aiResponse, setAiResponse] = useState<string>('');
    const [userTranscript, setUserTranscript] = useState<string>('');
    
    const navigate = useNavigate();
    const location = useLocation();
    const skills = (location.state as any)?.skills as Skill[] || [];

    const recognitionRef = useRef<any>(null);
    
    useEffect(() => {
        // FIX: Cast window to `any` to access non-standard SpeechRecognition APIs without TypeScript errors.
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
            // Use a functional update to get the latest status. This avoids a dependency on `status`
            // in the useEffect hook, which would cause the recognition instance to be re-created.
            setStatus(currentStatus => {
                if (currentStatus === 'listening') {
                    // This occurs if listening stops without a result (e.g., timeout).
                    return 'idle';
                }
                // If status is 'processing' or 'speaking', we don't change it here.
                // The `utterance.onend` handler will reset the status to 'idle'.
                return currentStatus;
            });
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            let errorMessage: string;

            switch (event.error) {
                case 'no-speech':
                    errorMessage = "I didn't catch that. Could you please tap the mic and speak again?";
                    break;
                case 'audio-capture':
                    errorMessage = "I can't seem to access your microphone. Please check your browser permissions and try again.";
                    break;
                case 'not-allowed':
                    errorMessage = "I don't have permission to use your microphone. Please enable it in your browser settings.";
                    break;
                default:
                    errorMessage = "Sorry, an unexpected error occurred. Please try again.";
                    break;
            }
            
            setAiResponse(errorMessage);
            setStatus('speaking');
            
            const utterance = new SpeechSynthesisUtterance(errorMessage);
            utterance.onend = () => setStatus('idle');
            window.speechSynthesis.speak(utterance);
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
    }, [skills]); // The effect should only re-run if skills change, not on every status update.


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
            case 'listening': return 'Listening... Go ahead, I\'m ready.';
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