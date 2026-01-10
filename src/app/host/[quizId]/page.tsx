'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Trophy, Share2, Play, Trash2, ArrowLeft,
    Clock, CheckCircle, BarChart2, Zap
} from 'lucide-react';

interface Quiz {
    id: string;
    questions: any[];
    creatorId: string;
    createdAt: string;
}

interface LeaderboardEntry {
    nickname: string;
    score: number;
    correctAnswers: number;
    responses?: { questionIndex: number; isCorrect: boolean; timeSpent: number }[];
}

export default function HostPage({ params }: { params: Promise<{ quizId: string }> }) {
    const { quizId } = use(params);
    const router = useRouter();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch Quiz Details
        fetch(`/api/quiz/${quizId}`)
            .then(res => res.json())
            .then(data => setQuiz(data))
            .catch(err => console.error('Error fetching quiz:', err));

        // 2. Fetch Leaderboard
        fetch(`/api/leaderboard/${quizId}`)
            .then(res => res.json())
            .then(data => setLeaderboard(data.entries || []))
            .catch(err => console.error('Error fetching leaderboard:', err))
            .finally(() => setLoading(false));
    }, [quizId]);

    const copyLink = () => {
        const url = `${window.location.origin}/play/${quizId}`;
        navigator.clipboard.writeText(url);
        alert('¡Enlace de invitación copiado!');
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando panel de host...</div>;
    if (!quiz) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Quiz no encontrado</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Navbar */}
                <button
                    onClick={() => router.push('/dashboard')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" /> Volver al Dashboard
                </button>

                {/* Header */}
                <div className="glass rounded-3xl p-8 mb-8 border border-purple-500/30 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-purple-400 font-bold tracking-wider text-sm mb-2">
                                <Zap className="w-4 h-4" /> HOST MODE
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
                                Quiz #{quiz.id.slice(0, 4)}
                            </h1>
                            <p className="text-slate-400 flex items-center gap-2">
                                Creado el {new Date(quiz.createdAt).toLocaleDateString()} • {quiz.questions.length} preguntas
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => router.push(`/play/${quizId}`)}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold flex items-center gap-2 transition-all"
                            >
                                <Play className="w-5 h-5" /> Probar Quiz
                            </button>
                            <button
                                onClick={copyLink}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all"
                            >
                                <Share2 className="w-5 h-5" /> Copiar Link
                            </button>
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Stats Column */}
                    <div className="space-y-6">
                        <div className="glass p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-purple-400" /> Estadísticas
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                                    <div className="text-3xl font-black text-white">{leaderboard.length}</div>
                                    <div className="text-xs text-slate-500 uppercase font-bold">Jugadores</div>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-xl text-center">
                                    <div className="text-3xl font-black text-white">{quiz.questions.length}</div>
                                    <div className="text-xs text-slate-500 uppercase font-bold">Preguntas</div>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5">
                            <h3 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2">
                                <Trash2 className="w-5 h-5" /> Danger Zone
                            </h3>
                            <p className="text-slate-500 text-sm mb-4">Esta acción no se puede deshacer.</p>
                            <button
                                onClick={() => alert('Feature coming soon!')}
                                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg font-bold transition-all"
                            >
                                Eliminar Quiz
                            </button>
                        </div>
                    </div>

                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 📊 Enterprise Analytics Section */}
                        <div className="glass p-8 rounded-3xl border border-indigo-500/30">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <BarChart2 className="w-6 h-6 text-indigo-400" /> Analytics & Insights
                            </h3>

                            {leaderboard.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Hardest Question */}
                                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                        <div className="text-sm text-slate-400 mb-1">Pregunta más difícil</div>
                                        {(() => {
                                            // Calculate metrics
                                            const questionStats = quiz.questions.map((_, qIdx) => {
                                                const responses = leaderboard.flatMap(e => e.responses || []).filter(r => r.questionIndex === qIdx);
                                                if (responses.length === 0) return { idx: qIdx, correctPct: 0, avgTime: 0 };
                                                const correct = responses.filter(r => r.isCorrect).length;
                                                const totalTime = responses.reduce((acc, r) => acc + (r.timeSpent || 0), 0);
                                                return {
                                                    idx: qIdx,
                                                    correctPct: Math.round((correct / responses.length) * 100),
                                                    avgTime: Math.round((totalTime / responses.length) * 10) / 10
                                                };
                                            });

                                            const hardest = [...questionStats].sort((a, b) => a.correctPct - b.correctPct)[0];
                                            const easiest = [...questionStats].sort((a, b) => b.correctPct - a.correctPct)[0];

                                            return (
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="text-red-400 font-bold text-3xl">{hardest.correctPct}%</div>
                                                        <div className="text-xs text-slate-500">tasa de acierto en Pregunta {hardest.idx + 1}</div>
                                                    </div>

                                                    <div className="h-24 flex items-end gap-1">
                                                        {questionStats.map((stat, i) => (
                                                            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                                                                <div
                                                                    className={`w-full rounded-t-sm transition-all ${stat.correctPct < 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                                    style={{ height: `${Math.max(10, stat.correctPct)}%` }}
                                                                />
                                                                <div className="text-[10px] text-slate-500">{i + 1}</div>
                                                                {/* Tooltip */}
                                                                <div className="absolute bottom-full mb-2 bg-black text-xs p-2 rounded hidden group-hover:block whitespace-nowrap z-10">
                                                                    P{i + 1}: {stat.correctPct}% correctas<br />
                                                                    ⏱️ {stat.avgTime}s promedio
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Participation Stats */}
                                    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col justify-between">
                                        <div>
                                            <div className="text-sm text-slate-400 mb-1">Tiempo Promedio por Pregunta</div>
                                            {(() => {
                                                const totalResponses = leaderboard.flatMap(e => e.responses || []);
                                                const avgTime = totalResponses.length
                                                    ? totalResponses.reduce((acc, r) => acc + (r.timeSpent || 0), 0) / totalResponses.length
                                                    : 0;
                                                return (
                                                    <div className="text-3xl font-bold text-blue-400">{avgTime.toFixed(1)}s</div>
                                                );
                                            })()}
                                        </div>

                                        <div className="mt-4">
                                            <div className="text-sm text-slate-400 mb-2">Top Performers</div>
                                            <div className="flex -space-x-2">
                                                {leaderboard.slice(0, 5).map((entry, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold border-2 border-slate-800"
                                                        title={entry.nickname}
                                                    >
                                                        {entry.nickname[0].toUpperCase()}
                                                    </div>
                                                ))}
                                                {leaderboard.length > 5 && (
                                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold border-2 border-slate-800">
                                                        +{leaderboard.length - 5}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-slate-500">
                                    <p>Necesitas al menos 1 jugador para ver analytics.</p>
                                </div>
                            )}
                        </div>

                        <div className="glass p-8 rounded-3xl border border-slate-700/50 min-h-[500px]">
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-400" /> Ranking Global
                            </h3>

                            {leaderboard.length === 0 ? (
                                <div className="text-center py-20 text-slate-500">
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Aún nadie ha jugado este quiz.</p>
                                    <p className="text-sm">¡Comparte el link para empezar!</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leaderboard.map((entry, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-purple-500/30 transition-all"
                                        >
                                            <div className={`
                          w-8 h-8 flex items-center justify-center rounded-full font-bold
                          ${idx === 0 ? 'bg-yellow-400 text-black' :
                                                    idx === 1 ? 'bg-slate-300 text-black' :
                                                        idx === 2 ? 'bg-amber-600 text-black' : 'bg-slate-700 text-slate-300'}
                        `}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-white text-lg">{entry.nickname}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                                    <CheckCircle className="w-3 h-3" /> {entry.correctAnswers} correctas
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-purple-400">{entry.score.toLocaleString()}</div>
                                                <div className="text-xs text-slate-500">puntos</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
