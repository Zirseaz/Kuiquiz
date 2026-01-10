'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Plus, Play, Share2, Trash2,
    BarChart2, Users, Calendar, Clock, Loader2, ArrowRight
} from 'lucide-react';

interface Quiz {
    id: string;
    questions: any[];
    createdAt: string;
    creatorId: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: string; username: string } | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('kuiquizz_user');
        if (!savedUser) {
            router.push('/auth');
            return;
        }
        const userData = JSON.parse(savedUser);
        setUser(userData);
        fetchQuizzes(userData.id);
    }, [router]);

    async function fetchQuizzes(userId: string) {
        try {
            const response = await fetch(`/api/user/${userId}/quizzes`);
            if (response.ok) {
                const data = await response.json();
                setQuizzes(data.quizzes);
            }
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    }

    const handlePlay = (quizId: string) => {
        router.push(`/play/${quizId}`);
    };

    const handleHost = (quizId: string) => {
        // For now, host view is just play view but maybe later we add more controls
        // Actually, let's create a dedicated host view or just direct them to play for MVP
        // User requested "Host View" so let's point to that, even if simple for now
        router.push(`/host/${quizId}`);
    };

    const copyLink = (quizId: string) => {
        const url = `${window.location.origin}/play/${quizId}`;
        navigator.clipboard.writeText(url);
        alert('¡Enlace copiado al portapapeles!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 md:p-12 bg-slate-950 text-white">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 flex items-center gap-3">
                            <LayoutDashboard className="w-8 h-8 text-purple-400" />
                            Mis Quizzes
                        </h1>
                        <p className="text-slate-400">Bienvenido, {user?.username}. Aquí están tus creaciones.</p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold flex items-center gap-2 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Crear Nuevo
                    </button>
                </div>

                {/* Quizzes Grid */}
                {quizzes.length === 0 ? (
                    <div className="text-center py-20 px-6 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                        <div className="inline-block p-4 bg-slate-800 rounded-full mb-4">
                            <LayoutDashboard className="w-8 h-8 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Aún no has creado quizzes</h3>
                        <p className="text-slate-400 mb-6">¡Convierte cualquier texto en un juego divertido!</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                        >
                            Crear mi primer Quiz
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz, index) => (
                            <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-purple-500/50 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl">
                                        <BarChart2 className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div className="text-xs text-slate-500 flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(quiz.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                                    Quiz #{quiz.id.slice(0, 4)}
                                </h3>
                                <div className="flex gap-4 text-sm text-slate-400 mb-6">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> {quiz.questions.length} preguntas
                                    </span>
                                    {/* Would need to fetch stats to show played count properly */}
                                    {/* <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> 12 jugadas
                  </span> */}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleHost(quiz.id)}
                                        className="col-span-2 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Users className="w-4 h-4" /> Panel de Host
                                    </button>
                                    <button
                                        onClick={() => handlePlay(quiz.id)}
                                        className="py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm"
                                    >
                                        <Play className="w-4 h-4" /> Jugar
                                    </button>
                                    <button
                                        onClick={() => copyLink(quiz.id)}
                                        className="py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-all text-sm"
                                    >
                                        <Share2 className="w-4 h-4" /> Link
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
