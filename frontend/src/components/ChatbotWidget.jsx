import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  X,
  Send,
  Trash2,
  Bot,
  User,
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';

export default function ChatbotWidget({ currentScanContext = null }) {
  const { t, lang } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        lang === 'hi'
          ? 'नमस्ते! मैं ट्रस्टशील्ड AI डिजिटल सुरक्षा सहायक हूँ। आप मुझसे ऑनलाइन स्कैम, संदिग्ध लिंक, OTP सुरक्षा या किसी भी संदिग्ध मैसेज के बारे में पूछ सकते हैं।'
          : 'Hello! I am your TrustShield AI Safety Assistant. Ask me anything about online scams, suspicious links, OTP rules, or cybersecurity safety.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText = input) => {
    const textToSend = messageText.trim();
    if (!textToSend || loading) return;

    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = newMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage(textToSend, currentScanContext, historyPayload);
      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered a temporary connection issue. Please try asking again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          lang === 'hi'
            ? 'चैट साफ़ कर दी गई है। आप कोई नया सुरक्षा सवाल पूछ सकते हैं।'
            : 'Chat cleared. Ask me any digital safety or scam question.',
      },
    ]);
  };

  const quickQuestions = [
    { label: t.chatbot.quickOtp, query: 'Is it ever safe to share OTP over phone or WhatsApp?' },
    { label: t.chatbot.quickKyc, query: 'How do fake bank KYC account suspension scams work?' },
    { label: t.chatbot.quickLottery, query: 'How can I identify fake lottery or prize claims?' },
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-xl shadow-cyan-950/40 border border-cyan-400/30 text-xs font-semibold tracking-wide transition cursor-pointer"
            aria-label="Open AI Safety Assistant"
          >
            <Shield className="w-4.5 h-4.5 text-white" aria-hidden="true" />
            <span className="hidden sm:inline">AI Safety Assistant</span>
          </button>
        )}
      </div>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[540px] max-h-[85vh] rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl shadow-black/70 flex flex-col overflow-hidden"
            role="dialog"
            aria-label="AI Safety Assistant Chat"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-[#0a0f1d] border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Shield className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">
                    {t.chatbot.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 block">
                    Digital Safety Advisor
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                  title={t.chatbot.clear}
                  aria-label={t.chatbot.clear}
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition"
                  title="Close Assistant"
                  aria-label="Close Assistant"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs" aria-live="polite">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-md bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-cyan-600 text-white shadow-sm'
                        : 'bg-white/[0.04] border border-white/[0.08] text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-400 text-xs py-1" role="status" aria-label="Thinking...">
                  <div className="w-6 h-6 rounded-md bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                    <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-1 bg-white/[0.04] px-3 py-2 rounded-lg border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions Pills */}
            <div className="px-3 py-2 border-t border-white/[0.06] bg-black/20 flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(q.query)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[10px] text-slate-300 hover:text-cyan-300 transition"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#0a0f1d] border-t border-white/[0.08]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.chatbot.placeholder}
                  aria-label="Ask a digital safety question"
                  className="flex-1 px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                  aria-label={t.chatbot.send}
                >
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
