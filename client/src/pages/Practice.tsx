import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PracticeQuestion {
  id: string;
  type: string;
  difficulty: string;
  question: string;
  display?: string;
  options: Array<{ text: string; correct: boolean }>;
  explanation: string;
}

export default function Practice() {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizType, setQuizType] = useState<string | null>(null);

  // Load practice data
  useEffect(() => {
    const loadPractice = async () => {
      try {
        const data = await fetch('/data/practice.json').then(r => r.json());
        setQuestions(data);
      } catch (error) {
        console.error('Failed to load practice:', error);
      }
    };

    loadPractice();
  }, []);

  // Filter questions by type
  const filteredQuestions = quizType
    ? questions.filter(q => q.type.includes(quizType))
    : [];

  const currentQuestion = filteredQuestions[currentIndex];
  const progress = quizType ? ((currentIndex + 1) / filteredQuestions.length) * 100 : 0;

  // Handle answer selection
  const handleSelectAnswer = (index: number) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);

    // Check if correct
    if (filteredQuestions[currentIndex].options[index].correct) {
      setScore(score + 1);
    }
  };

  // Handle next question
  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      // Quiz finished
      handleFinish();
    }
  };

  // Handle finish quiz
  const handleFinish = () => {
    setQuizType(null);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  // Start quiz
  const handleStartQuiz = (type: string) => {
    setQuizType(type);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  // Quiz selection screen
  if (!quizType) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-serif">
            {t('practice.title')}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kana Quiz */}
            <Card
              className="p-6 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all border border-gray-200 bg-white"
              onClick={() => handleStartQuiz('kana')}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('practice.kanaQuiz')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                測試你的平假名和片假名知識
              </p>
              <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white">
                開始練習
              </Button>
            </Card>

            {/* Vocabulary Quiz */}
            <Card
              className="p-6 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all border border-gray-200 bg-white"
              onClick={() => handleStartQuiz('vocab')}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('practice.vocabQuiz')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                選擇正確的詞彙意思
              </p>
              <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white">
                開始練習
              </Button>
            </Card>

            {/* Grammar Quiz */}
            <Card
              className="p-6 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all border border-gray-200 bg-white"
              onClick={() => handleStartQuiz('grammar')}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('practice.grammarQuiz')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                填空文法練習題
              </p>
              <Button className="w-full bg-gray-800 hover:bg-gray-900 text-white">
                開始練習
              </Button>
            </Card>
          </div>
        </div>

        {/* Decorative background */}
        <div className="fixed bottom-0 right-10 w-64 h-64 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      </div>
    );
  }

  // Quiz in progress
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Quiz finished
  if (currentIndex >= filteredQuestions.length) {
    const percentage = Math.round((score / filteredQuestions.length) * 100);
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="p-8 text-center border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('practice.result')}
            </h2>
            <div className="text-5xl font-bold text-gray-800 mb-4">
              {percentage}%
            </div>
            <p className="text-lg text-gray-700 mb-6">
              {t('practice.score')}: {score} / {filteredQuestions.length}
            </p>
            <Button
              onClick={handleFinish}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white"
            >
              返回首頁
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz question
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-900">
              {t('practice.question')} {currentIndex + 1} / {filteredQuestions.length}
            </span>
            <span className="text-sm text-gray-600">
              {t('practice.score')}: {score}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestion.question}
          </h2>

          {currentQuestion.display && (
            <div className="text-5xl font-bold text-center text-gray-800 mb-8">
              {currentQuestion.display}
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = option.correct;
              const showResult = answered && isSelected;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(idx)}
                  disabled={answered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                    showResult
                      ? isCorrect
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                      : answered && isCorrect
                      ? 'border-green-500 bg-green-50'
                      : isSelected
                      ? 'border-gray-800 bg-gray-100'
                      : 'border-gray-300 hover:border-gray-500'
                  } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <div className="font-semibold text-gray-900">
                    {option.text}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
              <h4 className="font-semibold text-gray-900 mb-2">
                {t('practice.explanation')}
              </h4>
              <p className="text-sm text-gray-700">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </Card>

        {/* Next Button */}
        {answered && (
          <Button
            onClick={handleNext}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white"
          >
            {currentIndex < filteredQuestions.length - 1
              ? t('practice.next')
              : t('practice.result')}
          </Button>
        )}
      </div>

      {/* Decorative background */}
      <div className="fixed top-40 left-10 w-64 h-64 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
    </div>
  );
}
