import React from 'react';
import { StandaloneHeader } from '../components/StandaloneHeader';

const faqs = [
    { q: 'How does the AI work?', a: 'Our AI analyzes your goals and progress to provide personalized recommendations. It learns from your interactions to become more helpful over time.' },
    { q: 'Is my data secure?', a: 'Yes, we take data privacy very seriously. All your personal information is encrypted and stored securely.' },
    { q: 'How do I track a new skill?', a: 'Navigate to the "Skills" page and use the "Add New Skill" button to start tracking your progress.' },
];

export const SupportScreen: React.FC = () => {
    return (
        <div>
            <StandaloneHeader title="Help & Support" />
            <main className="p-4 space-y-8">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Contact Us</h2>
                    <form className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <input type="email" placeholder="Your Email" className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"/>
                        <textarea placeholder="Your message..." rows={4} className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md"></textarea>
                        <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-semibold hover:bg-primary-700">Send Message</button>
                    </form>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <details key={i} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                <summary className="font-semibold cursor-pointer text-slate-800 dark:text-slate-200">{faq.q}</summary>
                                <p className="mt-2 text-slate-600 dark:text-slate-400">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};