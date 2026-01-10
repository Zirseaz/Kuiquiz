'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Star, Clock, CheckCircle, XCircle, Loader2,
    ArrowRight, Home, Sparkles, Zap, Medal, Flame, Target, LogOut
} from 'lucide-react';

interface QuizQuestion {
    question: string;
    options: string[];
    answer: number;
}

interface Quiz {
    questions: QuizQuestion[];
    createdAt: string;
}

type GameState = 'loading' | 'nickname' | 'countdown' | 'playing' | 'result';

interface PageProps {
    params: Promise<{ quizId: string }>;
}

// Confetti component - improved
function Confetti() {
    const colors = ['#a855f7', '#22c55e', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'];
    const shapes = ['circle', 'square', 'triangle'];

    return (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 60 }).map((_, i) => {
                const shape = shapes[Math.floor(Math.random() * shapes.length)];
                return (
                    <motion.div
                        key={i}
                        initial={{
                            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                            y: -20,
                            rotate: 0,
                            scale: Math.random() * 0.5 + 0.5,
                        }}
                        animate={{
                            y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
                            rotate: Math.random() * 720 - 360,
                            x: `+=${Math.random() * 100 - 50}`,
                        }}
                        transition={{
                            duration: Math.random() * 2 + 2,
                            ease: 'linear',
                            delay: Math.random() * 0.5,
                        }}
                        className={`absolute w-3 h-3 ${shape === 'circle' ? 'rounded-full' : shape === 'triangle' ? 'triangle' : 'rounded-sm'}`}
                        style={{
                            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        }}
                    />
                );
            })}
        </div>
    );
}

// Countdown before question - Kahoot style!
function QuestionCountdown({ questionNumber, totalQuestions, onComplete }: {
    questionNumber: number;
    totalQuestions: number;
    onComplete: () => void;
}) {
    const [count, setCount] = useState(3);

    useEffect(() => {
        if (count === 0) {
            onComplete();
            return;
        }
        const timer = setTimeout(() => setCount(count - 1), 700);
        return () => clearTimeout(timer);
    }, [count, onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-purple-900 via-slate-900 to-green-900 flex items-center justify-center z-40"
        >
            <div className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-slate-400 text-xl mb-4"
                >
                    Pregunta {questionNumber} de {totalQuestions}
                </motion.div>

                <motion.div
                    key={count}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="text-9xl font-black text-white"
                >
                    {count === 0 ? '¡YA!' : count}
                </motion.div>

                <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: 2.1, ease: 'linear' }}
                    className="mt-8 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full origin-left"
                    style={{ width: 200 }}
                />
            </div>
        </motion.div>
    );
}

// Nickname Modal - Spanish
function NicknameModal({ onSubmit }: { onSubmit: (nickname: string) => void }) {
    const [nickname, setNickname] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname.trim()) {
            onSubmit(nickname.trim());
        }
    };

    const funNicknames = ['QuizMaster', 'CerebroVeloz', 'GenioPro', 'RayoQuiz'];
    const randomNickname = funNicknames[Math.floor(Math.random() * funNicknames.length)];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="glass rounded-3xl p-8 w-full max-w-md text-center border border-purple-500/20"
            >
                <motion.div
                    initial={{ y: -20, rotate: -10 }}
                    animate={{ y: 0, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                >
                    <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-2">¿Listo para jugar?</h2>
                <p className="text-slate-400 mb-6">Ingresa tu nombre para empezar</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder={randomNickname}
                        maxLength={15}
                        autoFocus
                        className="w-full px-6 py-4 bg-slate-800/70 border border-slate-600 rounded-2xl 
                       text-white text-xl text-center placeholder-slate-500 font-semibold
                       focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50
                       transition-all duration-300"
                    />
                    <motion.button
                        type="submit"
                        disabled={!nickname.trim()}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                                   hover:from-purple-500 hover:to-pink-500 rounded-2xl text-white text-xl font-bold
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25"
                    >
                        ¡Empezar Quiz! <Zap className="w-6 h-6" />
                    </motion.button>
                </form>
            </motion.div>
        </motion.div>
    );
}

