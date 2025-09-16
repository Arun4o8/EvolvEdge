import React, { useState, useEffect } from 'react';
import { getAIQuote } from '../services/geminiService';
import { QuoteIcon } from '../constants';

export const QuoteOfTheDay: React.FC = () => {
    const [quote, setQuote] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            setLoading(true);
            const fetchedQuote = await getAIQuote();
            setQuote(fetchedQuote);
            setLoading(false);
        };
        fetchQuote();
    }, []);

    return (
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-700 dark:to-primary-900 text-white p-4 rounded-xl shadow-lg">
            <div className="flex items-start space-x-3">
                <QuoteIcon />
                {loading ? (
                    <div className="animate-pulse flex-grow space-y-2">
                        <div className="h-3 bg-white/30 rounded"></div>
                        <div className="h-3 bg-white/30 rounded w-5/6"></div>
                    </div>
                ) : (
                    <p className="italic text-sm">"{quote}"</p>
                )}
            </div>
        </div>
    );
};
