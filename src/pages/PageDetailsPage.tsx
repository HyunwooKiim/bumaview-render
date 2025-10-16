import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, CalendarIcon, BuildingOfficeIcon, TagIcon } from '@heroicons/react/24/outline';
import { questionsAPI, answersAPI } from '../services/api';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Question, Answer, User } from '../types';
import RelatedQuestions from '../components/common/RelatedQuestions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});
  const [commentSubmitting, setCommentSubmitting] = useState<{[key: number]: boolean}>({});
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState<string>('');

  useEffect(() => {
    if (id) {
      fetchQuestionDetails();
    }
  }, [id]);

  const fetchQuestionDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      // AI 코멘트가 포함된 질문 정보를 가져오기 위해 filtered API 사용
      const filteredQuestions = await questionsAPI.getFiltered({});
      const questionData = filteredQuestions.find((q: any) => q.question_id === parseInt(id));

      if (!questionData) {
        // filtered에서 찾지 못하면 기본 질문 정보만 가져오기
        const basicResponse = await api.get(`/api/questions/${id}`);
        const basicQuestion = basicResponse.data;

        // FilteredQuestionResponse 형태로 변환
        setQuestion({
          question_id: basicQuestion.id,
          user_id: basicQuestion.user_id,
          content: basicQuestion.content,
          category: basicQuestion.category,
          company: basicQuestion.company,
          question_at: basicQuestion.question_at,
          score: 0,
          ai_comment: '', // 기본 API에는 AI 코멘트 없음
          evaluated_at: '',
          answers: []
        });
        setAnswers([]);
      } else {
        setQuestion(questionData);
        // 각 답변에 고유 ID를 부여 (API 응답에 ID가 없는 경우)
        const answersWithFrontendIds = questionData.answers.map((ans, idx) => ({
          ...ans,
          id: idx + 1, // 임시 고유 ID 부여
        }));
        setAnswers(answersWithFrontendIds);
      }

    } catch (err: any) {
      console.error('Failed to fetch question details:', err);
      setError('질문 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAnswer.trim() || !question) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await answersAPI.create({
        question_id: question.question_id,
        content: newAnswer.trim()
      });

      setNewAnswer('');
      // 답변 목록 새로고침
      await fetchQuestionDetails();

    } catch (err: any) {
      console.error('Failed to submit answer:', err);
      setError('답변 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeAnswer = async (answerId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      // 좋아요 토글 로직 구현
      const answer = answers.find(a => a.id === answerId);
      if (answer?.liked) {
        await answersAPI.unlike(answerId);
      } else {
        await answersAPI.like(answerId);
      }
      
      // 답변 목록 새로고침
      await fetchQuestionDetails();

    } catch (err: any) {
      console.error('Failed to toggle like:', err);
      setError('좋아요 처리에 실패했습니다.');
    }
  };

  const handleSubmitComment = async (answerId: number, e: React.FormEvent) => {
    e.preventDefault();

    const commentContent = commentInputs[answerId]?.trim();
    if (!commentContent) return;

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setCommentSubmitting(prev => ({ ...prev, [answerId]: true }));
      setError(null);

      await answersAPI.createComment({
        answer_id: answerId,
        content: commentContent
      });

      // 댓글 입력 초기화
      setCommentInputs(prev => ({ ...prev, [answerId]: '' }));

      // 답변 목록 새로고침
      await fetchQuestionDetails();

    } catch (err: any) {
      console.error('Failed to submit comment:', err);
      setError('댓글 작성에 실패했습니다.');
    } finally {
      setCommentSubmitting(prev => ({ ...prev, [answerId]: false }));
    }
  };

  const handleCommentInputChange = (answerId: number, value: string) => {
    setCommentInputs(prev => ({ ...prev, [answerId]: value }));
  };

  const handleEditComment = (comment: UserCommentResponse) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleUpdateComment = async (commentId: number, e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommentContent.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await answersAPI.updateComment(commentId, editingCommentContent.trim());
      handleCancelCommentEdit();
      await fetchQuestionDetails();
    } catch (err: any) {
      console.error('Failed to update comment:', err);
      setError('댓글 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await answersAPI.deleteComment(commentId);
      await fetchQuestionDetails();
    } catch (err: any) {
      console.error('Failed to delete comment:', err);
      setError('댓글 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAnswer = (answer: Answer) => {
    setEditingAnswerId(answer.id);
    setEditingContent(answer.content);
  };

  const handleCancelEdit = () => {
    setEditingAnswerId(null);
    setEditingContent('');
  };

  const handleUpdateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnswerId || !editingContent.trim()) {
      return;
    }

    try {
      setIsSubmitting(true); // Use isSubmitting for general form submission
      setError(null);
      await answersAPI.update(editingAnswerId, editingContent.trim());
      handleCancelEdit();
      await fetchQuestionDetails();
    } catch (err: any) {
      console.error('Failed to update answer:', err);
      setError('답변 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnswer = async (answerId: number) => {
    if (!window.confirm('정말로 이 답변을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsLoading(true); // Use isLoading to block UI during delete
      setError(null);
      await answersAPI.delete(answerId);
      await fetchQuestionDetails();
    } catch (err: any) {
      console.error('Failed to delete answer:', err);
      setError('답변 삭제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="질문 정보를 불러오는 중..." />
      </div>
    );
  }

  if (error && !question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <ErrorMessage message={error} />
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/questions')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              질문 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">질문을 찾을 수 없습니다</h2>
          <button
            onClick={() => navigate('/questions')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            질문 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate('/questions')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          질문 목록으로 돌아가기
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 질문 카드 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    {question.category}
                  </span>
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                    {question.company}
                  </span>
                  {question.score && (
                    <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                      점수 {question.score}
                    </span>
                  )}
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {question.content}
              </h1>

              <div className="flex items-center text-sm text-gray-500 space-x-6">
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {new Date(question.question_at * 1000).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  {question.company}
                </div>
                <div className="flex items-center">
                  <TagIcon className="h-4 w-4 mr-1" />
                  질문 ID: {question.question_id}
                </div>
              </div>

              {question.ai_comment && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h3 className="font-medium text-blue-900 mb-2">AI 코멘트</h3>
                  <p className="text-blue-800">{question.ai_comment}</p>
                </div>
              )}
            </div>

            {/* 답변 작성 폼 */}
            {isAuthenticated ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">답변 작성</h2>
                {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

                <form onSubmit={handleSubmitAnswer}>
                  <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="이 질문에 대한 답변을 작성해주세요..."
                    rows={6}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      disabled={!newAnswer.trim() || isSubmitting}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? '답변 작성 중...' : '답변 작성'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-600 mb-4">답변을 작성하려면 로그인이 필요합니다.</p>
                <Link
                  to="/login"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  로그인
                </Link>
              </div>
            )}

            {/* 답변 목록 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">
                답변 ({answers.length}개)
              </h2>

              {answers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">💭</div>
                  <p>아직 답변이 없습니다.</p>
                  <p>첫 번째 답변을 작성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {answers.map((answer, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {answer.user_id}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {answer.answered_at}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isAuthenticated && user?.id === answer.user_id && (
                            <>
                              <button
                                onClick={() => handleEditAnswer(answer)}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDeleteAnswer(answer.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                삭제
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleLikeAnswer(answer.id)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                              answer.liked
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            disabled={!isAuthenticated}
                          >
                            <span>{answer.liked ? '❤️' : '🤍'}</span>
                            <span>{answer.likes}</span>
                          </button>
                        </div>
                      </div>

                      <div className="ml-11">
                        {editingAnswerId === answer.id ? (
                          <form onSubmit={handleUpdateAnswer} className="space-y-3">
                            <textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={4}
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                              >
                                취소
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                disabled={!editingContent.trim()}
                              >
                                저장
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p className="text-gray-900 mb-3 whitespace-pre-wrap">
                            {answer.content}
                          </p>
                        )}

                        {answer.ai_comment && (
                          <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                            <h4 className="font-medium text-yellow-900 mb-1">AI 피드백</h4>
                            <p className="text-yellow-800 text-sm">{answer.ai_comment}</p>
                            {answer.score && (
                              <p className="text-yellow-800 text-sm mt-1">점수: {answer.score}</p>
                            )}
                          </div>
                        )}

                        {answer.user_comments && answer.user_comments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {answer.user_comments.map((comment, commentIndex) => (
                              <div key={comment.id || commentIndex} className="p-2 bg-gray-50 rounded text-sm">
                                {editingCommentId === comment.id ? (
                                  <form onSubmit={(e) => handleUpdateComment(comment.id, e)} className="flex flex-col gap-2">
                                    <textarea
                                      value={editingCommentContent}
                                      onChange={(e) => setEditingCommentContent(e.target.value)}
                                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                      rows={2}
                                    />
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        type="button"
                                        onClick={handleCancelCommentEdit}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                      >
                                        취소
                                      </button>
                                      <button
                                        type="submit"
                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        disabled={!editingCommentContent.trim()}
                                      >
                                        저장
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="font-medium">사용자 {comment.user_id}:</span>
                                      <span className="ml-2">{comment.content}</span>
                                      <span className="text-gray-500 ml-2 text-xs">
                                        {comment.commented_at}
                                      </span>
                                    </div>
                                    {isAuthenticated && user?.id === comment.user_id && (
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleEditComment(comment)}
                                          className="text-blue-600 hover:text-blue-800 text-xs"
                                        >
                                          수정
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(comment.id)}
                                          className="text-red-600 hover:text-red-800 text-xs"
                                        >
                                          삭제
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 댓글 작성 폼 */}
                        <div className="mt-4">
                          <form
                            onSubmit={(e) => handleSubmitComment(answer.id, e)}
                            className="flex flex-col sm:flex-row gap-2"
                          >
                            <textarea
                              value={commentInputs[answer.id] || ''}
                              onChange={(e) => handleCommentInputChange(answer.id, e.target.value)}
                              placeholder="이 답변에 대한 댓글을 작성해주세요..."
                              rows={2}
                              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              disabled={commentSubmitting[answer.id]}
                            />
                            <button
                              type="submit"
                              disabled={!commentInputs[answer.id]?.trim() || commentSubmitting[answer.id]}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {commentSubmitting[answer.id] ? '댓글 작성 중...' : '댓글 작성'}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 사이드바 - 연관질문 */}
          <div className="lg:col-span-1">
            <RelatedQuestions
              questionId={question.question_id}
              onQuestionClick={(relatedQuestion) => {
                navigate(`/questions/${relatedQuestion.question_id}`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;