// Question Card - Kahoot style with streak
// QuestionCard component with correct props
function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    onAnswer,
    onExit,
    timeRemaining,
    streak,
}: {
    question: QuizQuestion;
    questionNumber: number;
    totalQuestions: number;
    onAnswer: (selectedIndex: number) => void;
    onExit: () => void;
    timeRemaining: number;
    streak: number;
}) {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Kahoot-style option colors
    const optionColors = [
        { bg: 'from-red-500 to-red-600', hover: 'hover:from-red-400 hover:to-red-500', icon: '🔺' },
        { bg: 'from-blue-500 to-blue-600', hover: 'hover:from-blue-400 hover:to-blue-500', icon: '🔷' },
        { bg: 'from-yellow-500 to-yellow-600', hover: 'hover:from-yellow-400 hover:to-yellow-500', icon: '⭐' },
        { bg: 'from-green-500 to-green-600', hover: 'hover:from-green-400 hover:to-green-500', icon: '🟢' },
    ];

    const handleSelectAnswer = (index: number) => {
        if (selectedAnswer !== null) return;

        setSelectedAnswer(index);
        setShowResult(true);

        const isCorrect = index === question.answer;

        if (isCorrect) {
            setShowConfetti(true);
        } else {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 600);
        }

        setTimeout(() => {
            onAnswer(index);
            setSelectedAnswer(null);
            setShowResult(false);
            setShowConfetti(false);
        }, 1500);
    };

    return (
        <>
            {showConfetti && <Confetti />}

            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={`w-full max-w-4xl px-4 ${isShaking ? 'shake' : ''}`}
            >
                {/* Header with timer and streak */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={onExit}
                        className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-white transition-all flex items-center gap-2 pr-4"
                    >
                        <LogOut className="w-4 h-4" /> <span className="text-sm font-bold">Salir</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <span className="text-slate-400">
                            <span className="text-2xl font-bold text-white">{questionNumber}</span>
                            <span className="text-lg">/{totalQuestions}</span>
                        </span>

                        {/* Streak indicator */}
                        {streak > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 border border-orange-500/50 rounded-full"
                            >
                                <Flame className="w-4 h-4 text-orange-400" />
                                <span className="text-orange-400 font-bold">{streak}x</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Timer - Kahoot style */}
                    <motion.div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full ${timeRemaining <= 5
                            ? 'bg-red-500/20 border border-red-500/50'
                            : 'bg-slate-800/50 border border-slate-700/50'
                            }`}
                        animate={timeRemaining <= 5 ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 0.5, repeat: timeRemaining <= 5 ? Infinity : 0 }}
                    >
                        <Clock className={`w-5 h-5 ${timeRemaining <= 5 ? 'text-red-400' : 'text-slate-400'}`} />
                        <span className={`text-2xl font-bold ${timeRemaining <= 5 ? 'text-red-400' : 'text-white'}`}>
                            {timeRemaining}
                        </span>
                    </motion.div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-slate-700/50 rounded-full mb-6 overflow-hidden">
                    <motion.div
                        initial={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }}
                        animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full"
                    />
                </div>

                {/* Question */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-3xl p-6 md:p-8 mb-6 border border-slate-700/50"
                >
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-relaxed text-center">
                        {question.question}
                    </h2>
                </motion.div>

                {/* Options - Kahoot style 2x2 grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {question.options.map((option, index) => {
                        const colors = optionColors[index];
                        const isSelected = selectedAnswer === index;
                        const isCorrect = index === question.answer;
                        const showCorrectness = showResult && (isSelected || isCorrect);

                        return (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + index * 0.08 }}
                                onClick={() => handleSelectAnswer(index)}
                                disabled={selectedAnswer !== null}
                                whileHover={selectedAnswer === null ? { scale: 1.02, y: -2 } : {}}
                                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                                className={`
                                    relative p-5 md:p-6 rounded-2xl text-left transition-all duration-300
                                    ${selectedAnswer === null
                                        ? `bg-gradient-to-br ${colors.bg} ${colors.hover} cursor-pointer shadow-lg`
                                        : 'cursor-default'
                                    }
                                    ${showCorrectness && isCorrect
                                        ? 'bg-gradient-to-br from-green-500 to-green-600 ring-4 ring-green-400 shadow-green-500/50 shadow-xl'
                                        : ''
                                    }
                                    ${showCorrectness && isSelected && !isCorrect
                                        ? 'bg-gradient-to-br from-red-600 to-red-700 ring-4 ring-red-400 shadow-red-500/50 shadow-xl'
                                        : ''
                                    }
                                    ${selectedAnswer !== null && !showCorrectness ? 'opacity-40 scale-95' : ''}
                                `}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">{colors.icon}</span>
                                    <span className="text-base md:text-lg font-semibold text-white leading-snug">
                                        {option}
                                    </span>
                                </div>

                                <AnimatePresence>
                                    {showCorrectness && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2"
                                        >
                                            {isCorrect ? (
                                                <CheckCircle className="w-8 h-8 text-white drop-shadow-lg" />
                                            ) : isSelected ? (
                                                <XCircle className="w-8 h-8 text-white drop-shadow-lg" />
                                            ) : null}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        </>
    );
}

// Leaderboard Entry interface
interface LeaderboardEntry {
    nickname: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timestamp: string;
}

// Leaderboard Component
function Leaderboard({ quizId, currentNickname }: { quizId: string; currentNickname: string }) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const response = await fetch(`/api/leaderboard/${quizId}`);
                if (response.ok) {
                    const data = await response.json();
                    setEntries(data.entries || []);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, [quizId]);

    const getRankIcon = (index: number) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `${index + 1}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
        );
    }

    if (entries.length === 0) {
        return (
            <p className="text-slate-500 text-center py-4">¡Sé el primero en el ranking!</p>
        );
    }

    return (
        <div className="space-y-2">
            {entries.map((entry, index) => (
                <motion.div
                    key={`${entry.nickname}-${entry.timestamp}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${entry.nickname === currentNickname
                        ? 'bg-purple-500/20 border border-purple-500/50'
                        : 'bg-slate-800/50'
                        }`}
                >
                    <span className="text-2xl w-10 text-center">{getRankIcon(index)}</span>
                    <span className={`flex-1 font-medium truncate ${entry.nickname === currentNickname ? 'text-purple-300' : 'text-white'
                        }`}>
                        {entry.nickname}
                        {entry.nickname === currentNickname && (
                            <span className="text-xs ml-2 text-purple-400">(Tú)</span>
                        )}
                    </span>
                    <span className="text-yellow-400 font-bold">{entry.score.toLocaleString()}</span>
                </motion.div>
            ))}
        </div>
    );
}

