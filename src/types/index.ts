// User types
export interface User {
  user_id: number;
  username: string;
  role: 'ADMIN' | 'USER';
  created_at?: string;
}

// Question types
export interface Question {
  question_id: number;
  user_id: number;
  content: string;
  category: string;
  company: string;
  question_at: number;
  score?: number;
  ai_comment?: string;
  evaluated_at?: string;
  answers?: Answer[];
  // 추가 필드 (계산된 값들)
  related_count?: number;
  rating?: number;
}

export interface CreateQuestionRequest {
  content: string;
  category: string;
  company: string;
  question_at: number;
}

// Answer types
export interface UserComment {
  user_id: number;
  content: string;
  commented_at: string;
}

export interface Answer {
  user_id: number;
  likes: number;
  liked: boolean;
  content: string;
  answered_at: string;
  ai_comment?: string;
  score?: number;
  user_comments?: UserComment[];
}

export interface CreateAnswerRequest {
  question_at: number;
  content: string;
}

// Review types
export interface Review {
  review_id: number;
  user_id: number;
  title: string;
  content: string;
  company: string;
  category: string;
  rating: number;
  created_at: string;
  // 추가 필드 (레거시 호환성)
  date?: string;
  comments?: any[];
}

export interface CreateReviewRequest {
  title: string;
  content: string;
  company: string;
  category: string;
  rating: number;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
  role: 'ADMIN' | 'USER';
}