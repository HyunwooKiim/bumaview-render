import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI, sttAPI, answersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { QuestionResponse, AIQuestionRequest, AnswerWithDetailsResponse } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const InterviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Page State
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Interview Data
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [finalAnswer, setFinalAnswer] = useState<AnswerWithDetailsResponse | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartInterview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const requestData: AIQuestionRequest = { category: 'IT', company: 'BSSM', detail: 'CS' };
      const idResponse = await questionsAPI.generateAiQuestion(requestData);
      const fetchedQuestion = await questionsAPI.getById(idResponse.question_id);
      setQuestions([fetchedQuestion]);
      setIsStarted(true);
    } catch (err) {
      setError('질문을 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    setRecordedAudio(null);
    setError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const audioFile = new File([audioBlob], "answer.wav", { type: 'audio/wav' });
          setRecordedAudio(audioFile);
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        setError('마이크 접근에 실패했습니다. 권한을 확인해주세요.');
        console.error(err);
      }
    } else {
      setError('음성 녹음이 지원되지 않는 브라우저입니다.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!recordedAudio) {
      setError('제출할 녹음 파일이 없습니다.');
      return;
    }
    if (!user) {
      setError('사용자 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. STT API 호출
      const sttResponse = await sttAPI.transcribe(recordedAudio);
      const transcribedText = sttResponse.transcription;

      if (!transcribedText) {
        throw new Error('음성을 텍스트로 변환하는 데 실패했습니다.');
      }

      // 2. 답변 생성 API 호출
      const currentQuestion = questions[currentQuestionIndex];
      const createAnswerResponse = await answersAPI.create({
        question_id: currentQuestion.id,
        content: transcribedText,
      });

      // 3. 채점 결과 조회 (백엔드 처리 시간 대기)
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3초 대기
      const finalResult = await answersAPI.getById(createAnswerResponse.id);
      
      setFinalAnswer(finalResult);
      setIsFinished(true);

    } catch (err) {
      setError('답변 제출 또는 채점 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Logic ---

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-gray-900">AI 모의면접을 시작할 준비가 되셨나요?</h1>
          {isLoading ? <LoadingSpinner /> : (
            <button onClick={handleStartInterview} className="btn-primary text-lg px-8 py-4" disabled={isLoading}>
              모의면접 진행하기
            </button>
          )}
          {error && <ErrorMessage message={error} />}
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">수고하셨습니다!</h1>
          <div className="mb-8 text-left">
            <p className="text-lg text-gray-700 mb-2">당신의 점수는</p>
            <p className="text-4xl font-bold text-blue-600 mb-4">{finalAnswer?.score ?? '-'}점</p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-2">AI의 종합 평가</h3>
            <p className="text-gray-700 bg-gray-100 p-4 rounded-md">{finalAnswer?.ai_comment ?? '평가 정보가 없습니다.'}</p>
          </div>
          <button onClick={() => navigate('/')} className="btn-primary">종료하기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <span className="text-lg text-gray-600">질문 {currentQuestionIndex + 1}/{questions.length}</span>
          <button onClick={() => navigate('/')} className="btn-secondary">종료하기</button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Q{currentQuestionIndex + 1}.</h2>
          <p className="text-lg text-gray-900 leading-relaxed text-center mb-8">
            {questions[currentQuestionIndex]?.content}
          </p>

          <div className="border-t pt-6 flex flex-col items-center">
            {!isRecording && !recordedAudio && (
              <button onClick={handleStartRecording} className="btn-primary">녹음 시작</button>
            )}
            {isRecording && (
              <button onClick={handleStopRecording} className="btn-danger">녹음 중지</button>
            )}
            {recordedAudio && !isRecording && (
              <div className="w-full text-center">
                <p className="text-green-600 mb-4">녹음이 완료되었습니다. 답변을 제출해주세요.</p>
                <audio src={URL.createObjectURL(recordedAudio)} controls className="w-full mb-4" />
                <button onClick={handleStartRecording} className="btn-secondary mr-2">다시 녹음</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={handleSubmitAnswer}
            className="btn-primary"
            disabled={!recordedAudio || isRecording || isLoading}
          >
            {isLoading ? '제출 중...' : '답변 제출 및 채점'}
          </button>
        </div>
        {error && <div className="mt-4"><ErrorMessage message={error} /></div>}
      </div>
    </div>
  );
};

export default InterviewPage;