import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Lightbulb,
  ChevronRight,
  History,
  X,
} from 'lucide-react';
import {
  getQuizCategories,
  getQuizQuestions,
  submitQuiz,
  getQuizHistory,
} from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-semibold uppercase tracking-widest">
          <Award className="w-3.5 h-3.5" aria-hidden="true" />
          Interactive Awareness
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Scam Awareness Quiz
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl">
          Test your recognition of common fraud patterns including UPI deception, fake banking notices,
          and social engineering tactics.
        </p>

        {isAuthenticated && quizState === 'setup' && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleViewHistory}
              className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 font-medium transition cursor-pointer"
            >
              <History className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View Past Quiz Attempts</span>
            </button>
          </div>
        )}
      </header>

      {/* ─── State 1: Setup / Category Selection ────────────────────────── */}
      {quizState === 'setup' && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm"
        >
          {/* Category Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              1. Select Topic
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Scam threat category">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  role="radio"
                  aria-checked={selectedCategory === cat.id}
                  className={`p-4 rounded-xl border transition text-left cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'border-teal-600 bg-teal-50/70'
                      : 'border-slate-200 bg-white hover:border-teal-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-slate-900">{cat.name}</span>
                    {selectedCategory === cat.id && (
                      <CheckCircle2 className="w-4 h-4 text-teal-700" aria-hidden="true" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{cat.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              2. Select Difficulty
            </label>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Difficulty level">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  role="radio"
                  aria-checked={selectedDifficulty === diff}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition text-center cursor-pointer border ${
                    selectedDifficulty === diff
                      ? 'border-teal-600 bg-teal-50 text-teal-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
              {error}
            </div>
          )}

          {/* Start CTA */}
          <div className="pt-2 flex justify-end border-t border-slate-100">
            <button
              type="button"
              onClick={handleStartQuiz}
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-bold text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Start Quiz</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
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
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm"
        >
          {/* Progress Bar & Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-teal-700 uppercase tracking-wider text-[11px]">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-slate-400">
                {currentQuestion.category} &bull; {currentQuestion.difficulty}
              </span>
            </div>
            {/* Visual Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-[#0d766e] transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-2.5" role="radiogroup" aria-label="Quiz question options">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  role="radio"
                  aria-checked={isSelected}
                  disabled={currentAnswered}
                  className={`w-full p-4 rounded-xl border transition cursor-pointer flex items-start gap-3 text-left ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50 text-slate-900 font-medium'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:bg-slate-50'
                  } disabled:cursor-default`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 border ${
                      isSelected
                        ? 'border-teal-600 bg-[#0d766e] text-white'
                        : 'border-slate-300 bg-slate-100 text-slate-500'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Actions: Confirm or Next */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => setQuizState('setup')}
              className="text-xs text-slate-500 hover:text-slate-800 transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Quit Quiz</span>
            </button>

            {!currentAnswered ? (
              <button
                type="button"
                onClick={handleConfirmAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Confirm Choice
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-7 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>{currentIndex + 1 === questions.length ? 'View Results' : 'Next Scenario'}</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
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
          className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm"
        >
          {/* Score Header */}
          <div className="text-center space-y-3 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl mx-auto bg-teal-50 border border-teal-200 flex flex-col items-center justify-center">
              <span className="text-xl font-black text-teal-700 font-mono">{quizResult.percentage}%</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {quizResult.percentage >= 80
                  ? 'Strong Safety Recognition'
                  : quizResult.percentage >= 50
                  ? 'Moderate Safety Awareness'
                  : 'Needs Practice with Common Scams'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                You correctly answered <span className="text-slate-900 font-bold">{quizResult.score}</span> of{' '}
                <span className="text-slate-900 font-bold">{quizResult.total_questions}</span> questions.
              </p>
            </div>
          </div>

          {/* Recommendations for Improvement */}
          {quizResult.recommendations && quizResult.recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
                <Lightbulb className="w-4 h-4" aria-hidden="true" />
                <span>Key Safety Rules to Remember</span>
              </div>
              <div className="space-y-2">
                {quizResult.recommendations.map((rec, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-100 text-xs text-slate-700 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Question Review & Explanations */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Scenario Breakdown
            </h3>
            <div className="space-y-3">
              {quizResult.results.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    item.is_correct
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : 'border-rose-200 bg-rose-50/40'
                  } space-y-2.5`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">
                      {idx + 1}. {item.question}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 border ${
                        item.is_correct
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {item.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  {/* Options status */}
                  <div className="space-y-1 text-xs">
                    <p className="text-slate-600">
                      Your answer:{' '}
                      <span className={item.is_correct ? 'text-emerald-700 font-medium' : 'text-rose-700 font-medium'}>
                        {item.options[item.selected_answer]}
                      </span>
                    </p>
                    {!item.is_correct && (
                      <p className="text-emerald-700 font-medium">
                        Correct answer: {item.options[item.correct_answer]}
                      </p>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <strong className="text-teal-700">Why: </strong>
                    {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Restart Button */}
          <div className="pt-2 flex justify-center border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setQuizState('setup');
                setQuizResult(null);
              }}
              className="px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-[#0d766e] hover:bg-[#0f766e] shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Take Another Quiz</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Past Quiz Records"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700">
                  <History className="w-4 h-4" aria-hidden="true" />
                  <span>Past Quiz Attempts</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Close past attempts"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              {historyList.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">
                  No completed quiz attempts found for this account.
                </p>
              ) : (
                <div className="space-y-2">
                  {historyList.map((h) => (
                    <div
                      key={h.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 capitalize block">
                          {h.category} &bull; {h.difficulty}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(h.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-teal-700 font-mono block">
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
