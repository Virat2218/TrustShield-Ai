import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LanguageProvider } from './hooks/useLanguage';
import { AuthProvider, ProtectedRoute, AdminRoute } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';

import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';

// Phase 1 Pages
import Home from './pages/Home';
import ScamDetector from './pages/ScamDetector';
import URLChecker from './pages/URLChecker';

// Phase 2 Pages
import ScreenshotAnalyzer from './pages/ScreenshotAnalyzer';
import NewsVerification from './pages/NewsVerification';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Phase 3 Pages
import QuizCenter from './pages/QuizCenter';
import ReportScam from './pages/ReportScam';
import MyReports from './pages/MyReports';
import AdminDashboard from './pages/AdminDashboard';
import ScamAlerts from './pages/ScamAlerts';
import AlertDetail from './pages/AlertDetail';

// Phase 4 Tools & Safety Pages
import QuickCheck from './pages/QuickCheck';
import QRCodeChecker from './pages/QRCodeChecker';
import CallChecker from './pages/CallChecker';
import EmailChecker from './pages/EmailChecker';
import IncidentResponse from './pages/IncidentResponse';
import LearningCenter from './pages/LearningCenter';
import ScamPractice from './pages/ScamPractice';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
            {/* Skip-to-main for keyboard / screen-reader users */}
            <a href="#main-content" className="skip-link">
              Skip to main content
            </a>
            <Navbar />
            <main id="main-content" className="flex-1">
              <ErrorBoundary>
                <Routes>
                  {/* Phase 1 Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/scan" element={<ScamDetector />} />
                  <Route path="/url-checker" element={<URLChecker />} />

                  {/* Phase 4 Expansion Tools */}
                  <Route path="/quick-check" element={<QuickCheck />} />
                  <Route path="/qr-checker" element={<QRCodeChecker />} />
                  <Route path="/call-checker" element={<CallChecker />} />
                  <Route path="/email-checker" element={<EmailChecker />} />
                  <Route path="/incident-response" element={<IncidentResponse />} />
                  <Route path="/learning-center" element={<LearningCenter />} />
                  <Route path="/practice" element={<ScamPractice />} />

                  {/* Phase 2 Routes */}
                  <Route path="/screenshot" element={<ScreenshotAnalyzer />} />
                  <Route path="/news-check" element={<NewsVerification />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Phase 3 Routes */}
                  <Route path="/quiz" element={<QuizCenter />} />
                  <Route path="/report-scam" element={<ReportScam />} />
                  <Route
                    path="/my-reports"
                    element={
                      <ProtectedRoute>
                        <MyReports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route path="/alerts" element={<ScamAlerts />} />
                  <Route path="/alerts/:id" element={<AlertDetail />} />

                  {/* Aliases & Backward Compatibility */}
                  <Route path="/register" element={<Navigate to="/signup" replace />} />
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

                  {/* Fallback 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </main>
            <Footer />
            {/* Feature 6: AI Safety Chatbot Floating Widget */}
            <ChatbotWidget />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
