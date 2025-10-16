import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { answersAPI, questionsAPI } from '../services/api';
import { MyAnswerResponse, FilteredQuestionResponse, UpdateQuestionRequest } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

type ActiveTab = 'answers' | 'questions';

const MyPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ActiveTab>('answers');

  // Answers State
  const [myAnswers, setMyAnswers] = useState<MyAnswerResponse[]>([]);
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [editingAnswerContent, setEditingAnswerContent] = useState('');

  // Questions State
  const [myQuestions, setMyQuestions] = useState<FilteredQuestionResponse[]>([]);
  const [questionPage, setQuestionPage] = useState(1);
  const [questionSize, setQuestionSize] = useState(10);
  const [totalQuestionPages, setTotalQuestionPages] = useState(1);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editingQuestionData, setEditingQuestionData] = useState<UpdateQuestionRequest | null>(null);

  // Common State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (activeTab === 'answers') {
      fetchMyAnswers();
    } else {
      fetchMyQuestions();
    }
  }, [isAuthenticated, navigate, activeTab, questionPage, questionSize]);

  const fetchMyAnswers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await answersAPI.getMy();
      setMyAnswers(response);
    } catch (err: any) {
      setError(err.response?.data?.message || '내 답변을 불러오는 데 실패했습니다.');
      console.error('Failed to fetch my answers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyQuestions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await questionsAPI.getMyQuestions(questionPage, questionSize);
      setMyQuestions(response);
      // TODO: 백엔드에서 총 페이지 수를 응답 헤더나 별도 필드로 제공해야 정확한 페이지네이션 가능
      setTotalQuestionPages(1); // 임시 값
    } catch (err: any) {
      setError(err.response?.data?.message || '내 질문을 불러오는 데 실패했습니다.');
      console.error('Failed to fetch my questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Answer Handlers ---
  const handleEditAnswerClick = (answer: MyAnswerResponse) => {
    setEditingAnswerId(answer.answer_id);
    setEditingAnswerContent(answer.content);
  };

  const handleCancelAnswerEdit = () => {
    setEditingAnswerId(null);
    setEditingAnswerContent('');
  };

  const handleSaveAnswerEdit = async (answerId: number) => {
    if (!editingAnswerContent.trim()) {
      setError('답변 내용은 비워둘 수 없습니다.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await answersAPI.update(answerId, editingAnswerContent);
      setEditingAnswerId(null);
      setEditingAnswerContent('');
      fetchMyAnswers();
    } catch (err: any) {
      setError(err.response?.data?.message || '답변 수정에 실패했습니다.');
      console.error('Failed to update answer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAnswerClick = async (answerId: number) => {
    if (!window.confirm('정말로 이 답변을 삭제하시겠습니까?')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await answersAPI.delete(answerId);
      fetchMyAnswers();
    } catch (err: any) {
      setError(err.response?.data?.message || '답변 삭제에 실패했습니다.');
      console.error('Failed to delete answer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Question Handlers ---
  const handleEditQuestionClick = (question: FilteredQuestionResponse) => {
    setEditingQuestionId(question.question_id);
    setEditingQuestionData({
      content: question.content,
      category: question.category,
      company: question.company,
      question_at: question.question_at,
    });
  };

  const handleCancelQuestionEdit = () => {
    setEditingQuestionId(null);
    setEditingQuestionData(null);
  };

  const handleSaveQuestionEdit = async (questionId: number) => {
    if (!editingQuestionData || !editingQuestionData.content.trim()) {
      setError('질문 내용은 비워둘 수 없습니다.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await questionsAPI.updateQuestion(questionId, editingQuestionData);
      setEditingQuestionId(null);
      setEditingQuestionData(null);
      fetchMyQuestions();
    } catch (err: any) {
      setError(err.response?.data?.message || '질문 수정에 실패했습니다.');
      console.error('Failed to update question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuestionClick = async (questionId: number) => {
    if (!window.confirm('정말로 이 질문을 삭제하시겠습니까?')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await questionsAPI.delete(questionId);
      fetchMyQuestions();
    } catch (err: any) {
      setError(err.response?.data?.message || '질문 삭제에 실패했습니다.');
      console.error('Failed to delete question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionPageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalQuestionPages) {
      setQuestionPage(newPage);
    }
  };

  if (!isAuthenticated) {
    return null; // 로그인 페이지로 리다이렉트되므로 여기서는 아무것도 렌더링하지 않음
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">내 활동 관리</h1>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 text-lg font-medium ${activeTab === 'answers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('answers')}
          >
            내 답변
          </button>
          <button
            className={`py-2 px-4 text-lg font-medium ${activeTab === 'questions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('questions')}
          >
            내 질문
          </button>
        </div>

        {isLoading && <LoadingSpinner text={`${activeTab === 'answers' ? '답변' : '질문'} 불러오는 중...`} />}
        {error && <ErrorMessage message={error} />}

        {!isLoading && !error && activeTab === 'answers' && (
          myAnswers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-600">
              <p>아직 등록된 답변이 없습니다.</p>
              <button onClick={() => navigate('/interview')} className="btn-primary mt-4">모의 면접 시작하기</button>
            </div>
          ) : (
            <div className="space-y-6">
              {myAnswers.map((answer) => (
                <div key={answer.answer_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {editingAnswerId === answer.answer_id ? (
                    <div>
                      <textarea
                        value={editingAnswerContent}
                        onChange={(e) => setEditingAnswerContent(e.target.value)}
                        className="input-field w-full mb-4"
                        rows={5}
                      />
                      <div className="flex justify-end space-x-2">
                        <button onClick={handleCancelAnswerEdit} className="btn-secondary">취소</button>
                        <button onClick={() => handleSaveAnswerEdit(answer.answer_id)} className="btn-primary">저장</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-800 text-lg mb-2">{answer.content}</p>
                      <div className="text-sm text-gray-600 mb-4">
                        <p><strong>점수:</strong> {answer.score}점</p>
                        <p><strong>AI 평가:</strong> {answer.ai_comment}</p>
                        <p><strong>작성일:</strong> {new Date(answer.answered_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleEditAnswerClick(answer)} className="btn-secondary">수정</button>
                        <button onClick={() => handleDeleteAnswerClick(answer.answer_id)} className="btn-danger">삭제</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {!isLoading && !error && activeTab === 'questions' && (
          myQuestions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-600">
              <p>아직 등록된 질문이 없습니다.</p>
              <button onClick={() => navigate('/create-question')} className="btn-primary mt-4">새 질문 등록하기</button>
            </div>
          ) : (
            <div className="space-y-6">
              {myQuestions.map((question) => (
                <div key={question.question_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {editingQuestionId === question.question_id ? (
                    <div>
                      <textarea
                        value={editingQuestionData?.content || ''}
                        onChange={(e) => setEditingQuestionData(prev => prev ? { ...prev, content: e.target.value } : null)}
                        className="input-field w-full mb-2"
                        rows={3}
                      />
                      <input
                        type="text"
                        value={editingQuestionData?.category || ''}
                        onChange={(e) => setEditingQuestionData(prev => prev ? { ...prev, category: e.target.value } : null)}
                        className="input-field w-full mb-2"
                        placeholder="카테고리"
                      />
                      <input
                        type="text"
                        value={editingQuestionData?.company || ''}
                        onChange={(e) => setEditingQuestionData(prev => prev ? { ...prev, company: e.target.value } : null)}
                        className="input-field w-full mb-4"
                        placeholder="회사명"
                      />
                      <div className="flex justify-end space-x-2">
                        <button onClick={handleCancelQuestionEdit} className="btn-secondary">취소</button>
                        <button onClick={() => handleSaveQuestionEdit(question.question_id)} className="btn-primary">저장</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-800 text-lg mb-2">{question.content}</p>
                      <div className="text-sm text-gray-600 mb-4">
                        <p><strong>카테고리:</strong> {question.category}</p>
                        <p><strong>회사:</strong> {question.company}</p>
                        <p><strong>작성일:</strong> {new Date(question.question_at * 1000).toLocaleDateString()}</p>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleEditQuestionClick(question)} className="btn-secondary">수정</button>
                        <button onClick={() => handleDeleteQuestionClick(question.question_id)} className="btn-danger">삭제</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {/* Pagination */}
              {totalQuestionPages > 1 && (
                <div className="flex justify-center space-x-2 mt-6">
                  <button
                    onClick={() => handleQuestionPageChange(questionPage - 1)}
                    disabled={questionPage === 1}
                    className="btn-secondary"
                  >
                    이전
                  </button>
                  <span className="py-2 px-4 text-gray-700">{questionPage} / {totalQuestionPages}</span>
                  <button
                    onClick={() => handleQuestionPageChange(questionPage + 1)}
                    disabled={questionPage === totalQuestionPages}
                    className="btn-secondary"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MyPage;
