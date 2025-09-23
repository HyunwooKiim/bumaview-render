import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface InterviewQuestion {
  question_id: number;
  content: string;
}

const InterviewPage: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const navigate = useNavigate();

  const mockQuestions: InterviewQuestion[] = [
    {
      question_id: 1,
      content: '제가 당신을 채용한다는 근거가 있으신가요? 어떤근거로 그런말을 하신거죠?????!?!?!?!?!?'
    },
    {
      question_id: 2,
      content: '자신의 장점과 단점에 대해 말씀해주세요.'
    },
    {
      question_id: 3,
      content: '우리 회사에 지원한 이유는 무엇인가요?'
    },
    {
      question_id: 4,
      content: '5년 후 자신의 모습을 어떻게 그리고 계신가요?'
    },
    {
      question_id: 5,
      content: '팀워크에서 가장 중요하다고 생각하는 것은 무엇인가요?'
    }
  ];

  const handleStartInterview = () => {
    setIsStarted(true);
    setAnswers(new Array(mockQuestions.length).fill(''));
  };

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer(answers[currentQuestion + 1]);
    } else {
      finishInterview();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setCurrentAnswer(answers[currentQuestion - 1]);
    }
  };

  const finishInterview = () => {
    // Calculate mock score
    const completedAnswers = answers.filter(answer => answer.trim().length > 0).length;
    const calculatedScore = Math.round((completedAnswers / mockQuestions.length) * 100);
    setScore(calculatedScore);
    setIsFinished(true);
  };

  const handleExit = () => {
    navigate('/');
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-gray-900">아직 오늘의 모의면접을 하지 않았다면?</h1>
          <button
            onClick={handleStartInterview}
            className="btn-primary text-lg px-8 py-4"
          >
            모의면접 진행하기
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">수고하셨습니다!</h1>
          
          <div className="mb-8">
            <div className="text-left mb-6">
              <p className="text-lg text-gray-700 mb-2">당신의 점수는</p>
              <p className="text-4xl font-bold text-blue-600 mb-2">{score}점</p>
              <p className="text-lg text-gray-700">입니다.</p>
            </div>
            
            <div className="text-left space-y-4">
              <p className="text-gray-700">장점 : 자신의 장점을 잘 어필하였다</p>
              <p className="text-gray-700">단점 : 답변이 짧았다</p>
            </div>
          </div>
          
          <button
            onClick={handleExit}
            className="btn-primary"
          >
            종료하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-lg text-gray-600">
              질문 돌아보기 : {currentQuestion + 1}/{mockQuestions.length}
            </span>
          </div>
          <button
            onClick={handleExit}
            className="btn-secondary"
          >
            종료하기
          </button>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            
            <h2 className="text-xl font-bold text-gray-900">
              Q{currentQuestion + 1}.
            </h2>
            
            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              ›
            </button>
          </div>

          {/* Question */}
          <div className="mb-8">
            <p className="text-lg text-gray-900 leading-relaxed text-center">
              {mockQuestions[currentQuestion].content}
            </p>
          </div>

          {/* Answer Input */}
          <div className="border border-gray-300 rounded-lg p-4">
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="대답을 입력해주세요"
              className="w-full h-32 resize-none outline-none"
            />
            <div className="flex justify-end mt-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex items-center justify-center space-x-4">
          {mockQuestions.map((_, index) => (
            <div
              key={index}
              className={`w-5 h-5 rounded-full ${
                index === currentQuestion
                  ? 'bg-blue-600'
                  : answers[index]?.trim()
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <button
            onClick={handleNext}
            className="btn-primary"
          >
            {currentQuestion === mockQuestions.length - 1 ? '완료' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;