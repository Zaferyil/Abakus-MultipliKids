const { useState, useEffect } = React;

// Basit ikon component'leri (lucide-react yerine)
const Check = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const X = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const Star = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const ArrowLeft = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const ArrowRight = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const Volume2 = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
);

const AbakusMathApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentStage, setCurrentStage] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [stageStars, setStageStars] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Ses efektleri çalma
  const playSound = (type) => {
    if (!soundEnabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'correct') {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'wrong') {
      oscillator.frequency.value = 200;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'click') {
      oscillator.frequency.value = 600;
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'complete') {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
        osc.start(audioContext.currentTime + i * 0.15);
        osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
      });
    }
  };

  // Soru üretme fonksiyonu
  const generateQuestions = (stage, level) => {
    const qs = [];

    if (level === 1) {
      const multiplier = stage <= 6 ? stage + 1 : stage - 1;

      for (let i = 0; i < 10; i++) {
        const num = Math.floor(Math.random() * 10) + 1;
        const correctAnswer = multiplier * num;
        const wrongAnswers = [];

        while (wrongAnswers.length < 3) {
          const wrong = correctAnswer + Math.floor(Math.random() * 20) - 10;
          if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
          }
        }

        const answers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

        qs.push({
          num1: num,
          num2: multiplier,
          correctAnswer,
          answers
        });
      }
    } else if (level === 2) {
      for (let i = 0; i < 10; i++) {
        let num1, num2;

        if (stage <= 6) {
          const tens = Math.floor(Math.random() * 5) + 1;
          const ones = Math.floor(Math.random() * 5) + 1;
          num1 = tens * 10 + ones;
          num2 = Math.floor(Math.random() * 4) + 2;
        } else {
          const tens = Math.floor(Math.random() * 4) + 6;
          const ones = Math.floor(Math.random() * 4) + 6;
          num1 = tens * 10 + ones;
          num2 = Math.floor(Math.random() * 4) + 6;
        }

        const correctAnswer = num1 * num2;
        const wrongAnswers = [];

        while (wrongAnswers.length < 3) {
          const wrong = correctAnswer + Math.floor(Math.random() * 40) - 20;
          if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
          }
        }

        const answers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

        qs.push({
          num1,
          num2,
          correctAnswer,
          answers
        });
      }
    } else if (level === 3) {
      for (let i = 0; i < 10; i++) {
        let num1, num2;

        if (stage <= 6) {
          const hundreds = Math.floor(Math.random() * 5) + 1;
          const tens = Math.floor(Math.random() * 5) + 1;
          const ones = Math.floor(Math.random() * 5) + 1;
          num1 = hundreds * 100 + tens * 10 + ones;
          num2 = Math.floor(Math.random() * 4) + 2;
        } else {
          const hundreds = Math.floor(Math.random() * 4) + 6;
          const tens = Math.floor(Math.random() * 4) + 6;
          const ones = Math.floor(Math.random() * 4) + 6;
          num1 = hundreds * 100 + tens * 10 + ones;
          num2 = Math.floor(Math.random() * 4) + 6;
        }

        const correctAnswer = num1 * num2;
        const wrongAnswers = [];

        while (wrongAnswers.length < 3) {
          const wrong = correctAnswer + Math.floor(Math.random() * 100) - 50;
          if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
          }
        }

        const answers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

        qs.push({
          num1,
          num2,
          correctAnswer,
          answers
        });
      }
    } else if (level === 4) {
      for (let i = 0; i < 10; i++) {
        let num1, num2;

        if (stage <= 6) {
          const tens1 = Math.floor(Math.random() * 5) + 1;
          const ones1 = Math.floor(Math.random() * 5) + 1;
          num1 = tens1 * 10 + ones1;

          const tens2 = Math.floor(Math.random() * 5) + 1;
          const ones2 = Math.floor(Math.random() * 5) + 1;
          num2 = tens2 * 10 + ones2;
        } else {
          const tens1 = Math.floor(Math.random() * 4) + 6;
          const ones1 = Math.floor(Math.random() * 4) + 6;
          num1 = tens1 * 10 + ones1;

          const tens2 = Math.floor(Math.random() * 4) + 6;
          const ones2 = Math.floor(Math.random() * 4) + 6;
          num2 = tens2 * 10 + ones2;
        }

        const correctAnswer = num1 * num2;
        const wrongAnswers = [];

        while (wrongAnswers.length < 3) {
          const wrong = correctAnswer + Math.floor(Math.random() * 200) - 100;
          if (wrong > 0 && wrong !== correctAnswer && !wrongAnswers.includes(wrong)) {
            wrongAnswers.push(wrong);
          }
        }

        const answers = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

        qs.push({
          num1,
          num2,
          correctAnswer,
          answers
        });
      }
    }

    return qs;
  };

  // Stage başlatma
  const startStage = (stage) => {
    setCurrentStage(stage);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setQuestions(generateQuestions(stage, currentLevel));
    setCurrentScreen('quiz');
  };

  // Cevap seçme
  const handleAnswer = (answer) => {
    if (showFeedback) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);

    const isCorrect = answer === questions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore(score + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }

    setTimeout(() => {
      if (currentQuestion < 9) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        completeStage();
      }
    }, 1500);
  };

  // Stage tamamlama
  const completeStage = () => {
    const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;
    setStageStars({
      ...stageStars,
      [`${currentLevel}-${currentStage}`]: stars
    });
    setShowConfetti(true);
    playSound('complete');
    setTimeout(() => setShowConfetti(false), 3000);
    setCurrentScreen('result');
  };

  // Ana Ekran
  if (currentScreen === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden">
        {/* Animated Grid Background */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}></div>

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-yellow-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-[500px] md:h-[500px] bg-cyan-300/40 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 md:w-80 md:h-80 bg-pink-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Floating Math Symbols */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white/30 font-bold animate-[float_10s_ease-in-out_infinite]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 40 + 20}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 10 + 10}s`
              }}
            >
              {['×', '·', '✕'][Math.floor(Math.random() * 3)]}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            setSoundEnabled(!soundEnabled);
            playSound('click');
          }}
          className={`absolute top-4 left-4 md:top-8 md:left-8 ${soundEnabled ? 'bg-white/30' : 'bg-white/10'} backdrop-blur-md border-2 ${soundEnabled ? 'border-white' : 'border-white/30'} rounded-full p-3 md:p-5 shadow-2xl hover:scale-110 transition-all z-20`}
        >
          <Volume2 size={24} className={`md:w-8 md:h-8 ${soundEnabled ? 'text-white' : 'text-white/50'}`} />
        </button>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-8">
          {/* Futuristic Math Icon */}
          <div className="mb-8 md:mb-12 relative animate-[fadeIn_1s_ease-in]">
            <div className="relative w-32 h-32 md:w-48 md:h-48">
              {/* Rotating Rings */}
              <div className="absolute inset-0 border-4 border-yellow-300 rounded-full animate-[spin_8s_linear_infinite]"></div>
              <div className="absolute inset-2 border-4 border-cyan-300 rounded-full animate-[spin_6s_linear_infinite_reverse]"></div>
              <div className="absolute inset-4 border-4 border-pink-300 rounded-full animate-[spin_10s_linear_infinite]"></div>

              {/* Center Symbol */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl animate-pulse">
                  <span className="text-5xl md:text-7xl font-black text-white">×</span>
                </div>
              </div>
            </div>
          </div>

          {/* Title with Neon Effect */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-5xl md:text-8xl font-black mb-2 md:mb-4 tracking-wider animate-[slideDown_0.8s_ease-out]" style={{
              background: 'linear-gradient(90deg, #fef08a, #fbbf24, #fef08a)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradient 3s linear infinite, slideDown 0.8s ease-out',
              textShadow: '0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.5)'
            }}>
              ABAKUS
            </h1>

            <div className="relative inline-block">
              <h2 className="text-3xl md:text-6xl font-black text-white animate-[slideUp_0.8s_ease-out]" style={{
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}>
                MULTIPLI KIDS
              </h2>
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 opacity-40 blur-xl"></div>
            </div>

            <p className="text-sm md:text-xl text-white mt-4 md:mt-6 font-semibold tracking-wide animate-[fadeIn_1.2s_ease-in] drop-shadow-lg">
              Çarpma işlemini öğrenmenin geleceği
            </p>
          </div>

          {/* Futuristic Start Button */}
          <button
            onClick={() => {
              playSound('click');
              setCurrentScreen('levels');
            }}
            className="group relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 animate-[gradient_3s_linear_infinite]" style={{
              backgroundSize: '200% auto'
            }}></div>
            <div className="relative bg-white/20 backdrop-blur-sm border-2 border-white/50 text-2xl md:text-4xl font-black px-12 py-5 md:px-20 md:py-8 m-0.5 transition-all duration-300 hover:bg-white/30">
              <span className="relative z-10 text-white drop-shadow-lg">
                BAŞLA
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            </div>
          </button>

          {/* Animated Corner Elements */}
          <div className="absolute top-8 left-8 md:top-16 md:left-16 w-16 h-16 md:w-24 md:h-24 border-t-4 border-l-4 border-yellow-300 animate-pulse"></div>
          <div className="absolute bottom-8 right-8 md:bottom-16 md:right-16 w-16 h-16 md:w-24 md:h-24 border-b-4 border-r-4 border-cyan-300 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      </div>
    );
  }

  // Level Seçim Ekranı
  if (currentScreen === 'levels') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 to-green-200 relative overflow-hidden p-4 md:p-8">
        <button
          onClick={() => {
            playSound('click');
            setCurrentScreen('home');
          }}
          className="absolute top-4 left-4 md:top-6 md:left-6 bg-red-400 rounded-full p-3 md:p-4 shadow-lg hover:scale-110 transition-transform z-20"
        >
          <X size={24} className="text-white md:w-8 md:h-8" />
        </button>

        <div className="portrait:block landscape:hidden">
          <div className="absolute bottom-0 left-0 w-full h-32 md:h-64 bg-green-400 rounded-t-full"></div>
          <div className="absolute bottom-0 left-1/4 w-48 h-24 md:w-96 md:h-48 bg-green-500 rounded-t-full"></div>
          <div className="absolute bottom-0 right-1/4 w-40 h-28 md:w-80 md:h-56 bg-green-600 rounded-t-full"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center mb-6 md:mb-8 pt-2">
          <div className={`bg-gradient-to-r ${currentLevel === 1 ? 'from-blue-400 to-blue-600' : currentLevel === 2 ? 'from-purple-400 to-purple-600' : currentLevel === 3 ? 'from-orange-400 to-orange-600' : 'from-green-400 to-green-600'} px-8 py-3 md:px-20 md:py-6 rounded-2xl md:rounded-3xl shadow-2xl`}>
            <h2 className="text-3xl md:text-6xl font-bold text-white">LEVEL {currentLevel}</h2>
          </div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-2 landscape:max-h-[60vh] landscape:overflow-y-auto">
          <div className="grid grid-cols-3 portrait:sm:grid-cols-4 landscape:grid-cols-6 md:grid-cols-6 gap-2 md:gap-4 mb-2 md:mb-4">
            {[1, 2, 3, 4, 5, 6].map((stage) => {
              const stars = stageStars[`${currentLevel}-${stage}`] || 0;
              return (
                <button
                  key={stage}
                  onClick={() => {
                    playSound('click');
                    startStage(stage);
                  }}
                  className={`bg-gradient-to-b ${currentLevel === 1 ? 'from-cyan-300 to-cyan-500' : currentLevel === 2 ? 'from-pink-300 to-pink-500' : currentLevel === 3 ? 'from-amber-300 to-amber-500' : 'from-emerald-300 to-emerald-500'} rounded-xl md:rounded-2xl p-3 landscape:p-2 md:p-6 shadow-lg hover:scale-105 hover:rotate-2 transition-all duration-300`}
                >
                  <div className="text-white text-sm landscape:text-xs md:text-2xl font-bold mb-1 md:mb-2">Stage {stage}</div>
                  <div className="flex justify-center gap-0.5 md:gap-1">
                    {[1, 2, 3].map((i) => (
                      <Star
                        key={i}
                        size={window.innerWidth < 768 ? 12 : 20}
                        className={i <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-3 portrait:sm:grid-cols-4 landscape:grid-cols-6 md:grid-cols-6 gap-2 md:gap-4">
            {[7, 8, 9, 10, 11, 12].map((stage) => {
              const stars = stageStars[`${currentLevel}-${stage}`] || 0;
              return (
                <button
                  key={stage}
                  onClick={() => {
                    playSound('click');
                    startStage(stage);
                  }}
                  className={`bg-gradient-to-b ${currentLevel === 1 ? 'from-teal-400 to-teal-600' : currentLevel === 2 ? 'from-rose-400 to-rose-600' : currentLevel === 3 ? 'from-yellow-400 to-yellow-600' : 'from-lime-400 to-lime-600'} rounded-xl md:rounded-2xl p-3 landscape:p-2 md:p-6 shadow-lg hover:scale-105 hover:rotate-2 transition-all duration-300`}
                >
                  <div className="text-white text-sm landscape:text-xs md:text-2xl font-bold mb-1 md:mb-2">Stage {stage}</div>
                  <div className="flex justify-center gap-0.5 md:gap-1">
                    {[1, 2, 3].map((i) => (
                      <Star
                        key={i}
                        size={window.innerWidth < 768 ? 12 : 20}
                        className={i <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2 md:gap-4 z-20">
          <button
            onClick={() => {
              playSound('click');
              setCurrentLevel(Math.max(1, currentLevel - 1));
            }}
            className={`rounded-full p-2 md:p-4 shadow-lg transition-transform ${currentLevel === 1 ? 'bg-gray-300 opacity-50' : 'bg-cyan-400 hover:scale-110'}`}
            disabled={currentLevel === 1}
          >
            <ArrowLeft size={24} className="text-white md:w-8 md:h-8" />
          </button>
          <div className="flex gap-1 md:gap-2 items-center">
            <div className={`w-2 h-2 md:w-4 md:h-4 rounded-full ${currentLevel === 1 ? 'bg-cyan-600' : 'bg-gray-400'}`}></div>
            <div className={`w-2 h-2 md:w-4 md:h-4 rounded-full ${currentLevel === 2 ? 'bg-cyan-600' : 'bg-gray-400'}`}></div>
            <div className={`w-2 h-2 md:w-4 md:h-4 rounded-full ${currentLevel === 3 ? 'bg-cyan-600' : 'bg-gray-400'}`}></div>
            <div className={`w-2 h-2 md:w-4 md:h-4 rounded-full ${currentLevel === 4 ? 'bg-cyan-600' : 'bg-gray-400'}`}></div>
          </div>
          <button
            onClick={() => {
              playSound('click');
              setCurrentLevel(Math.min(4, currentLevel + 1));
            }}
            className={`rounded-full p-2 md:p-4 shadow-lg transition-transform ${currentLevel === 4 ? 'bg-gray-300 opacity-50' : 'bg-cyan-400 hover:scale-110'}`}
            disabled={currentLevel === 4}
          >
            <ArrowRight size={24} className="text-white md:w-8 md:h-8" />
          </button>
        </div>
      </div>
    );
  }

  // Quiz Ekranı
  if (currentScreen === 'quiz' && questions.length > 0) {
    const q = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-300 to-pink-200 p-4 md:p-8 relative flex flex-col">
        {showFeedback && selectedAnswer === q.correctAnswer && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-[fall_2s_linear]"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              >
                <div
                  className={`w-2 h-2 md:w-3 md:h-3 ${['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400'][Math.floor(Math.random() * 4)]}`}
                  style={{
                    transform: `rotate(${Math.random() * 360}deg)`,
                  }}
                ></div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            playSound('click');
            setCurrentScreen('levels');
          }}
          className="absolute top-4 left-4 md:top-8 md:left-8 bg-white rounded-full p-2 md:p-4 shadow-lg hover:scale-110 transition-transform z-20"
        >
          <ArrowLeft size={20} className="text-purple-600 md:w-8 md:h-8" />
        </button>

        <div className="w-full max-w-3xl mx-auto mb-6 md:mb-8 pt-14 md:pt-2">
          <div className="bg-white rounded-full h-3 md:h-8 overflow-hidden shadow-lg">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
            ></div>
          </div>
          <div className="text-center mt-2 text-sm md:text-2xl font-bold text-white">
            Soru {currentQuestion + 1} / 10
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center w-full px-2 pb-20 md:pb-8">
          <div className="w-full max-w-xl md:max-w-2xl">
            <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl mb-6 md:mb-8 animate-[slideIn_0.5s_ease-out]">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-center text-gray-800 animate-[scaleIn_0.6s_ease-out] break-words">
                {q.num1} · {q.num2} = ?
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-5">
              {q.answers.map((answer, idx) => {
                const isCorrect = answer === q.correctAnswer;
                const isSelected = answer === selectedAnswer;

                let bgColor = 'from-blue-400 to-blue-600';
                if (showFeedback && isSelected) {
                  bgColor = isCorrect ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(answer)}
                    disabled={showFeedback}
                    className={`bg-gradient-to-b ${bgColor} text-white text-3xl sm:text-4xl md:text-5xl font-bold py-6 md:py-10 rounded-2xl md:rounded-3xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 disabled:cursor-not-allowed relative ${isSelected && showFeedback ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
                  >
                    {answer}
                    {showFeedback && isSelected && (
                      <div className="absolute top-2 right-2 md:top-3 md:right-3">
                        {isCorrect ? (
                          <Check size={28} className="text-white md:w-10 md:h-10" />
                        ) : (
                          <X size={28} className="text-white md:w-10 md:h-10" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-0 right-0 text-center md:relative md:bottom-auto">
          <div className="inline-block bg-yellow-400 rounded-full px-4 py-2 md:px-8 md:py-4 shadow-lg">
            <span className="text-base md:text-2xl lg:text-3xl font-bold text-gray-800">
              ⭐ Doğru Cevaplar: {score}/{currentQuestion + (showFeedback ? 1 : 0)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Sonuç Ekranı
  if (currentScreen === 'result') {
    const stars = score >= 9 ? 3 : score >= 7 ? 2 : score >= 5 ? 1 : 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-300 to-orange-300 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-[fall_3s_linear]"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10%',
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                <div
                  className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][Math.floor(Math.random() * 5)]}`}
                ></div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-16 shadow-2xl max-w-2xl w-full text-center animate-[scaleIn_0.8s_ease-out] relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 md:mb-8 animate-[slideDown_0.5s_ease-out]">Harika!</h2>

          <div className="text-3xl md:text-5xl font-bold text-gray-700 mb-6 md:mb-8 animate-[fadeIn_1s_ease-in]">
            {score} / 10 Doğru
          </div>

          <div className="flex justify-center gap-2 md:gap-4 mb-8 md:mb-12">
            {[1, 2, 3].map((i) => (
              <Star
                key={i}
                size={window.innerWidth < 768 ? 48 : 64}
                className={`${i <= stars ? 'fill-yellow-400 text-yellow-400 animate-[spin_1s_ease-in-out]' : 'text-gray-300'}`}
                style={{animationDelay: `${i * 0.2}s`}}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <button
              onClick={() => {
                playSound('click');
                setCurrentScreen('levels');
              }}
              className="bg-gradient-to-b from-blue-400 to-blue-600 text-white text-xl md:text-3xl font-bold px-8 py-4 md:px-12 md:py-6 rounded-xl md:rounded-2xl shadow-lg hover:scale-105 transition-transform"
            >
              Levellere Dön
            </button>

            {currentStage < 12 && (
              <button
                onClick={() => {
                  playSound('click');
                  startStage(currentStage + 1);
                }}
                className="bg-gradient-to-b from-green-400 to-green-600 text-white text-xl md:text-3xl font-bold px-8 py-4 md:px-12 md:py-6 rounded-xl md:rounded-2xl shadow-lg hover:scale-105 transition-transform"
              >
                Sonraki Stage
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// React DOM render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<AbakusMathApp />);
