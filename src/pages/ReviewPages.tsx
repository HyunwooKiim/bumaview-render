import React, { useState, useEffect } from 'react';
import { HeartIcon, ExclamationTriangleIcon, PlusIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { reviewsAPI } from '../services/api';
import { Review } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ReviewsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filters, setFilters] = useState({
    company: '',
    category: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  // 페이지가 다시 포커스될 때 리뷰 목록 새로고침
  useEffect(() => {
    const handleFocus = () => {
      fetchReviews();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // 컴포넌트가 마운트될 때도 새로고침
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reviewsAPI.getAll();
      
      if (Array.isArray(data)) {
        // 필터링 적용
        const filteredData = data.filter(review => 
          (!filters.company || review.company.toLowerCase().includes(filters.company.toLowerCase())) &&
          (!filters.category || review.category.toLowerCase().includes(filters.category.toLowerCase()))
        );
        setReviews(filteredData);
      } else {
        console.warn('Unexpected data format:', data);
        setReviews([]);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      setError('리뷰를 불러오는 데 실패했습니다. 다시 시도해주세요.');
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleRetry = () => {
    fetchReviews();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-gray-900">면접 리뷰</h1>
            <button
              onClick={fetchReviews}
              className="btn-secondary text-sm"
              disabled={isLoading}
            >
              {isLoading ? '새로고침 중...' : '새로고침'}
            </button>
          </div>
          {isAuthenticated ? (
            <Link to="/reviews/create" className="btn-primary flex items-center space-x-2">
              <PlusIcon className="w-5 h-5" />
              <span>리뷰 작성</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn-secondary flex items-center space-x-2"
            >
              <LockClosedIcon className="w-5 h-5" />
              <span>로그인 후 리뷰 작성</span>
            </Link>
          )}
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <input
                type="text"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                placeholder="카테고리를 입력하세요"
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">리뷰를 불러오는 중...</p>
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
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <HeartIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 리뷰가 없습니다</h3>
              <p className="text-gray-600 mb-4">첫 번째 면접 리뷰를 작성해보세요!</p>
              {isAuthenticated ? (
                <Link to="/reviews/create" className="btn-primary">
                  리뷰 작성하기
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-secondary flex items-center justify-center space-x-2 mx-auto w-fit"
                >
                  <LockClosedIcon className="w-5 h-5" />
                  <span>로그인 후 리뷰 작성</span>
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  총 <span className="font-medium text-gray-900">{reviews.length}</span>개의 리뷰
                </p>
              </div>

              {/* Reviews List */}
              {reviews.map((review) => (
                <Link
                  key={review.review_id}
                  to={`/reviews/${review.review_id}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{review.company}</h3>
                          <span className="text-gray-500">·</span>
                          <span className="text-gray-700">{review.category}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>면접일: {review.date}</span>
                          <span>작성자 ID: {review.user_id}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">리뷰 내용</h4>
                        <p className="text-gray-700 leading-relaxed">{review.content}</p>
                      </div>

                      {review.comments && review.comments.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">댓글 ({review.comments.length})</h4>
                          <div className="space-y-2 pl-4 border-l-2 border-gray-200">
                            {review.comments.map((comment, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-medium text-gray-900">사용자 {comment.user_id}</span>
                                </div>
                                <p className="text-sm text-gray-700">{comment.content}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>작성일: {new Date(review.created_at).toLocaleDateString()}</span>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                          <HeartIcon className="w-4 h-4" />
                          <span>좋아요</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;