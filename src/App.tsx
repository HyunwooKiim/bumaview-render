import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import QuestionsPage from './pages/QuestionPage';
import QuestionDetailPage from './pages/PageDetailsPage';
import CreateQuestionPage from './pages/CreateQuestionPage';
import InterviewPage from './pages/InterviewPage';
import MyPage from './pages/MyPage';
import ReviewsPage from './pages/ReviewPages';
import CreateReviewPage from './pages/CreateReviewPage';
import ReviewDetailPage from './pages/ReviewDetailPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/login" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <ProtectedRoute requireAuth={false}>
                  <SignupPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/questions/:id" element={<QuestionDetailPage />} />
            <Route 
              path="/questions/create" 
              element={
                <ProtectedRoute>
                  <CreateQuestionPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interview" 
              element={
                <ProtectedRoute>
                  <InterviewPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mypage" 
              element={
                <ProtectedRoute>
                  <MyPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/reviews/:id" element={<ReviewDetailPage />} />
            <Route 
              path="/reviews/create" 
              element={
                <ProtectedRoute>
                  <CreateReviewPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;