// Results Screen - Spanish + improved
function ResultsScreen({
    quizId,
    nickname,
    score,
    correctAnswers,
    totalQuestions,
    timeBonus,
    maxStreak,
    onPlayAgain,
    onGoHome,
    responses,
}: {
    quizId: string;
    nickname: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeBonus: number;
    maxStreak: number;
    onPlayAgain: () => void;
    onGoHome: () => void;
    responses: { questionIndex: number; isCorrect: boolean; timeSpent: number }[];
}) {
    const [rank, setRank] = useState<number | null>(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);

    useEffect(() => {
        async function saveScore() {
            try {
                const response = await fetch(`/api/leaderboard/${quizId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nickname,
                        score,
                        correctAnswers,
                        totalQuestions,
                        timeBonus,
                        responses,
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setRank(data.rank);
                }
            } catch (error) {
                console.error('Error saving score:', error);
            }
        }
        saveScore();
    }, [quizId, nickname, score, correctAnswers, totalQuestions, timeBonus]);

    let emoji = '😅';
    let message = '¡Sigue practicando!';
    if (percentage >= 80) {
        emoji = '🏆';
        message = '¡Increíble!';
    } else if (percentage >= 60) {
        emoji = '🌟';
        message = '¡Muy bien!';
    } else if (percentage >= 40) {
        emoji = '👍';
        message = '¡Nada mal!';
    }

    return (
        <>
            <Confetti />
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="w-full max-w-lg text-center px-4"
            >
                <motion.div
                    initial={{ y: -30, rotate: -10 }}
                    animate={{ y: 0, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="text-7xl md:text-8xl mb-4"
                >
                    {emoji}
                </motion.div>

                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl md:text-4xl font-bold text-white mb-2"
                >
                    {message}
                </motion.h2>

                {rank && rank <= 10 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring' }}
                        className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full text-black font-bold mb-3"
                    >
                        🏆 ¡Top {rank} en el ranking!
                    </motion.div>
                )}

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg text-slate-400 mb-6"
                >
                    ¡Bien jugado, <span className="text-purple-400 font-semibold">{nickname}</span>!
                </motion.p>

                {/* Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-3xl p-6 mb-6 border border-slate-700/50"
                >
                    <div className="flex items-center justify-center gap-3 mb-5">
                        <Trophy className="w-8 h-8 text-yellow-400" />
                        <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                            {score.toLocaleString()}
                        </span>
                        <span className="text-xl text-slate-400">pts</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        <div className="text-center p-2 bg-slate-800/50 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-white">{correctAnswers}/{totalQuestions}</div>
                            <div className="text-xs text-slate-400">Correctas</div>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded-xl">
                            <Target className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-white">{percentage}%</div>
                            <div className="text-xs text-slate-400">Precisión</div>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded-xl">
                            <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-white">+{timeBonus}</div>
                            <div className="text-xs text-slate-400">Velocidad</div>
                        </div>
                        <div className="text-center p-2 bg-slate-800/50 rounded-xl">
                            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                            <div className="text-lg font-bold text-white">{maxStreak}x</div>
                            <div className="text-xs text-slate-400">Racha</div>
                        </div>
                    </div>
                </motion.div>

                {/* Leaderboard Toggle */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                    className="w-full py-3 mb-4 glass rounded-xl text-white font-medium border border-slate-700/50
                               flex items-center justify-center gap-2 hover:bg-slate-700/30 transition-all"
                >
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    {showLeaderboard ? 'Ocultar Ranking' : 'Ver Ranking'}
                </motion.button>

                <AnimatePresence>
                    {showLeaderboard && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass rounded-2xl p-4 mb-6 overflow-hidden border border-slate-700/50"
                        >
                            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-400" /> Top 10
                            </h3>
                            <Leaderboard quizId={quizId} currentNickname={nickname} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-3"
                >
                    <motion.button
                        onClick={onPlayAgain}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 
                                   hover:from-green-400 hover:to-emerald-500 rounded-xl text-white text-lg font-bold
                                   flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
                    >
                        <Medal className="w-5 h-5" /> Jugar de Nuevo
                    </motion.button>

                    <motion.button
                        onClick={onGoHome}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                                   hover:from-purple-500 hover:to-pink-500 rounded-xl text-white text-lg font-bold
                                   flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                    >
                        <Home className="w-5 h-5" /> Nuevo Quiz
                    </motion.button>
                </motion.div>
            </motion.div>
        </>
    );
}

// Main Game Page
export default function PlayPage({ params }: PageProps) {
    const { quizId } = use(params);
    const router = useRouter();

    const [gameState, setGameState] = useState<GameState>('loading');
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [nickname, setNickname] = useState('');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [timeBonus, setTimeBonus] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(15);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [responses, setResponses] = useState<{ questionIndex: number; isCorrect: boolean; timeSpent: number }[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Fetch quiz
    useEffect(() => {
        async function fetchQuiz() {
            try {
                const response = await fetch(`/api/quiz/${quizId}`);
                if (!response.ok) {
                    setError('Quiz no encontrado');
                    return;
                }
                const data = await response.json();
                setQuiz(data);
                setGameState('nickname');
            } catch (err) {
                console.error('Error fetching quiz:', err);
                setError('Error al cargar el quiz');
            }
        }
        fetchQuiz();
    }, [quizId]);

    // Timer
    useEffect(() => {
        if (gameState !== 'playing') return;

        const interval = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleAnswer(-1);
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState, currentQuestion]);

    const handleNicknameSubmit = (name: string) => {
        setNickname(name);
        setGameState('countdown');
    };

    const handleCountdownComplete = () => {
        setGameState('playing');
        setTimeRemaining(15);
    };

    const handleAnswer = useCallback((selectedIndex: number) => {
        if (!quiz) return;

        const question = quiz.questions[currentQuestion];
        const isCorrect = selectedIndex === question.answer;

        if (isCorrect) {
            const newStreak = streak + 1;
            setStreak(newStreak);
            if (newStreak > maxStreak) setMaxStreak(newStreak);

            // Base + time bonus + streak bonus
            const basePoints = 100;
            const bonus = Math.round(timeRemaining * 5);
            const streakBonus = newStreak > 1 ? (newStreak - 1) * 20 : 0;
            setScore((prev) => prev + basePoints + bonus + streakBonus);
            setTimeBonus((prev) => prev + bonus);
            setCorrectAnswers((prev) => prev + 1);
        } else {
            setStreak(0);
        }

        // Track detailed response for analytics
        setResponses(prev => [...prev, {
            questionIndex: currentQuestion,
            isCorrect,
            timeSpent: 15 - timeRemaining
        }]);

        if (currentQuestion + 1 >= quiz.questions.length) {
            setGameState('result');
        } else {
            setCurrentQuestion((prev) => prev + 1);
            setGameState('countdown');
        }
    }, [quiz, currentQuestion, timeRemaining, streak, maxStreak]);

    const handlePlayAgain = () => {
        setCurrentQuestion(0);
        setScore(0);
        setCorrectAnswers(0);
        setTimeBonus(0);
        setTimeRemaining(15);
        setStreak(0);
        setMaxStreak(0);
        setGameState('countdown');
    };

    const handleGoHome = () => {
        router.push('/');
    };

    if (gameState === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="mb-4"
                    >
                        <Loader2 className="w-16 h-16 text-purple-400 mx-auto" />
                    </motion.div>
                    <p className="text-slate-400 text-lg">Cargando quiz...</p>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-slate-950">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-8 text-center max-w-md border border-red-500/30"
                >
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">¡Oops!</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <motion.button
                        onClick={handleGoHome}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-bold
                                   flex items-center gap-2 mx-auto"
                    >
                        <ArrowRight className="w-5 h-5" /> Volver al Inicio
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden bg-slate-950">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
            </div>

            <AnimatePresence>
                {gameState === 'nickname' && <NicknameModal onSubmit={handleNicknameSubmit} />}
            </AnimatePresence>

            <AnimatePresence>
                {gameState === 'countdown' && quiz && (
                    <QuestionCountdown
                        questionNumber={currentQuestion + 1}
                        totalQuestions={quiz.questions.length}
                        onComplete={handleCountdownComplete}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {gameState === 'playing' && quiz && (
                    <QuestionCard
                        key={currentQuestion}
                        question={quiz.questions[currentQuestion]}
                        questionNumber={currentQuestion + 1}
                        totalQuestions={quiz.questions.length}
                        onAnswer={handleAnswer}
                        onExit={handleGoHome}
                        timeRemaining={timeRemaining}
                        streak={streak}
                    />
                )}

                {gameState === 'result' && quiz && (
                    <ResultsScreen
                        quizId={quizId}
                        nickname={nickname}
                        score={score}
                        correctAnswers={correctAnswers}
                        totalQuestions={quiz.questions.length}
                        timeBonus={timeBonus}
                        maxStreak={maxStreak}
                        onPlayAgain={handlePlayAgain}
                        onGoHome={handleGoHome}
                        responses={responses}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
