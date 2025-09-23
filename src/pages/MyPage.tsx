import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface UserProfile {
  user_id: number;
  username: string;
  role: string;
  created_at: string;
}

interface UserAnswer {
  user_id: number;
  likes: number;
  liked: boolean;
  content: string;
  answered_at: string;
  ai_comment: string;
  score: number;
  user_comments: Array<{
    user_id: number;
    content: string;
    commented_at: string;
  }>;
}

const MyPage: React.FC = () => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 사용자 프로필과 답변을 동시에 가져오기
      const [profile, answers] = await Promise.all([
        usersAPI.getMe(),
        usersAPI.getMyAnswers()
      ]);
      
      setUserProfile(profile);
      setUserAnswers(answers);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      
      if (authUser) {
        setUserProfile({
          user_id: authUser.user_id || 0,
          username: authUser.username || '사용자',
          role: authUser.role || 'USER',
          created_at: new Date().toISOString()
        });
      } else {
        setError('사용자 정보를 불러올 수 없습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600">마이페이지를 보려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {userProfile?.username || '사용자'}님의 마이페이지
          </h1>
          
          <div className="space-y-4">
            <div>
              <span className="font-medium text-gray-600">사용자 ID:</span>
              <span className="ml-2 text-gray-900">{userProfile?.user_id}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">사용자명:</span>
              <span className="ml-2 text-gray-900">{userProfile?.username}</span>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">역할:</span>
              <span className="ml-2 text-gray-900">
                {userProfile?.role === 'ADMIN' ? '관리자' : '일반 사용자'}
              </span>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">가입일:</span>
              <span className="ml-2 text-gray-900">
                {userProfile?.created_at 
                  ? new Date(userProfile.created_at).toLocaleDateString('ko-KR')
                  : '정보 없음'
                }
              </span>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 내 답변 섹션 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">내 답변 목록</h2>
          
          {userAnswers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">아직 작성한 답변이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userAnswers.map((answer, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  {/* 답변 내용 */}
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">답변 내용</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{answer.content}</p>
                  </div>
                  
                  {/* AI 점수와 피드백 */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600">AI 평가</span>
                      <span className="text-lg font-bold text-blue-600">{answer.score}점</span>
                    </div>
                    {answer.ai_comment && (
                      <p className="text-sm text-gray-700">{answer.ai_comment}</p>
                    )}
                  </div>
                  
                  {/* 통계 정보 */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>좋아요 {answer.likes}개</span>
                    <span>댓글 {answer.user_comments.length}개</span>
                    <span>{new Date(answer.answered_at).toLocaleDateString('ko-KR')}</span>
                  </div>
                  
                  {/* 사용자 댓글 */}
                  {answer.user_comments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">댓글</h4>
                      <div className="space-y-2">
                        {answer.user_comments.map((comment, commentIndex) => (
                          <div key={commentIndex} className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-700">{comment.content}</p>
                            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                              <span>사용자 {comment.user_id}</span>
                              <span>{new Date(comment.commented_at).toLocaleDateString('ko-KR')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
