import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { api } from '../services/api';
import { AIChatMessage, VerificationClaim } from '../types';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  ExternalLink,
  Info
} from 'lucide-react';

export const AIInsightsAssistant: React.FC = () => {
  const { dataset, setActiveTab } = useData();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your **DataLens AI Research Assistant**. I analyze your dataset by executing real NumPy and Pandas calculations. I strictly avoid hallucinating statistics and distinguish mathematical facts from qualitative hypotheses.\n\nClick any of the suggested research prompts below or type your custom inquiry.",
      timestamp: 'Just now',
      suggestions: [
        'What are the most important patterns in this dataset?',
        'Which columns contain the most missing values?',
        'What possible outliers should I investigate?',
        'Explain correlation vs causation for this data.',
        'What limitations should I mention in my capstone report?'
      ]
    }
  ]);
  const [isSending, setIsSending] = useState<boolean>(false);

  if (!dataset) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-slate-500 text-sm">Please upload or load a dataset first to enable the AI assistant.</p>
        <button
          onClick={() => setActiveTab('upload')}
          className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const userMsg: AIChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.askAI(dataset.session_id, textToSend);
      const aiMsg: AIChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        claims: res.claims,
        is_fallback: res.is_fallback_mode,
        suggestions: res.suggestions
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: AIChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: `Error connecting to AI service: ${err.message || 'Server unavailable'}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Grounding & Ethics Header */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40 border border-sky-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-sky-500 text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <span>DataLens Grounded AI Assistant</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                Zero Hallucination Guaranteed
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Assisting analyst inquiry grounded in active dataset: <strong>{dataset.filename}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('verification')}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Verification Center</span>
        </button>
      </div>

      {/* Chat Thread */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-6 min-h-[460px] flex flex-col justify-between">
        <div className="space-y-6 overflow-y-auto max-h-[550px] pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-sky-100 dark:border-sky-900">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                <div className="prose prose-xs dark:prose-invert max-w-none whitespace-pre-wrap">
                  {msg.text}
                </div>

                {/* Verification Claims Badges */}
                {msg.claims && msg.claims.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Extracted Mathematical Claims ({msg.claims.length}):</span>
                      </span>
                      <button
                        onClick={() => setActiveTab('verification')}
                        className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 text-[10px]"
                      >
                        Audit in Verification Center <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {msg.claims.map((claim, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px]"
                        >
                          <span className="truncate pr-2">{claim.claim_text}</span>
                          <span
                            className={`font-bold font-mono px-1.5 py-0.5 rounded text-[10px] flex-shrink-0 ${
                              claim.status === 'Verified'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : claim.status === 'Needs Review'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {claim.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions Pills */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Recommended Follow-Up Inquiries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          className="text-[11px] text-left px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-sky-400 hover:text-sky-600 transition-colors"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 text-[10px] text-right text-slate-400">
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-3 text-xs text-slate-400 animate-pulse pl-11">
              <Bot className="w-4 h-4 text-sky-500 animate-spin" />
              <span>Executing NumPy matrix calculations and formulating insights...</span>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask AI to explain patterns, verify missing values, or discuss outliers..."
              disabled={isSending}
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
