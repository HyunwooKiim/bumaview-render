import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, PlusIcon, ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { questionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Question } from '../types';

const QuestionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]); // 전체 질문 목록
  const [filters, setFilters] = useState({
    content: '',
    category: '',
    company: '',
    question_at: undefined as number | undefined,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(10); // 페이지당 질문 수

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
      const data = await questionsAPI.getAll();
      
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

        // 부분 검색 기능 적용
        const filteredData = questionsWithDetails.filter(question => {
          const matchesContent = !filters.content || 
            question.content.toLowerCase().includes(filters.content.toLowerCase()) ||
            question.company.toLowerCase().includes(filters.content.toLowerCase()) ||
            question.category.toLowerCase().includes(filters.content.toLowerCase());
          
          const matchesCategory = !filters.category || question.category === filters.category;
          const matchesCompany = !filters.company || 
            question.company.toLowerCase().includes(filters.company.toLowerCase());
          const matchesDate = !filters.question_at || question.question_at === filters.question_at;
          
          return matchesContent && matchesCategory && matchesCompany && matchesDate;
        });
        
        setAllQuestions(filteredData);
        setQuestions(filteredData);
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">질문 목록</h1>
          {isAuthenticated ? (
            <Link
              to="/questions/create"
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>질문 등록</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn-secondary flex items-center space-x-2"
            >
              <LockClosedIcon className="w-5 h-5" />
              <span>로그인 후 질문 등록</span>
            </Link>
          )}
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">질문 내용</label>
              <div className="relative">
                <input
                  type="text"
                  value={filters.content}
                  onChange={(e) => handleFilterChange('content', e.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="input-field w-full pr-10"
                />
                <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field w-full"
              >
                <option value="">전체</option>
                <option value="프로그래밍">프로그래밍</option>
                <option value="인성면접">인성면접</option>
                <option value="코딩테스트">코딩테스트</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">회사</label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                placeholder="회사명을 입력하세요"
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
              <input
                type="date"
                value={filters.question_at}
                onChange={(e) => handleFilterChange('question_at', e.target.value)}
                className="input-field w-full"
              />
            </div>
          </form>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">질문을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="btn-primary"
              >
                다시 시도
              </button>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600 mb-4">검색 조건을 바꾸거나 새로운 질문을 등록해보세요.</p>
              {isAuthenticated ? (
                <Link
                  to="/questions/create"
                  className="btn-primary"
                >
                  첫 번째 질문 등록하기
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-secondary flex items-center justify-center space-x-2 mx-auto w-fit"
                >
                  <LockClosedIcon className="w-5 h-5" />
                  <span>로그인 후 질문 등록</span>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  총 <span className="font-medium text-gray-900">{allQuestions.length}</span>개의 질문
                  {allQuestions.length > 0 && (
                    <span className="ml-2">
                      ({indexOfFirstQuestion + 1}-{Math.min(indexOfLastQuestion, allQuestions.length)})
                    </span>
                  )}
                </p>
              </div>

              {/* Questions List */}
              {currentQuestions.map((question) => (
                <div key={question.question_id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-2">
                        <Link 
                          to={`/questions/${question.question_id}`}
                          className="text-gray-900 hover:text-blue-600 font-medium text-lg block mb-2"
                        >
                          {question.content}
                        </Link>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {question.category}
                          </span>
                          <span>{question.company}</span>
                          <span>{question.question_at}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div>
                          <p className="text-sm text-gray-500">답변 수</p>
                          <p className="font-medium">{question.answers?.length || 0}개</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !error && allQuestions.length > questionsPerPage && (
          <div className="flex items-center justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button 
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                이전
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const showPage = 
                  pageNumber === 1 || 
                  pageNumber === totalPages || 
                  (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2);
                
                if (!showPage) {
                  if (pageNumber === currentPage - 3 || pageNumber === currentPage + 3) {
                    return <span key={pageNumber} className="px-2">...</span>;
                  }
                  return null;
                }
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button 
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                다음
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionsPage;