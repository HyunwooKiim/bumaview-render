import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon, ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { questionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Question, RelatedQuestion } from '../types';
import RelatedQuestions from '../components/common/RelatedQuestions';

const QuestionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [filters, setFilters] = useState({
    content: '',
    category: '',
    company: '',
    question_at: undefined as number | undefined,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10);

  // URL에서 검색어 파라미터 가져오기
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setFilters(prev => ({ ...prev, content: searchQuery }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  useEffect(() => {
    // 필터가 변경되면 첫 페이지로 이동
    setCurrentPage(1);
  }, [filters]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let data;

      // 필터가 있는지 확인
      const hasFilters = filters.content || filters.category || filters.company || filters.question_at;

      if (hasFilters) {
        // 필터가 있으면 filtered API 사용
        const filterParams: any = {};
        if (filters.content) filterParams.content = filters.content;
        if (filters.category) filterParams.category = filters.cate수정ㅇgory;
        if (filters.company) filterParams.company = filters.company;
        if (filters.question_at) filterParams.question_at = filters.question_at;

        data = await questionsAPI.getFiltered(filterParams);
      } else {
        // 필터가 없으면 전체 조회 API 사용
        data = await questionsAPI.getAll();
      }

      if (Array.isArray(data)) {
        // 각 질문의 상세 정보를 조회하여 답변 수를 정확히 가져오기
        const questionsWithDetails = await Promise.all(
          data.map(async (question) => {
            try {
              const detailData = await questionsAPI.getById(question.question_id.toString());
              return {
                ...question,
                answers: detailData.answers || []
              };
            } catch (error) {
              console.warn(`질문 ${question.question_id} 상세 정보 조회 실패:`, error);
              return {
                ...question,
                answers: []
              };
            }
          })
        );

        setAllQuestions(questionsWithDetails);
        setQuestions(questionsWithDetails);
      } else {
        console.warn('Unexpected data format:', data);
        setAllQuestions([]);
        setQuestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setError('질문을 불러오는 데 실패했습니다. 다시 시도해주세요.');
      setAllQuestions([]);
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleRelatedQuestionClick = (relatedQuestion: RelatedQuestion) => {
    // 연관질문을 클릭했을 때 해당 질문을 찾아서 선택
    const foundQuestion = allQuestions.find(q => q.question_id === relatedQuestion.question_id);
    if (foundQuestion) {
      setSelectedQuestion(foundQuestion);
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(allQuestions.length / questionsPerPage);
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = allQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleRetry = () => {
    fetchQuestions();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">면접 질문</h1>
            <p className="text-gray-600 mt-2">다양한 면접 질문을 확인하고 연습해보세요</p>
          </div>
          {isAuthenticated && (
            <Link
              to="/questions/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              질문 등록
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Questions List */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    검색어
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="질문, 회사, 카테고리 검색..."
                      value={filters.content}
                      onChange={(e) => setFilters({...filters, content: e.target.value})}
                      className="pl-10 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">전체 카테고리</option>
                    <option value="기술">기술</option>
                    <option value="인성">인성</option>
                    <option value="경험">경험</option>
                    <option value="상황">상황</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회사
                  </label>
                  <input
                    type="text"
                    placeholder="회사명 검색..."
                    value={filters.company}
                    onChange={(e) => setFilters({...filters, company: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Questions List */}
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">질문을 불러오는 중...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center">
                  <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={fetchQuestions}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {currentQuestions.map((question) => (
                  <div
                    key={question.question_id}
                    className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow ${
                      selectedQuestion?.question_id === question.question_id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {question.category}
                        </span>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {question.company}
                        </span>
                        {question.score !== undefined && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            점수 {question.score}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(question.question_at * 1000).toLocaleDateString()}
                      </span>
                    </div>

                    <h3
                      onClick={() => handleQuestionClick(question)}
                      className="text-lg font-medium text-gray-900 mb-3 line-clamp-2 cursor-pointer hover:text-blue-600"
                    >
                      {question.content}
                    </h3>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span>답변 {question.answers?.length || 0}개</span>
                        <span>질문 ID: {question.question_id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedQuestion?.question_id === question.question_id && (
                          <span className="text-blue-600 font-medium">선택됨</span>
                        )}
                        <Link
                          to={`/questions/${question.question_id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          자세히 보기 →
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg border ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Related Questions */}
          <div className="lg:col-span-1">
            {selectedQuestion ? (
              <RelatedQuestions
                questionId={selectedQuestion.question_id}
                onQuestionClick={handleRelatedQuestionClick}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">🔗 연관질문</h3>
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">👈</div>
                  <p>질문을 선택하면</p>
                  <p>연관된 질문들을 보여드립니다</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;