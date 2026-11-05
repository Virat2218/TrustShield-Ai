import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  X,
  Send,
  Trash2,
  Bot,
  User,
  Check,
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
            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#0d766e] hover:bg-[#0f766e] text-white shadow-xl shadow-teal-950/20 text-xs font-bold tracking-wide transition cursor-pointer"
            aria-label="Open AI Safety Assistant"
          >
            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-white">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
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
            className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[540px] max-h-[85vh] rounded-3xl bg-white border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
            role="dialog"
            aria-label="AI Safety Assistant Chat"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0d766e] flex items-center justify-center text-white shadow-xs">
                  <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {t.chatbot.title}
                  </h3>
                  <span className="text-[10px] text-slate-500 block">
                    Digital Safety Guidance
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Clear chat"
                  aria-label="Clear chat"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Close Assistant"
                  aria-label="Close Assistant"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-slate-50/50" aria-live="polite">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-md bg-teal-100 text-[#0d766e] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#0d766e] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-slate-500 text-xs py-1" role="status">
                  <div className="w-6 h-6 rounded-md bg-teal-100 text-[#0d766e] flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5" aria-hidden="true" />
                  </div>
                  <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d766e] animate-pulse"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d766e] animate-pulse [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0d766e] animate-pulse [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions Pills */}
            <div className="px-3 py-2 border-t border-slate-200 bg-white flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(q.query)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-medium transition cursor-pointer"
                >
                  {q.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-200">
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
                  placeholder="Ask a digital safety question..."
                  aria-label="Ask a digital safety question"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0d766e] font-sans"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2.5 rounded-xl bg-[#0d766e] hover:bg-[#0f766e] text-white disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                  aria-label="Send question"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
