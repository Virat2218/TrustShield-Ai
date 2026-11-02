import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Shield,
  Lightbulb,
  Clock,
  BookOpen,
  Sparkles,
  ChevronRight,
  History,
} from 'lucide-react';
import {
  getQuizCategories,
  getQuizQuestions,
  submitQuiz,
  getQuizHistory,
} from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import LoadingSpinner from '../components/LoadingSpinner';

export default function QuizCenter() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  // Categories & Setup State
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState(['Beginner', 'Intermediate', 'Advanced']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Beginner');

  // Quiz Engine State
  const [quizState, setQuizState] = useState('setup'); // 'setup', 'playing', 'finished'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answersMap, setAnswersMap] = useState({}); // { question_id: selected_index }
  const [currentAnswered, setCurrentAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Results State
  const [quizResult, setQuizResult] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getQuizCategories();
        if (data.categories) setCategories(data.categories);
        if (data.difficulties) setDifficulties(data.difficulties);
      } catch (err) {
        console.error('Failed to load quiz categories:', err);
      }
    }
    loadConfig();
  }, []);

  const handleStartQuiz = async () => {
    setLoading(true);
    setError('');
    try {
      const qs = await getQuizQuestions(selectedCategory, selectedDifficulty, 5);
      if (!qs || qs.length === 0) {
        setError('No questions available for this category and difficulty.');
        return;
      }
      setQuestions(qs);
      setCurrentIndex(0);
      setSelectedOption(null);
      setAnswersMap({});
      setCurrentAnswered(false);
      setQuizResult(null);
      setQuizState('playing');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch quiz questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (idx) => {
    if (currentAnswered) return;
    setSelectedOption(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedOption,
    }));
    setCurrentAnswered(true);
  };

  const handleNextQuestion = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setCurrentAnswered(false);
    } else {
      // Quiz Complete - submit answers
      setLoading(true);
      try {
        const payload = {
          category: selectedCategory,
          difficulty: selectedDifficulty,
          answers: Object.entries({
            ...answersMap,
            [currentQuestion.id]: selectedOption,
          }).map(([qId, ans]) => ({
            question_id: parseInt(qId),
            selected_answer: ans,
          })),
        };
        const res = await submitQuiz(payload);
        setQuizResult(res);
        setQuizState('finished');
      } catch (err) {
        console.error(err);
        setError('Failed to submit quiz results.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewHistory = async () => {
    if (!isAuthenticated) return;
    setShowHistory(true);
    try {
      const hist = await getQuizHistory();
      setHistoryList(hist);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>Cyber Threat Awareness Lab</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Scam Awareness Center
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Test your fraud defense reflexes against real-world social engineering, UPI traps, and deceptive phishing tactics.
        </p>

        {isAuthenticated && quizState === 'setup' && (
          <div className="pt-2">
            <button
              onClick={handleViewHistory}
              className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <History className="w-3.5 h-3.5" />
              <span>View Past Quiz Attempts</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── State 1: Setup / Category Selection ────────────────────────── */}
      {quizState === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-[#0d1635]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Category Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Select Scam Threat Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                    selectedCategory === cat.id
                      ? 'border-cyan-400 bg-cyan-500/15 shadow-lg shadow-cyan-500/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-white">{cat.name}</span>
                    {selectedCategory === cat.id && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{cat.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              2. Select Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider border transition text-center ${
                    selectedDifficulty === diff
                      ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}

          {/* Start CTA */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-cyan-600 to-cyan-500 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.01] transition disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Begin Awareness Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── State 2: Active Question Playing ────────────────────────────── */}
      {quizState === 'playing' && currentQuestion && (
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl bg-[#0d1635]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Progress Bar & Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-cyan-400 uppercase tracking-wider text-[11px]">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="font-mono text-slate-500">
                {currentQuestion.category.toUpperCase()} • {currentQuestion.difficulty}
              </span>
            </div>
            {/* Visual Bar */}
            <div className="w-full h-2 rounded-full bg-black/40 overflow-hidden border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-4 rounded-2xl border transition cursor-pointer flex items-start space-x-3 text-left ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/15 text-white'
                      : 'border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 border ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-400 text-slate-900'
                        : 'border-white/20 bg-black/40 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                </div>
              );
            })}
          </div>

          {/* Actions: Confirm or Next */}
          <div className="pt-2 flex items-center justify-between border-t border-white/10">
            <button
              onClick={() => setQuizState('setup')}
              className="text-xs text-slate-400 hover:text-white transition flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Quit Quiz</span>
            </button>

            {!currentAnswered ? (
              <button
                onClick={handleConfirmAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-7 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-cyan-500/25 hover:scale-[1.01] transition flex items-center space-x-2"
              >
                <span>{currentIndex + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* ─── State 3: Quiz Finished & Detailed Scorecard ─────────────────── */}
      {quizState === 'finished' && quizResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-[#0d1635]/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-8"
        >
          {/* Score Header */}
          <div className="text-center space-y-4 pb-6 border-b border-white/10">
            <div className="w-20 h-20 rounded-3xl mx-auto bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-xl shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0a0e1a] rounded-3xl flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-cyan-400">{quizResult.percentage}%</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">
                {quizResult.percentage >= 80
                  ? 'Cyber Vigilance Master!'
                  : quizResult.percentage >= 50
                  ? 'Good Safety Awareness'
                  : 'High Threat Exposure'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                You correctly answered <span className="text-white font-bold">{quizResult.score}</span> out of{' '}
                <span className="text-white font-bold">{quizResult.total_questions}</span> scenarios (
                {quizResult.percentage}% accuracy).
              </p>
            </div>
          </div>

          {/* Recommendations for Improvement */}
          {quizResult.recommendations && quizResult.recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                <Lightbulb className="w-4 h-4" />
                <span>Recommended Safety Takeaways</span>
              </div>
              <div className="space-y-2">
                {quizResult.recommendations.map((rec, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-cyan-500/[0.05] border border-cyan-500/20 text-xs text-cyan-200 flex items-start space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Question Review & Explanations */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Scenario-by-Scenario Review
            </h3>
            <div className="space-y-4">
              {quizResult.results.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border ${
                    item.is_correct
                      ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                      : 'border-rose-500/30 bg-rose-500/[0.03]'
                  } space-y-3`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      {idx + 1}. {item.question}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 border ${
                        item.is_correct
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {item.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  {/* Options status */}
                  <div className="space-y-1.5 text-xs">
                    <p className="text-slate-400">
                      Your answer:{' '}
                      <span className={item.is_correct ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                        {item.options[item.selected_answer]}
                      </span>
                    </p>
                    {!item.is_correct && (
                      <p className="text-emerald-400 font-medium">
                        Correct answer: {item.options[item.correct_answer]}
                      </p>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 leading-relaxed">
                    <strong className="text-cyan-400">Safety Rule: </strong>
                    {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Restart Button */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => {
                setQuizState('setup');
                setQuizResult(null);
              }}
              className="px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-cyan-500/25 hover:scale-[1.01] transition flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Take Another Challenge</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* History Modal / Drawer */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-3xl bg-[#0a0e1a] border border-white/15 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <History className="w-4 h-4" />
                  <span>My Past Quiz Records</span>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>

              {historyList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No completed quiz attempts found for this account.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {historyList.map((h) => (
                    <div
                      key={h.id}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white capitalize block">
                          {h.category} • {h.difficulty}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(h.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-cyan-400 font-mono block">
                          {h.score} / {h.total_questions} ({h.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

