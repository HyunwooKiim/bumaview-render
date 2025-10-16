import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CreateQuestionRequest } from '../types';

const CreateQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateQuestionRequest>({
    content: '',
    category: '',
    company: '',
    question_at: Math.floor(Date.now() / 1000), // Unix timestamp
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [error, setError] = useState('');

  // 로그인하지 않은 사용자는 접근 불가
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-6">질문을 등록하려면 먼저 로그인해주세요.</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              로그인하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      setError('질문 내용을 입력해주세요.');
      return;
    }
    if (!formData.category) {
      setError('카테고리를 선택해주세요.');
      return;
    }
    if (!formData.company.trim()) {
      setError('회사명을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const result = await questionsAPI.create(formData);
      
      if (result.question_id) {
        navigate(`/questions/${result.question_id}`);
      } else {
        navigate('/questions');
      }
    } catch (error: any) {
      handleApiError(error, '질문 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCsvButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCsv(true);
    setError('');

    try {
      await questionsAPI.createFromCSV(file);
      alert('CSV 파일이 성공적으로 업로드되었습니다.');
      navigate('/questions');
    } catch (error: any) {
      handleApiError(error, 'CSV 업로드에 실패했습니다');
    } finally {
      setIsUploadingCsv(false);
      // 파일 입력을 초기화하여 동일한 파일을 다시 선택할 수 있도록 함
      if(fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApiError = (error: any, defaultMessage: string) => {
    if (error.response?.status === 401) {
      setError('인증이 만료되었습니다. 페이지를 새로고침하거나 다시 로그인해주세요.');
    } else if (error.response?.status === 400) {
      setError(`잘못된 요청입니다: ${error.response?.data?.message || '입력 데이터를 확인해주세요'}`);
    } else if (error.response?.status === 500) {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      setError(`${defaultMessage}: ${error.response?.data?.message || error.message || '알 수 없는 오류'}`);
    }
  };

  const categories = [
    { value: '', label: '카테고리 선택' },
    { value: '프로그래밍', label: '프로그래밍' },
    { value: '인성면접', label: '인성면접' },
    { value: '코딩테스트', label: '코딩테스트' },
    { value: '기술면접', label: '기술면접' },
    { value: '포트폴리오', label: '포트폴리오' },
    { value: '기타', label: '기타' },
  ];

  const companies = [
    '네이버', '카카오', '삼성전자', 'LG전자', 'SK하이닉스', 
    '현대자동차', '기아', 'LG화학', 'POSCO', 'KT',
    'NCSoft', '넥슨', '크래프톤', '쿠팡', '배달의민족',
    '토스', '라인', '우아한형제들', '당근마켓', '직방'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">새 질문 등록</h1>
            <p className="mt-1 text-sm text-gray-600">
              면접에서 받은 질문을 공유해주세요. 다른 사용자들에게 도움이 됩니다.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* 질문 내용 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                질문 내용 *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={4}
                className="input-field w-full"
                placeholder="면접에서 받은 질문을 자세히 적어주세요..."
                required
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field w-full"
                required
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 회사명 */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                회사명 *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="면접을 본 회사명을 입력해주세요"
                list="company-suggestions"
                required
              />
              <datalist id="company-suggestions">
                {companies.map((company) => (
                  <option key={company} value={company} />
                ))}
              </datalist>
            </div>

            {/* 면접 날짜 */}
            <div>
              <label htmlFor="question_date" className="block text-sm font-medium text-gray-700 mb-2">
                면접 날짜
              </label>
              <input
                type="date"
                id="question_date"
                name="question_date"
                onChange={(e) => {
                  if (e.target.value) {
                    const timestamp = Math.floor(new Date(e.target.value).getTime() / 1000);
                    setFormData(prev => ({ ...prev, question_at: timestamp }));
                  }
                }}
                className="input-field"
                max={new Date().toISOString().split('T')[0]}
              />
              <p className="mt-1 text-xs text-gray-500">
                면접을 본 날짜를 선택해주세요 (선택사항)
              </p>
            </div>

            {/* 제출 버튼 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/questions')}
                className="btn-secondary"
              >
                취소
              </button>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCsvButtonClick}
                  disabled={isSubmitting || isUploadingCsv}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploadingCsv ? '업로드 중...' : 'CSV로 등록'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingCsv}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '등록 중...' : '질문 등록'}
                </button>
              </div>
            </div>
          </form>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".csv"
          />
        </div>

        {/* 도움말 섹션 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 질문 등록 팁</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 질문은 구체적이고 명확하게 작성해주세요</li>
            <li>• 면접관이 실제로 물어본 질문을 그대로 기록해주세요</li>
            <li>• 비슷한 질문이 이미 있는지 먼저 확인해보세요</li>
            <li>• 개인정보나 회사 기밀은 포함하지 마세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestionPage;
