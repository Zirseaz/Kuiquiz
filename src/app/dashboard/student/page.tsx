'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
    Play, Clock, Trophy, Search, BookOpen, LogOut, ChevronRight, Star
} from 'lucide-react';

interface Quiz {
    id: string;
    title: string;
    topic: string;
    questions: any[];
    creatorName: string;
}

export default function StudentDashboard() {
    const router = useRouter();
    const { user, isTeacher, logout, loading } = useAuth();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/');
            else if (isTeacher) router.push('/dashboard/teacher');
            else fetchAvailableQuizzes();
        }
    }, [user, isTeacher, loading, router]);

    async function fetchAvailableQuizzes() {
        try {
            const res = await fetch('/api/quizzes');
            const data = await res.json();
            setQuizzes(data.quizzes || []);
        } catch (err) {
            console.error(err);
        } finally {
            setFetching(false);
        }
    }

    if (loading || fetching) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Cargando material...</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">K</div>
                        KuiQuizz Estudiante
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full py-1 px-3 pr-4">
                            {user?.photoURL ? (
                                <img src={user.photoURL} className="w-6 h-6 rounded-full" />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">{user?.displayName?.[0]}</div>
                            )}
                            <span className="text-sm font-medium">{user?.displayName}</span>
                        </div>
                        <button onClick={logout} className="text-slate-400 hover:text-white transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
                {/* Welcome Hero */}
                <section className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">Hola, {user?.displayName?.split(' ')[0]} 👋</h1>
                    <p className="text-slate-400 text-lg">¿Qué quieres aprender hoy?</p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-900/20 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="text-indigo-200 text-sm font-medium mb-1">Quizzes Completados</div>
                                <div className="text-3xl font-bold">12</div>
                            </div>
                            <Trophy className="absolute right-0 bottom-0 w-24 h-24 text-white opacity-10" />
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
                            <div className="text-slate-400 text-sm font-medium mb-1">Promedio General</div>
                            <div className="text-3xl font-bold text-emerald-400">6.8</div>
                            <Star className="absolute right-4 top-4 w-6 h-6 text-slate-800 group-hover:text-emerald-500/20 transition-colors" />
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
                            <div className="text-slate-400 text-sm font-medium mb-1">Racha de Estudio</div>
                            <div className="text-3xl font-bold text-amber-400">3 días</div>
                            <Clock className="absolute right-4 top-4 w-6 h-6 text-slate-800 group-hover:text-amber-500/20 transition-colors" />
                        </div>
                    </div>
                </section>

                {/* Available Quizzes */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-400" /> Disponibles para ti
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar tema..."
                                className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm focus:outline-none focus:border-indigo-500 w-64"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz, i) => (
                            <motion.div
                                key={quiz.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all cursor-pointer flex flex-col h-full"
                                onClick={() => router.push(`/play/${quiz.id}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                        {quiz.topic || 'General'}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                                    {quiz.title}
                                </h3>

                                <div className="mt-auto pt-4 flex items-center justify-between text-sm text-slate-500 border-t border-slate-800">
                                    <span className="flex items-center gap-1">
                                        {quiz.questions?.length || 5} Preguntas
                                    </span>
                                    <span className="text-slate-600">
                                        Por {quiz.creatorName || 'Profe'}
                                    </span>
                                </div>

                                <div className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium text-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 text-sm flex items-center justify-center gap-2">
                                    Comenzar <ChevronRight className="w-4 h-4" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
