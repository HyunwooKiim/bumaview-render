import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { reviewsAPI, questionsAPI } from '../services/api';
import { Review, Question } from '../types';

const HomePage: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [featuredQuestions, setFeaturedQuestions] = useState<Question[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const navigate = useNavigate();

  // 최신 리뷰 데이터 가져오기
  useEffect(() => {
    const fetchFeaturedReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const data = await reviewsAPI.getAll();
        if (Array.isArray(data)) {
          // 최신 2개 리뷰만 가져오기
          setFeaturedReviews(data.slice(0, 2));
        }
      } catch (error) {
        console.error('Failed to fetch featured reviews:', error);
        setFeaturedReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    const fetchFeaturedQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        const data = await questionsAPI.getAll();
        if (Array.isArray(data)) {
          // 최신 질문 3개만 가져와서 각각의 상세 정보를 조회하여 답변 수를 정확히 가져오기
          const questionsWithDetails = await Promise.all(
            data.slice(0, 3).map(async (question) => {
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
          setFeaturedQuestions(questionsWithDetails);
        }
      } catch (error) {
        console.error('Failed to fetch featured questions:', error);
        setFeaturedQuestions([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchFeaturedReviews();
    fetchFeaturedQuestions();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      // Navigate to questions page with search params
      navigate(`/questions?search=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      navigate('/questions');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              면접 준비를 위한 모든 것<br />
              <span className="text-blue-600">Bumaview</span>에서
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              다양한 질문과 리뷰를 확인하고 함께 준비하세요.  
              모든 준비생들의 든든한 파트너가 되어드립니다.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="궁금한 면접 질문을 검색해보세요..."
                  className="w-full px-6 py-4 text-lg border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors"
                >
                  <MagnifyingGlassIcon className="w-6 h-6" />
                </button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link to="/questions" className="btn-primary">
                질문 목록 보기
              </Link>
              <Link to="/reviews" className="btn-secondary">
                면접 리뷰 확인
              </Link>
              <Link to="/interview" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                AI 모의면접 체험
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
              <div className="text-gray-700">등록된 질문</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1,200+</div>
              <div className="text-gray-700">면접 리뷰</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">300+</div>
              <div className="text-gray-700">참여 기업</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Questions Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">인기 면접 질문</h2>
            <p className="text-gray-600">실제 면접에서 자주 나온 질문들을 확인해보세요</p>
          </div>
          
          <div className="space-y-6 mb-8">
            {isLoadingQuestions ? (
              // 로딩 스켈레톤
              [1, 2, 3].map((index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-2">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="flex items-center space-x-4">
                          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                          <div className="h-4 w-20 bg-gray-200 rounded"></div>
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                        <div className="h-12 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : featuredQuestions.length > 0 ? (
              featuredQuestions.map((question) => (
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
                          <span>{new Date(question.question_at * 1000).toLocaleDateString()}</span>
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
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">질문 데이터를 불러올 수 없습니다.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link 
              to="/questions" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              더 많은 질문 보기
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Reviews Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">최신 면접 리뷰</h2>
            <p className="text-gray-600">다양한 기업들의 실제 면접 경험을 확인해보세요</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {isLoadingReviews ? (
              // 로딩 스켈레톤
              [1, 2].map((index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-6 w-24 bg-gray-200 rounded"></div>
                          <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="h-4 w-32 bg-gray-200 rounded"></div>
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : featuredReviews.length > 0 ? (
              featuredReviews.map((review) => (
                <div key={review.review_id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
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
                        <p className="text-gray-700 leading-relaxed line-clamp-3">
                          {review.content.length > 150 
                            ? `${review.content.substring(0, 150)}...` 
                            : review.content
                          }
                        </p>
                      </div>

                      {review.comments && review.comments.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-500">댓글 {review.comments.length}개</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>작성일: {new Date(review.created_at).toLocaleDateString()}</span>
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500">
                          <span>좋아요</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">리뷰 데이터를 불러올 수 없습니다.</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <Link 
              to="/reviews" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              더 많은 리뷰 보기
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 가입해보세요!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            면접 준비의 합격 비결, Bumaview와 함께라면 가능합니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              to="/signup" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              회원가입 하기
            </Link>
            <Link 
              to="/questions" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-medium"
            >
              질문 보러가기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;