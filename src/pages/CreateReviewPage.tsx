import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const CreateReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    company: '',
    category: '',
    rating: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // 입력 시 해당 필드의 에러 제거
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }
    if (!formData.content.trim()) {
      newErrors.content = '리뷰 내용을 입력해주세요.';
    }
    if (!formData.company.trim()) {
      newErrors.company = '회사명을 입력해주세요.';
    }
    if (!formData.category.trim()) {
      newErrors.category = '카테고리를 선택해주세요.';
    }
    if (formData.rating === 0) {
      newErrors.rating = '평점을 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await reviewsAPI.create(formData);
      
      // 응답이 실제로 성공인지 확인
      if (response && (response.review_id || response.id)) {
        alert('리뷰가 성공적으로 작성되었습니다!');
        navigate('/reviews', { replace: true });
      } else {
        alert('리뷰 작성 응답이 예상과 다릅니다. 목록을 확인해주세요.');
        navigate('/reviews', { replace: true });
      }
    } catch (error) {
      console.error('Failed to create review:', error);
      alert('리뷰 작성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // 로그인 페이지로 리다이렉트 중
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">면접 리뷰 작성</h1>
          <p className="text-gray-600">면접 경험을 공유하여 다른 사용자들에게 도움을 주세요.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="리뷰 제목을 입력해주세요"
                className={`input-field w-full ${errors.title ? 'border-red-500' : ''}`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Company */}
            <div className="mb-6">
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                회사명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="면접을 본 회사명을 입력해주세요"
                className={`input-field w-full ${errors.company ? 'border-red-500' : ''}`}
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company}</p>
              )}
            </div>

            {/* Category */}
            <div className="mb-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                직무/카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`input-field w-full ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="">카테고리를 선택해주세요</option>
                <option value="프론트엔드">프론트엔드</option>
                <option value="백엔드">백엔드</option>
                <option value="풀스택">풀스택</option>
                <option value="데이터사이언스">데이터사이언스</option>
                <option value="DevOps">DevOps</option>
                <option value="모바일">모바일</option>
                <option value="AI/ML">AI/ML</option>
                <option value="기타">기타</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전체적인 평점 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                  >
                    {star <= formData.rating ? (
                      <StarSolid className="w-8 h-8 text-yellow-400" />
                    ) : (
                      <StarIcon className="w-8 h-8 text-gray-300" />
                    )}
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.rating > 0 ? `${formData.rating}점` : '평점을 선택해주세요'}
                </span>
              </div>
              {errors.rating && (
                <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
              )}
            </div>

            {/* Content */}
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                리뷰 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                name="content"
                rows={10}
                value={formData.content}
                onChange={handleInputChange}
                placeholder="면접 과정, 분위기, 질문 내용, 팁 등을 자세히 작성해주세요."
                className={`input-field w-full ${errors.content ? 'border-red-500' : ''}`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                최소 50자 이상 작성해주세요. 구체적이고 도움이 되는 정보를 포함해주세요.
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/reviews')}
              className="btn-secondary"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '작성 중...' : '리뷰 작성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReviewPage;