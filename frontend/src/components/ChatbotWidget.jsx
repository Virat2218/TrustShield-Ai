import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Shield,
  X,
  Send,
  Trash2,
  Minimize2,
  Sparkles,
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
          ? 'नमस्ते! मैं ट्रस्टशील्ड AI डिजिटल सुरक्षा सहायक हूँ। आप मुझसे ऑनलाइन स्कैम, फर्जी लिंक, OTP सुरक्षा या किसी भी संदिग्ध मैसेज के बारे में पूछ सकते हैं।'
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 text-white shadow-2xl shadow-cyan-500/40 border border-cyan-400/30 font-medium text-xs tracking-wide transition group"
          >
            <div className="relative">
              <Shield className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border-2 border-[#0a0e1a]"></span>
            </div>
            <span className="hidden sm:inline font-semibold">AI Safety Assistant</span>
          </motion.button>
        )}
      </div>

      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[560px] max-h-[85vh] rounded-3xl bg-[#0d1635]/95 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#0a0e1a]/80 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px]">
                  <div className="w-full h-full bg-[#0a0e1a] rounded-xl flex items-center justify-center">
                    <Shield className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{t.chatbot.title}</span>
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                  </h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online &amp; Ready
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                  title={t.chatbot.clear}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start space-x-2.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                        : 'bg-white/[0.05] border border-white/10 text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-300 flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center space-x-2 text-slate-400 text-xs py-1">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center space-x-1 bg-white/[0.04] px-3 py-2 rounded-xl border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions Pills */}
            <div className="px-4 py-2 border-t border-white/5 bg-black/20 flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(q.query)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 hover:text-cyan-300 transition"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#0a0e1a]/90 border-t border-white/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.chatbot.placeholder}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

