
import React, { useState, useRef, useEffect } from 'react';
// Added missing Loader2 icon import
import { MessageCircle, X, Send, Bot, User as UserIcon, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { getAITutorStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const AITutorChat: React.FC<{ context?: string }> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Hi! I'm Newel, your AI Science Tutor. I see you're studying ${context?.split('\n')[1]?.replace('Topic: ', '') || 'Science'}. Ask me anything!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-4).map(m => `${m.role}: ${m.text}`).join('\n');
      const stream = await getAITutorStream(userMsg.text, (context ? `Topic Context:\n${context}\n\nChat History:\n` : '') + history);

      let fullText = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'model') {
              const updated = [...prev];
              updated[updated.length - 1] = { ...last, text: fullText };
              return updated;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to the network." }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    const html = marked.parse(text) as string;
    return { __html: DOMPurify.sanitize(html) };
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform animate-bounce-subtle ring-2 ring-white/20"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div className={`fixed inset-0 sm:inset-auto sm:bottom-8 sm:right-8 ${isExpanded ? 'sm:w-[600px] sm:h-[80vh]' : 'sm:w-96 sm:h-[500px]'} bg-slate-950/90 backdrop-blur-2xl border border-white/10 sm:rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden transition-all duration-300`}>
      {/* Header */}
      <div className="p-4 md:p-5 bg-white/5 border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <Bot className="text-cyan-400" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Newel (AI Science Tutor)</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-white/40 uppercase tracking-tighter">Powered by Gemini 2.5</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden sm:block text-white/30 hover:text-white p-2"
          >
            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={() => setIsOpen(false)} className="text-white/30 hover:text-white p-2">
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                <Bot size={14} className="text-cyan-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-tr-none shadow-lg'
                : 'bg-white/5 text-white/90 rounded-tl-none border border-white/10 glass'
                }`}
            >
              {m.role === 'model' ? (
                <div className="prose-custom text-sm md:text-base" dangerouslySetInnerHTML={renderMarkdown(m.text || '...')} />
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1].role === 'user' && (
          <div className="flex items-center gap-2 text-white/30 text-xs ml-11">
            <Loader2 size={12} className="animate-spin" />
            <span>AI is calculating response...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 md:p-5 border-t border-white/5 bg-slate-900/50">
        <div className="flex gap-3 bg-white/5 rounded-2xl p-1.5 border border-white/10 focus-within:border-cyan-500/50 transition-colors">
          <input
            type="text"
            className="flex-1 bg-transparent px-3 py-2 text-white focus:outline-none text-sm md:text-base"
            placeholder="Ask about mitosis, velocity, chemical bonds..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-10 h-10 md:w-11 md:h-11 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl disabled:opacity-30 transition-all flex items-center justify-center shadow-lg"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITutorChat;
