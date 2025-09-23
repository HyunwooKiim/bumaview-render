import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-600">
              Bumaview
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/questions" className="text-gray-600 hover:text-gray-900 transition-colors">
              질문 목록
            </Link>
            <Link to="/interview" className="text-gray-600 hover:text-gray-900 transition-colors">
              AI 면접
            </Link>
            <Link to="/reviews" className="text-gray-600 hover:text-gray-900 transition-colors">
              면접 리뷰
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/mypage" className="text-gray-600 hover:text-gray-900 transition-colors">
                  {user?.username}님
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                  로그인
                </Link>
                <Link to="/signup" className="btn-primary">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;