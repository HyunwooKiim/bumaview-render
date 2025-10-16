// User types
export interface User {
  id: string;
  username: string;
  role: string;
}

// Question types (API 스키마에 맞게 수정)
export interface QuestionResponse {
  id: number;
  content: string;
  category: string;
  company: string;
  question_at: number;
  user_id: number;
  madeby: string;
}

export interface FilteredQuestionResponse {
  question_id: number;
  user_id: number;
  content: string;
  category: string;
  company: string;
  question_at: number;
  score: number;
  ai_comment: string;
  evaluated_at: string;
  answers: AnswerWithDetailsResponse[];
}

// Answer types (API 스키마에 맞게 수정)
export interface AnswerResponse {
  id: number;
  question_id: number;
  user_id: string;
  content: string;
  likes: number;
  answered_at: string;
}

export interface AnswerWithDetailsResponse {
  user_id: string;
  likes: number;
  liked: boolean;
  content: string;
  answered_at: string;
  ai_comment: string;
  score: number;
  user_comments: UserCommentResponse[];
}

export interface AnswerWithCommentsResponse {
  id: number;
  question_id: number;
  user_id: number;
  content: string;
  likes: number;
  answered_at: string;
  comments: AnswerCommentResponse[];
  is_liked?: boolean;
}

export interface AnswerCommentResponse {
  id: number;
  answer_id: number;
  user_id: number;
  content: string;
  commented_at: string;
}

export interface UserCommentResponse {
  id: number;
  user_id: string;
  content: string;
  commented_at: string;
}

// 연관질문 타입
export interface RelatedQuestion {
  question_id: number;
  content: string;
  category: string;
  company: string;
  similarity: number;
}

export interface RelatedQuestionsResponse {
  question_id: number;
  related_questions: RelatedQuestion[];
}

// Request types
export interface CreateQuestionRequest {
  content: string;
  category: string;
  company: string;
  question_at: number;
}

export interface CreateAnswerRequest {
  question_id: number;
  content: string;
}

export interface CreateCommentRequest {
  answer_id: number;
  content: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Legacy compatibility types
export interface Question extends FilteredQuestionResponse {}
export interface Answer extends AnswerWithDetailsResponse {}

// =============================================================================
// AI Interview API Types
// =============================================================================

export interface AIQuestionRequest {
  category: string;
  company: string;
  detail: string;
}

export interface QuestionIdResponse {
  question_id: number;
}

// =============================================================================
// MyPage Answer Types
// =============================================================================

export interface MyAnswerCommentResponse {
  user_id: number;
  content: string;
  commented_at: string;
}

export interface MyAnswerResponse {
  answer_id: number; // Assuming this is returned for update/delete operations
  user_id: number;
  likes: number;
  liked: boolean;
  content: string;
  answered_at: string;
  ai_comment: string;
  score: number;
  user_comments: MyAnswerCommentResponse[];
}

// =============================================================================
// MyPage Question Types
// =============================================================================

export interface UpdateQuestionRequest {
  content: string;
  category: string;
  company: string;
  question_at: number;
}
