import React, { useState, useEffect } from 'react';
import { getRelatedQuestions } from '../../services/api';
import { RelatedQuestion } from '../../types';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface RelatedQuestionsProps {
  questionId: number;
  onQuestionClick?: (question: RelatedQuestion) => void;
}

const RelatedQuestions: React.FC<RelatedQuestionsProps> = ({
  questionId,
  onQuestionClick
}) => {
  const [relatedQuestions, setRelatedQuestions] = useState<RelatedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (questionId) {
      fetchRelatedQuestions();
    }
  }, [questionId]);

  const fetchRelatedQuestions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRelatedQuestions(questionId);
      setRelatedQuestions(response.related_questions);
    } catch (err: any) {
      setError(err.message || '연관질문을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question: RelatedQuestion) => {
    if (onQuestionClick) {
      onQuestionClick(question);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.8) return 'text-green-600 bg-green-100';
    if (similarity >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">🔗 연관질문</h3>
        <LoadingSpinner text="연관질문을 불러오는 중..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">🔗 연관질문</h3>
        <ErrorMessage message={error} onClose={() => setError(null)} />
        <button
          onClick={fetchRelatedQuestions}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (relatedQuestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">🔗 연관질문</h3>
        <p className="text-gray-500 text-center py-4">
          연관된 질문을 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">
        🔗 연관질문 ({relatedQuestions.length}개)
      </h3>

      <div className="space-y-4">
        {relatedQuestions.map((question, index) => (
          <div
            key={question.question_id}
            onClick={() => handleQuestionClick(question)}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">
                  #{index + 1}
                </span>
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  {question.category}
                </span>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {question.company}
                </span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getSimilarityColor(question.similarity)}`}>
                유사도: {Math.round(question.similarity * 100)}%
              </span>
            </div>

            <p className="text-gray-900 font-medium line-clamp-2">
              {question.content}
            </p>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                질문 ID: {question.question_id}
              </span>
              <span className="text-sm text-blue-600 hover:text-blue-800">
                자세히 보기 →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedQuestions;
