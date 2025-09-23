import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HeartIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { questionsAPI, answersAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  question_id: number;
  content: string;
  category: string;
  company: string;
  question_at: string;
}

interface Answer {
  answer_id: number;
  content: string;
  user_name: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
}

const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuestionDetail();
    }
  }, [id]);

  const fetchQuestionDetail = async () => {
    try {
      setIsLoading(true);
      const questionData = await questionsAPI.getById(id || '');
      setQuestion(questionData);
      
      // API 명세서에 따르면 질문 조회 시 답변도 함께 반환됨
      if (questionData.answers) {
        // 각 답변의 사용자 이름을 조회
        const formattedAnswers = await Promise.all(
          questionData.answers.map(async (answer: any, index: number) => {
            let userName = `사용자 ${answer.user_id}`;
            
            // 사용자 정보 조회 시도
            try {
              const userInfo = await usersAPI.getById(answer.user_id);
              userName = userInfo.username || userName;
            } catch (error) {
              console.warn(`사용자 ${answer.user_id} 정보 조회 실패:`, error);
              // 실패하면 기본값 사용
            }
            
            return {
              answer_id: answer.id || index + 1,
              content: answer.content,
              user_name: userName,
              created_at: answer.answered_at,
              likes_count: answer.likes || 0,
              is_liked: answer.liked || false,
            };
          })
        );
        setAnswers(formattedAnswers);
      } else {
        setAnswers([]);
      }
    } catch (error) {
      console.error('Failed to fetch question detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim() || !id || !isAuthenticated || !question) return;

    try {
      setIsSubmitting(true);
      await answersAPI.create({
        question_at: Number(question.question_at),
        content: newAnswer
      });
      setNewAnswer('');
      fetchQuestionDetail(); // Refresh answers
    } catch (error) {
      console.error('Failed to submit answer:', error);
      alert('답변 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeAnswer = async (answerId: number) => {
    if (!isAuthenticated) {
      alert('좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }

    try {
      const answer = answers.find(a => a.answer_id === answerId);
      if (!answer) return;

      if (answer.is_liked) {
        await answersAPI.unlike(answerId);
      } else {
        await answersAPI.like(answerId);
      }
      
      // Update local state
      setAnswers(prev => prev.map(a => 
        a.answer_id === answerId 
          ? { 
              ...a, 
              is_liked: !a.is_liked,
              likes_count: a.is_liked ? a.likes_count - 1 : a.likes_count + 1
            }
          : a
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">질문을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">질문</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>답변 수: <span className="font-medium">{answers.length}개</span></span>
            </div>
          </div>

          {/* Question Content */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">질문 내용</h2>
            <p className="text-lg text-gray-800 leading-relaxed p-4 bg-gray-50 rounded-lg border">
              {question.content}
            </p>
          </div>
        </div>

        {/* Question Metadata Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {question.category}
            </span>
            <span className="text-gray-600">{question.company}</span>
            <span className="text-gray-500 text-sm">{question.question_at}</span>
          </div>
        </div>

        {/* Related Questions Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">연관 질문</h2>
          <div className="space-y-3">
            <p className="text-gray-700">Q. 제가 당신을 채용한다는 근거가 있으신가요? 어떤근거로 그런말을 하신거죠?????!?!?!?!?!?</p>
            <p className="text-gray-700">Q. 제가 당신을 채용한다는 근거가 있으신가요? 어떤근거로 그런말을 하신거죠?????!?!?!?!?!?</p>
            <p className="text-gray-700">Q. 제가 당신을 채용한다는 근거가 있으신가요? 어떤근거로 그런말을 하신거죠?????!?!?!?!?!?</p>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">답변 ({answers.length}개)</h2>
          </div>

          {/* Answer Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitAnswer} className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">답변</span>
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="답변을 입력해 주세요"
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="input-field flex-1"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !newAnswer.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? '작성 중...' : '제출'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <LockClosedIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">답변을 작성하려면 로그인이 필요합니다</h3>
                  <p className="text-gray-600 mb-4">로그인하고 다른 사용자들과 지식을 공유해보세요!</p>
                  <Link
                    to="/login"
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <span>로그인하기</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Answers List */}
          <div className="space-y-6">
            {answers.map((answer) => (
              <div key={answer.answer_id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium text-gray-900">{answer.user_name}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleLikeAnswer(answer.answer_id)}
                      className={`flex items-center space-x-1 transition-colors ${
                        isAuthenticated 
                          ? 'text-gray-500 hover:text-red-500' 
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!isAuthenticated}
                    >
                      {answer.is_liked ? (
                        <HeartSolid className="w-5 h-5 text-red-500" />
                      ) : (
                        <HeartIcon className="w-5 h-5" />
                      )}
                      <span>{answer.likes_count}</span>
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{answer.content}</p>
                <p className="text-sm text-gray-500">{answer.created_at}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetailPage;