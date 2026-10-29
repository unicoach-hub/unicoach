import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, MessageSquare, X, Send, Bot, User, 
  RotateCcw, Copy, Check, ChevronDown, ArrowLeft, Globe, Award, Compass
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const API_URL = API_BASE_URL;

const QUICK_PROMPTS = [
  '🎓 How to get 100% scholarships in USA?',
  '🇨🇦 Best MS universities in Canada under ₹20 Lakhs',
  '🇬🇧 Can I get admission in UK with 6.0 IELTS?',
  '🇩🇪 Is German university education really tuition-free?',
  '🇦🇺 Post-study work visa rules for Australia in 2026'
];

const UniBotChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm **UniBot** 🎓, your 24/7 AI Study Abroad Counsellor.\n\nAsk me anything about **universities, scholarships, IELTS/GRE scores, visa guidelines, or tuition costs** across USA, UK, Canada, Australia, Germany and more!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Lock background scroll on mobile when chat is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      if (window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (textToSend = null) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/ai/unibot-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: query.trim(),
          conversationHistory: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      if (data.success && data.reply) {
        setMessages([...updatedMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...updatedMessages, { 
          role: 'assistant', 
          content: "I'm having a slight network blip, but our admissions team is active! Feel free to ask about tuition fees, visas, or top colleges." 
        }]);
      }
    } catch (err) {
      console.error('UniBot chat error:', err);
      setMessages([...updatedMessages, { 
        role: 'assistant', 
        content: "I'm having a slight network blip, but our admissions team is active! Feel free to ask about tuition fees, visas, or top colleges." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm **UniBot** 🎓, your 24/7 AI Study Abroad Counsellor.\n\nAsk me anything about **universities, scholarships, IELTS/GRE scores, visa guidelines, or tuition costs** across USA, UK, Canada, Australia, Germany and more!"
      }
    ]);
  };

  const renderFormattedText = (text, isUser) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className={isUser ? "font-black text-white" : "font-extrabold text-slate-900"}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      return (
        <span key={lIdx} className="block min-h-[1.25em]">
          {formattedLine}
        </span>
      );
    });
  };

  return (
    <>
      {/* ── Floating Launcher Button (shown only when chat is closed) ── */}
      {!isOpen && (
        <div className="fixed bottom-20 right-3 md:bottom-6 md:right-6 z-40">
          {/* White pill like the navbar: orange avatar with an online dot, then name + status. Phones get just the round avatar. */}
          <motion.button
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsOpen(true)}
            className="no-shine group relative flex items-center gap-3 p-0 md:p-1.5 md:pr-5 rounded-full md:bg-white md:border md:border-[#ECE6DA] shadow-[0_12px_30px_-12px_rgba(22,19,15,0.35)] hover:shadow-[0_16px_36px_-12px_rgba(222,92,43,0.45)] transition-shadow cursor-pointer"
            aria-label="Open UniBot AI Counsellor"
          >
            <span className="relative w-12 h-12 md:w-11 md:h-11 rounded-full bg-[#DE5C2B] ring-4 ring-white md:ring-0 grid place-items-center flex-shrink-0 transition-transform duration-300 group-hover:rotate-[-8deg]">
              <Bot size={20} className="text-white" />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white" style={{ background: '#22C55E' }} />
            </span>
            <span className="text-left hidden md:block">
              <span className="block font-urbanist text-[14.5px] font-extrabold leading-none text-[#16130F]">Ask UniBot</span>
              <span className="mt-1 flex items-center gap-1.5 text-[11.5px] font-medium leading-none text-[#6B6458]">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} /> Online · AI counsellor, 24/7
              </span>
            </span>
          </motion.button>
        </div>
      )}

      {/* ── Main Chat Window (Full Screen on Mobile, Floating Card on Desktop) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[120] w-full h-[100dvh] bg-white flex flex-col md:inset-auto md:fixed md:bottom-6 md:right-6 md:w-[420px] md:h-[600px] md:max-h-[85vh] md:rounded-3xl md:shadow-2xl md:border md:border-slate-200/90 md:overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 pt-[max(1rem,env(safe-area-inset-top))] md:pt-4 text-[#16130F] flex items-center justify-between flex-shrink-0 border-b border-[#F1E4DA]" style={{ background: 'linear-gradient(120deg, #FCE9E0 0%, #FBF4EE 60%, #FFFFFF 100%)' }}>
              <div className="flex items-center gap-2.5">
                {/* Mobile Back / Dismiss Arrow */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="md:hidden p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white/70 active:scale-90 transition-all cursor-pointer"
                  aria-label="Close Chat"
                  title="Close"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#DE5C2B] flex items-center justify-center shadow-[0_6px_14px_-6px_rgba(222,92,43,0.7)]">
                    <Bot size={20} className="text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full ring-2 ring-white" style={{ background: '#22C55E' }} />
                </div>

                <div>
                  <h3 className="font-urbanist text-[15px] font-extrabold flex items-center gap-1.5">
                    UniBot <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white text-[#C9573B] border border-[#F3D3C8] font-bold">AI Counsellor</span>
                  </h3>
                  <p className="text-[11px] font-semibold flex items-center gap-1" style={{ color: '#15803D' }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#22C55E' }} /> Online, replies in seconds
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleResetChat}
                  title="Clear Chat"
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/70 transition-colors cursor-pointer active:scale-95"
                  aria-label="Clear chat history"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                  className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-700 border border-[#F1E4DA] transition-all cursor-pointer active:scale-90"
                  aria-label="Close chat"
                >
                  <X size={18} className="stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Quick Prompt Pills */}
            <div className="p-2.5 bg-slate-50 border-b border-slate-100 overflow-x-auto custom-scrollbar flex items-center gap-1.5 flex-shrink-0">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-white border border-slate-200 text-slate-700 hover:border-orange-400 hover:text-[#DE5C2B] hover:bg-orange-50/50 whitespace-nowrap transition-all flex-shrink-0 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Chat Messages Log */}
            <div 
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              className="p-4 space-y-4 overflow-y-auto overscroll-contain flex-1 custom-scrollbar bg-slate-50/50 touch-pan-y"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#DE5C2B] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={15} />
                    </div>
                  )}

                  <div
                    className={`relative group max-w-[85%] md:max-w-[82%] p-3.5 rounded-2xl text-xs md:text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#DE5C2B] text-white rounded-br-none shadow-md shadow-orange-100'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80 shadow-sm'
                    }`}
                  >
                    <div className="font-medium space-y-1">
                      {renderFormattedText(msg.content, msg.role === 'user')}
                    </div>

                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.content, idx)}
                        className="absolute bottom-1.5 right-1.5 p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Copy message"
                      >
                        {copiedIndex === idx ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#DE5C2B] flex items-center justify-center flex-shrink-0">
                    <Bot size={15} />
                  </div>
                  <div className="p-3.5 rounded-2xl rounded-tl-none bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#DE5C2B] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#DE5C2B] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#DE5C2B] animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[11px] font-semibold text-slate-400 ml-1.5">Consulting counsellor database...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-200/90 flex items-center gap-2 flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              <input
                type="text"
                placeholder="Ask about colleges, fees, visas, or scholarships..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[16px] md:text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#DE5C2B] focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="w-11 h-11 rounded-2xl bg-gradient-to-r from-orange-600 to-[#DE5C2B] hover:from-orange-700 hover:to-[#C04A1D] disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-orange-200 active:scale-95 flex-shrink-0 cursor-pointer"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UniBotChatWidget;
