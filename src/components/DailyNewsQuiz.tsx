import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Flame, 
  Zap, 
  RotateCcw, 
  User, 
  Medal, 
  ArrowRight, 
  BookOpen,
  Crown,
  Share2,
  ChevronRight
} from 'lucide-react';
import { NewsArticle, QuizQuestion, QuizLeaderboardEntry } from '../types';
import { 
  generateDailyQuiz, 
  getLeaderboardFromStorage, 
  getUserQuizStats, 
  saveQuizResultToLeaderboard,
  UserQuizStats 
} from '../utils/quizEngine';

interface DailyNewsQuizProps {
  articles: NewsArticle[];
  onSelectArticle?: (article: NewsArticle) => void;
}

export const DailyNewsQuiz: React.FC<DailyNewsQuizProps> = ({ articles, onSelectArticle }) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'leaderboard'>('quiz');
  const [quizState, setQuizState] = useState<'intro' | 'playing' | 'completed'>('intro');
  
  // Quiz data states
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);

  // User & Leaderboard states
  const [userStats, setUserStats] = useState<UserQuizStats>(getUserQuizStats());
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>(getLeaderboardFromStorage());
  const [inputName, setInputName] = useState(userStats.userName);
  const [isNameSaved, setIsNameSaved] = useState(false);

  // Load questions when starting quiz
  const handleStartQuiz = () => {
    const generated = generateDailyQuiz(articles);
    setQuestions(generated);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setSessionPoints(0);
    setQuizState('playing');
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    const currentQ = questions[currentQuestionIndex];
    if (selectedOptionIndex === currentQ.correctAnswerIndex) {
      setCorrectAnswersCount((prev) => prev + 1);
      setSessionPoints((prev) => prev + currentQ.points);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz finished
      const totalEarned = sessionPoints;
      const { updatedStats, updatedLeaderboard } = saveQuizResultToLeaderboard(totalEarned, inputName);
      setUserStats(updatedStats);
      setLeaderboard(updatedLeaderboard);
      setQuizState('completed');
    }
  };

  const handleSaveUserName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    const { updatedStats, updatedLeaderboard } = saveQuizResultToLeaderboard(0, inputName);
    setUserStats(updatedStats);
    setLeaderboard(updatedLeaderboard);
    setIsNameSaved(true);
    setTimeout(() => setIsNameSaved(false), 3000);
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <section id="daily-news-quiz" className="mb-10">
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 rounded-3xl border-2 border-yellow-400/80 shadow-2xl overflow-hidden text-white">
        
        {/* Widget Top Header Bar */}
        <div className="bg-sky-900/80 border-b border-sky-700/80 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-sky-950 flex items-center justify-center font-black shadow-md border border-yellow-300">
              <Trophy className="w-5 h-5 text-sky-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-yellow-400 font-mono">
                  Kuis Berita Harian
                </h3>
                <span className="bg-emerald-500 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  Poin & Ranking
                </span>
              </div>
              <p className="text-[11px] text-sky-200 font-medium">
                Uji wawasan Anda berdasarkan warta berita terbaru hari ini dan dapatkan skor tertinggi!
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-sky-950 p-1 rounded-2xl border border-sky-700 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-yellow-400 text-sky-950 shadow-sm font-black'
                  : 'text-sky-200 hover:text-white hover:bg-sky-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Main Kuis</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-yellow-400 text-sky-950 shadow-sm font-black'
                  : 'text-sky-200 hover:text-white hover:bg-sky-800/50'
              }`}
            >
              <Medal className="w-3.5 h-3.5" />
              <span>Papan Peringkat</span>
            </button>
          </div>
        </div>

        {/* Widget Body Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'quiz' ? (
            <div>
              {/* STATE 1: INTRO SCREEN */}
              {quizState === 'intro' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-mono font-bold">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Edisi Warta Hari Ini ({articles.length} Berita Aktif)</span>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      Seberapa Cermat Anda Membaca Berita Hari Ini?
                    </h4>

                    <p className="text-xs sm:text-sm text-sky-100 leading-relaxed font-medium">
                      Jawab 5 pertanyaan kuis singkat yang dirancang otomatis dari artikel berita terkini. Kumpulkan poin kuis, tingkatkan *streak* harian, dan ukir namamu di papan peringkat pembaca Arun News!
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleStartQuiz}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider shadow-lg border-2 border-yellow-500 cursor-pointer active:scale-95 transition-all"
                      >
                        <Zap className="w-4 h-4 fill-sky-950" />
                        <span>Mulai Kuis Sekarang (5 Soal)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('leaderboard')}
                        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-sky-900/80 hover:bg-sky-800 text-yellow-300 font-bold text-xs border border-sky-700 transition-all cursor-pointer"
                      >
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span>Lihat Klasemen Poin</span>
                      </button>
                    </div>
                  </div>

                  {/* User Stats Card Preview */}
                  <div className="lg:col-span-5 bg-sky-900/60 rounded-2xl p-4 sm:p-5 border border-sky-700/80 space-y-3.5">
                    <div className="flex items-center justify-between border-b border-sky-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-purple-200">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-sky-300 font-mono font-bold uppercase tracking-wider block">
                            Profil Pembaca
                          </span>
                          <span className="text-xs font-black text-white">{userStats.userName}</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-yellow-400 text-sky-950 px-2 py-0.5 rounded-full font-mono font-black border border-yellow-500">
                        {userStats.totalPoints >= 1000 ? '🥇 Jurnalis Cerdas' : 'Pembaca Aktif'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-center">
                      <div className="bg-sky-950/80 p-3 rounded-xl border border-sky-800">
                        <span className="text-[10px] text-sky-300 font-mono font-bold block mb-0.5">
                          Total Poin
                        </span>
                        <span className="text-lg font-black text-yellow-400 font-mono">
                          {userStats.totalPoints}
                        </span>
                      </div>

                      <div className="bg-sky-950/80 p-3 rounded-xl border border-sky-800">
                        <span className="text-[10px] text-sky-300 font-mono font-bold block mb-0.5">
                          Streak Hari
                        </span>
                        <span className="text-lg font-black text-emerald-400 font-mono flex items-center justify-center gap-1">
                          <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span>{userStats.currentStreak} Hari</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-sky-950/60 p-2.5 rounded-xl border border-sky-800/80 text-[11px] text-sky-200 flex items-center justify-between">
                      <span>Kuis Diselesaikan:</span>
                      <span className="font-bold text-white font-mono">{userStats.quizzesCompleted} Kali</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 2: PLAYING QUIZ */}
              {quizState === 'playing' && currentQ && (
                <div className="space-y-5 max-w-3xl mx-auto">
                  {/* Progress Header */}
                  <div className="flex items-center justify-between gap-2 text-xs font-mono">
                    <span className="text-yellow-400 font-black flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      Soal {currentQuestionIndex + 1} dari {questions.length}
                    </span>
                    <span className="bg-sky-900 px-3 py-1 rounded-full text-sky-200 border border-sky-700 font-bold">
                      Skor Sesi Ini: <strong className="text-yellow-300">{sessionPoints} Poin</strong>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-sky-950 h-2 rounded-full overflow-hidden border border-sky-800">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    />
                  </div>

                  {/* Question Card */}
                  <div className="bg-sky-900/80 p-5 sm:p-6 rounded-2xl border-2 border-sky-700/80 shadow-md space-y-4">
                    {currentQ.articleTitle && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-950 text-sky-200 text-[11px] font-mono border border-sky-800">
                        <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="truncate max-w-md">Ref: {currentQ.articleTitle}</span>
                      </div>
                    )}

                    <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                      {currentQ.question}
                    </h4>

                    {/* Options */}
                    <div className="space-y-2.5 pt-2">
                      {currentQ.options.map((opt, idx) => {
                        let btnStyle = 'bg-sky-950/80 text-sky-100 hover:bg-sky-800 border-sky-700/80';
                        
                        if (selectedOptionIndex === idx) {
                          btnStyle = 'bg-yellow-400 text-sky-950 font-black border-yellow-500 shadow-md';
                        }

                        if (isAnswerSubmitted) {
                          if (idx === currentQ.correctAnswerIndex) {
                            btnStyle = 'bg-emerald-600 text-white font-black border-emerald-400 shadow-lg';
                          } else if (selectedOptionIndex === idx) {
                            btnStyle = 'bg-rose-600 text-white font-black border-rose-400 shadow-lg';
                          } else {
                            btnStyle = 'bg-sky-950/40 text-sky-400 border-sky-900 opacity-60';
                          }
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isAnswerSubmitted}
                            onClick={() => handleSelectOption(idx)}
                            className={`w-full p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                          >
                            <span className="w-6 h-6 rounded-lg bg-sky-900/60 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-sky-700">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="pt-0.5 leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Box when submitted */}
                    {isAnswerSubmitted && (
                      <div className="p-4 rounded-xl bg-sky-950 border border-sky-700 space-y-1.5 animate-in fade-in duration-200">
                        <div className="flex items-center gap-2 text-xs font-bold font-mono">
                          {selectedOptionIndex === currentQ.correctAnswerIndex ? (
                            <span className="text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> Jawaban Tepat! (+{currentQ.points} Poin)
                            </span>
                          ) : (
                            <span className="text-rose-400 flex items-center gap-1">
                              <XCircle className="w-4 h-4" /> Belum Tepat
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-sky-200 font-medium leading-relaxed">
                          {currentQ.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Question Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setQuizState('intro')}
                      className="text-xs text-sky-300 hover:underline font-bold"
                    >
                      Batal Kuis
                    </button>

                    {!isAnswerSubmitted ? (
                      <button
                        type="button"
                        disabled={selectedOptionIndex === null}
                        onClick={handleSubmitAnswer}
                        className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider shadow-md disabled:opacity-50 cursor-pointer border border-yellow-500"
                      >
                        Kirim Jawaban
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-sky-950 font-black text-xs uppercase tracking-wider shadow-md cursor-pointer border border-emerald-400"
                      >
                        <span>{currentQuestionIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Selesaikan Kuis'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STATE 3: COMPLETED SCREEN */}
              {quizState === 'completed' && (
                <div className="max-w-2xl mx-auto text-center space-y-5 py-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-3xl bg-yellow-400 text-sky-950 flex items-center justify-center mx-auto shadow-xl border-2 border-yellow-500">
                    <Trophy className="w-8 h-8 text-sky-950" />
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-yellow-300 font-black">
                      Selamat! Kuis Berita Selesai
                    </span>
                    <h4 className="text-2xl sm:text-3xl font-black text-white mt-1">
                      {correctAnswersCount === questions.length ? '🎉 Skor Sempurna!' : correctAnswersCount >= 3 ? '👏 Hasil Sangat Baik!' : '👍 Cukup Bagus!'}
                    </h4>
                    <p className="text-xs text-sky-200 mt-1 font-medium">
                      Anda berhasil menjawab benar <strong>{correctAnswersCount} dari {questions.length}</strong> pertanyaan berita harian.
                    </p>
                  </div>

                  {/* Score Breakdown Box */}
                  <div className="bg-sky-900/80 p-5 rounded-2xl border border-sky-700/80 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <span className="text-[10px] text-sky-300 font-mono font-bold uppercase tracking-wider block mb-1">
                        Poin Sesi Ini
                      </span>
                      <span className="text-2xl font-black text-yellow-400 font-mono">
                        +{sessionPoints}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-sky-300 font-mono font-bold uppercase tracking-wider block mb-1">
                        Total Poin Pengguna
                      </span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {userStats.totalPoints}
                      </span>
                    </div>
                  </div>

                  {/* Submit Name to Leaderboard Form */}
                  <form onSubmit={handleSaveUserName} className="bg-sky-950/80 p-4 rounded-2xl border border-sky-800 space-y-2 text-left">
                    <label className="block text-[11px] font-mono font-bold text-sky-200 uppercase tracking-wider">
                      Ubah Nama Tampilan di Papan Peringkat:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        placeholder="Masukkan nama Anda..."
                        className="flex-1 px-3.5 py-2 text-xs bg-sky-900 text-white rounded-xl border border-sky-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 font-bold"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider cursor-pointer border border-yellow-500"
                      >
                        Simpan Nama
                      </button>
                    </div>
                    {isNameSaved && (
                      <p className="text-[11px] text-emerald-400 font-bold font-mono">
                        ✓ Nama berhasil diperbarui di Papan Peringkat!
                      </p>
                    )}
                  </form>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleStartQuiz}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider shadow-md border border-yellow-500 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Main Kuis Lagi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('leaderboard')}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-800 hover:bg-sky-700 text-white font-bold text-xs border border-sky-600 transition-colors cursor-pointer"
                    >
                      <Medal className="w-4 h-4 text-yellow-400" />
                      <span>Lihat Papan Peringkat</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: LEADERBOARD TAB */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-sky-800 pb-3">
                <div>
                  <h4 className="text-sm font-black uppercase text-yellow-400 font-mono flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    Papan Peringkat Pembaca Cerdas Arun News
                  </h4>
                  <p className="text-[11px] text-sky-200 font-medium">
                    Peringkat teratas pembaca dengan skor kuis harian tertinggi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider cursor-pointer border border-yellow-500"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Main Kuis</span>
                </button>
              </div>

              {/* Leaderboard Table */}
              <div className="space-y-2 overflow-x-auto">
                {leaderboard.map((entry, idx) => {
                  const isCurrentUser = entry.userName.toLowerCase() === userStats.userName.toLowerCase();

                  let rankBg = 'bg-sky-900/60 border-sky-800 text-white';
                  let rankBadge = <span className="font-mono text-sky-300 font-bold text-xs">#{idx + 1}</span>;

                  if (idx === 0) {
                    rankBg = 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-sky-900 border-yellow-400/80 text-white';
                    rankBadge = <span className="text-base">🥇</span>;
                  } else if (idx === 1) {
                    rankBg = 'bg-gradient-to-r from-slate-400/20 to-sky-900 border-slate-300/80 text-white';
                    rankBadge = <span className="text-base">🥈</span>;
                  } else if (idx === 2) {
                    rankBg = 'bg-gradient-to-r from-amber-700/20 to-sky-900 border-amber-600/80 text-white';
                    rankBadge = <span className="text-base">🥉</span>;
                  }

                  if (isCurrentUser) {
                    rankBg += ' ring-2 ring-yellow-400';
                  }

                  return (
                    <div
                      key={entry.id || idx}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${rankBg}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-950 flex items-center justify-center flex-shrink-0 font-black">
                          {rankBadge}
                        </div>
                        <img
                          src={entry.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                          alt={entry.userName}
                          className="w-8 h-8 rounded-full object-cover border border-sky-600 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-white">
                              {entry.userName}
                            </span>
                            {isCurrentUser && (
                              <span className="bg-yellow-400 text-sky-950 text-[9px] font-black px-1.5 py-0.2 rounded font-mono">
                                Anda
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-sky-300 font-mono block">
                            {entry.badgeTitle}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-black text-yellow-400 font-mono block">
                          {entry.totalScore} Poin
                        </span>
                        <span className="text-[10px] text-sky-300 font-mono block">
                          {entry.quizzesCompleted} Kuis
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
