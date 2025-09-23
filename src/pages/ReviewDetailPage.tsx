import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StarIcon, HeartIcon, ChatBubbleLeftIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Review {
  review_id: number;
  user_id: number;
  title: string;
  content: string;
  company: string;
  category: string;
  rating: number;
  created_at: string;
  comments?: Comment[];
}

interface Comment {
  comment_id: number;
  user_id: number;
  content: string;
  created_at: string;
  user_name?: string;
}

const ReviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [review, setReview] = useState<Review | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (id) {
      fetchReviewDetail();
    }
  }, [id]);

  const fetchReviewDetail = async () => {
    try {
      setIsLoading(true);
      const reviewData = await reviewsAPI.getById(id || '');
      setReview(reviewData);
      
      // 댓글이 있으면 설정
      if (reviewData.comments) {
        setComments(reviewData.comments);
      }
    } catch (error) {
      console.error('Failed to fetch review detail:', error);
      alert('리뷰를 불러오는데 실패했습니다.');
      navigate('/reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !review || !isAuthenticated) return;

    try {
      setIsSubmittingComment(true);
      const response = await reviewsAPI.createComment({
        review_id: review.review_id,
        content: newComment
      });
      
      // 새 댓글을 목록에 추가
      const newCommentData: Comment = {
        comment_id: response.comment_id,
        user_id: 0, // 실제 user_id는 백엔드에서 설정
        content: newComment,
        created_at: new Date().toISOString(),
        user_name: '나' // 현재 사용자
      };
      
      setComments(prev => [...prev, newCommentData]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      alert('좋아요를 누르려면 로그인이 필요합니다.');
      return;
    }
    
    // 임시로 로컬 상태만 업데이트 (실제로는 API 호출 필요)
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">리뷰를 찾을 수 없습니다.</p>
          <Link to="/reviews" className="btn-primary">
            리뷰 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/reviews')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>리뷰 목록으로 돌아가기</span>
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{review.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    {review.category}
                  </span>
                  <span className="font-medium">{review.company}</span>
                  <span>작성자 ID: {review.user_id}</span>
                </div>
                
                {/* Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-sm font-medium text-gray-700">평점:</span>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <div key={star}>
                        {star <= review.rating ? (
                          <StarSolid className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">{review.rating}/5</span>
                  </div>
                </div>
              </div>
              
              {/* Like Button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                    liked 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {liked ? (
                    <HeartSolid className="w-5 h-5" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  <span>{likeCount}</span>
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              작성일: {new Date(review.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Review Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">리뷰 내용</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {review.content}
            </p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <ChatBubbleLeftIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              댓글 ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 작성해주세요..."
                    rows={3}
                    className="input-field w-full"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingComment ? '작성 중...' : '댓글 작성'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
              <Link to="/login" className="btn-primary">
                로그인하기
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">아직 댓글이 없습니다.</p>
                <p className="text-gray-400 text-sm">첫 번째 댓글을 작성해보세요!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.comment_id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {comment.user_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {comment.user_name || `사용자 ${comment.user_id}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailPage;