import axios from 'axios';
import {
  Question,
  Answer,
  FilteredQuestionResponse,
  CreateQuestionRequest,
  CreateAnswerRequest,
  User,
  LoginRequest,
  SignupRequest,
  AuthResponse,
  RelatedQuestionsResponse,
  AIQuestionRequest,
  QuestionIdResponse,
  QuestionResponse,
  UpdateQuestionRequest
} from '../types';

// JWT 토큰 디코딩 함수
const decodeJWT = (token: string) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

// 토큰 만료 확인 함수
const isTokenExpired = (token: string) => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

const API_BASE_URL = 'https://bumaview-dev-ehi4ktpzza-du.a.run.app';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
  withCredentials: true, // CORS 쿠키 및 헤더 허용
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      if (!token.includes('.') || token.split('.').length !== 3) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return config;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials);
    
    const authHeader = response.headers.authorization || 
                      response.headers.Authorization;
    
    if (authHeader) {
      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.replace('Bearer ', '') 
        : authHeader;
      
      return {
        ...response.data,
        token: token
      };
    } else {
      const bodyToken = response.data.token || 
                       response.data.accessToken || 
                       response.data.access_token;
      
      if (bodyToken) {
        return {
          ...response.data,
          token: bodyToken
        };
      }
      
      throw new Error('로그인 응답에서 토큰을 찾을 수 없습니다.');
    }
  },
  
  register: async (userData: { username: string; password: string }) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  
  refresh: async () => {
    const response = await api.post('/api/token/reissue');
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },
  
  checkTokenStatus: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    return { 
      token: !!token, 
      user: !!user, 
      decoded: token ? decodeJWT(token) : null 
    };
  },
};

// User API
export const usersAPI = {
  getMe: async () => {
    const response = await api.get('/api/users/me');
    return response.data;
  },
  
  getMyAnswers: async () => {
    const response = await api.get('/api/answers/my');
    return response.data;
  },
  
  getById: async (userId: number) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },
  
  create: async (userData: { username: string; password: string; role: 'ADMIN' | 'USER' }) => {
    const response = await api.post('/api/users', userData);
    return response.data;
  },
  
  updatePassword: async (passwordData: { current_password: string; new_password: string }) => {
    const response = await api.patch('/api/users', passwordData);
    return response.data;
  },
  
  delete: async (userId: number) => {
    const response = await api.delete('/api/users', { data: { user_id: userId } });
    return response.data;
  },
};

// Questions API
export const questionsAPI = {
  getAll: async () => {
    const response = await api.get('/api/questions');
    return response.data;
  },
  
  getFiltered: async (filters: {
    content?: string;
    category?: string;
    company?: string;
    question_at?: number;
    madeby?: string;
  }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/api/questions/filtered?${params.toString()}`);
    return response.data;
  },
  
  getById: async (id: number): Promise<QuestionResponse> => {
    const response = await api.get(`/api/questions/${id}`);
    return response.data;
  },
  
  getMyQuestions: async (page: number = 1, size: number = 10): Promise<FilteredQuestionResponse[]> => {
    const response = await api.get('/api/questions/user/me', { params: { page, size } });
    return response.data;
  },

  updateQuestion: async (questionId: number, data: UpdateQuestionRequest): Promise<any> => {
    const response = await api.patch(`/api/questions/${questionId}`, data);
    return response.data;
  },

  create: async (questionData: {
    content: string;
    category: string;
    company: string;
    question_at: number;
  }) => {
    const response = await api.post('/api/questions', questionData);
    return response.data;
  },
  
  generateAiQuestion: async (data: AIQuestionRequest): Promise<QuestionIdResponse> => {
    const response = await api.post('/api/questions/ai', data, {
      timeout: 120000, // 2 minutes for AI generation
    });
    return response.data;
  },
  
  createFromCSV: async (csvFile: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', csvFile);

    const response = await api.post('/api/questions/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 600000, // 10 minutes
    });
    return response.data;
  },
  
  delete: async (questionId: number) => {
    const response = await api.delete(`/api/questions/${questionId}`);
    return response.data;
  },
};

// Answers API
export const answersAPI = {
  create: async (answerData: { question_id: number; content: string }) => {
    const response = await api.post(`/api/answers/create/${answerData.question_id}`, answerData);
    return response.data;
  },
  
  getByQuestionId: async (questionId: number) => {
    const response = await api.get(`/api/answers/question/${questionId}`);
    return response.data;
  },
  
  getMy: async () => {
    const response = await api.get('/api/answers/my');
    return response.data;
  },

  getById: async (answerId: number) => {
    const response = await api.get(`/api/answers/detail/${answerId}`);
    return response.data;
  },

  like: async (answerId: number) => {
    const response = await api.post('/api/answers/like', { answer_id: answerId });
    return response.data;
  },
  
  unlike: async (answerId: number) => {
    const response = await api.delete('/api/answers/unlike', { data: { answer_id: answerId } });
    return response.data;
  },

  createComment: async (commentData: { answer_id: number; content: string }) => {
    const response = await api.post('/api/answers/comments', commentData);
    return response.data;
  },

  update: async (answerId: number, content: string) => {
    const response = await api.patch(`/api/answers/detail/${answerId}`, { content });
    return response.data;
  },

  delete: async (answerId: number) => {
    const response = await api.delete(`/api/answers/detail/${answerId}`);
    return response.data;
  },

  updateComment: async (commentId: number, content: string) => {
    const response = await api.patch(`/api/answers/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (commentId: number) => {
    const response = await api.delete(`/api/answers/comments/${commentId}`);
    return response.data;
  },
};

// STT API
export const sttAPI = {
  transcribe: async (audioFile: File): Promise<{ transcription: string }> => {
    const formData = new FormData();
    formData.append('file', audioFile);

    const response = await api.post('/api/stt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Reviews API
export const reviewsAPI = {
  getAll: async () => {
    const response = await api.get('/api/reviews');
    return response.data;
  },
  
  getById: async (reviewId: string) => {
    const response = await api.get(`/api/reviews/${reviewId}`);
    return response.data;
  },
  
  getFiltered: async (filters: { category?: string; company?: string }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/api/reviews/filtered?${params.toString()}`);
    return response.data;
  },
  
  create: async (reviewData: {
    title: string;
    content: string;
    company: string;
    category: string;
    rating: number;
  }) => {
    const response = await api.post('/api/reviews', reviewData);
    return response.data;
  },
  
  createComment: async (commentData: { review_id: number; content: string }) => {
    const response = await api.post('/api/reviews/comment', commentData);
    return response.data;
  },
  
  updateComment: async (commentData: { comment_id: number; content: string }) => {
    const response = await api.patch('/api/reviews/comment', commentData);
    return response.data;
  },
};

// 연관질문 API
export const getRelatedQuestions = async (questionId: number): Promise<RelatedQuestionsResponse> => {
  try {
    const response = await api.get(`/api/questions/${questionId}/related`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '연관질문 조회에 실패했습니다.');
  }
};

export default api;