'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Plus, Play, Trash2, Users, FileText, Link as LinkIcon,
    Upload, Loader2, Search, Settings, LogOut, FileType
} from 'lucide-react';
import { parseFile } from '@/lib/parsers';

// Types
interface Quiz {
    id: string;
    title: string;
    topic: string;
    questions: any[];
    createdAt: string;
    creatorId: string;
}

export default function TeacherDashboard() {
    const router = useRouter();
    const { user, isTeacher, logout, loading } = useAuth();

    // State
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [fetching, setFetching] = useState(true);

    // Creation Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createMode, setCreateMode] = useState<'text' | 'file' | 'url'>('text');
    const [inputText, setInputText] = useState('');
    const [inputUrl, setInputUrl] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [processStep, setProcessStep] = useState<string>('');

    useEffect(() => {
        if (!loading) {
            if (!user) router.push('/');
            else if (!isTeacher) router.push('/dashboard/student');
            else fetchMyQuizzes();
        }
    }, [user, isTeacher, loading, router]);

    async function fetchMyQuizzes() {
        if (!user) return;
        try {
            const res = await fetch(`/api/user/${user.uid}/quizzes`);
            const data = await res.json();
            setQuizzes(data.quizzes || []);
        } catch (error) {
            console.error(error);
        } finally {
            setFetching(false);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                CREATE LOGIC                                */
    /* -------------------------------------------------------------------------- */

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setProcessStep('Leyendo archivo...');

        try {
            const text = await parseFile(file);
            if (text.length < 50) throw new Error('El archivo tiene muy poco texto.');
            await generateQuiz(text);
        } catch (err: any) {
            alert(err.message);
            setIsProcessing(false);
        }
    };

    const handleUrlSubmit = async () => {
        if (!inputUrl) return;
        setIsProcessing(true);
        setProcessStep('Analizando página web...');

        try {
            const res = await fetch('/api/extract-url', {
                method: 'POST',
                body: JSON.stringify({ url: inputUrl })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            await generateQuiz(data.text);
        } catch (err: any) {
            alert(err.message);
            setIsProcessing(false);
        }
    };

    const handleTextSubmit = async () => {
        if (!inputText) return;
        setIsProcessing(true);
        await generateQuiz(inputText);
    };

    const generateQuiz = async (sourceText: string) => {
        setProcessStep('IA generando preguntas...');
        try {
            const res = await fetch('/api/create-quiz', {
                method: 'POST',
                body: JSON.stringify({
                    text: sourceText,
                    userId: user?.uid,
                    username: user?.displayName
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Success!
            setShowCreateModal(false);
            fetchMyQuizzes(); // Refresh list
            alert('¡Quiz creado exitosamente!');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const deleteQuiz = async (quizId: string) => {
        if (!confirm('¿Estás seguro de eliminar este quiz? No se puede deshacer.')) return;
        // Implementation pending for delete API, for now just remove from list UI
        // In a real app we would call DELETE /api/quiz/[id]
        alert('Funcionalidad de eliminar pendiente de API (Proximamente)');
    };

    if (loading || fetching) return <div className="min-h-screen grid place-items-center bg-slate-950 text-white"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-950 p-6 hidden md:flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-500/30">
                        K
                    </div>
                    <span className="text-xl font-bold tracking-tight">KuiQuizz <span className="text-indigo-400">Pro</span></span>
                </div>

                <nav className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-900 rounded-xl text-white font-medium border border-slate-800">
                        <LayoutDashboard className="w-5 h-5 text-indigo-400" /> Dashboard
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-900/50 rounded-xl transition-colors cursor-not-allowed opacity-50">
                        <Users className="w-5 h-5" /> Alumnos (Pronto)
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-900/50 rounded-xl transition-colors cursor-not-allowed opacity-50">
                        <Settings className="w-5 h-5" /> Configuración
                    </div>
                </nav>

                <div className="pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <img src={user?.photoURL || ''} alt="" className="w-10 h-10 rounded-full bg-slate-800" />
                        <div className="overflow-hidden">
                            <div className="font-medium truncate">{user?.displayName}</div>
                            <div className="text-xs text-slate-500 truncate">Profesor</div>
                        </div>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm transition-colors">
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
                            Panel de Control
                        </h1>
                        <p className="text-slate-400 mt-1">Gestiona tus evaluaciones y contenidos.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Nuevo Material
                    </button>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {[
                        { label: 'Quizzes Activos', value: quizzes.length, icon: FileText, color: 'text-indigo-400' },
                        { label: 'Alumnos Totales', value: '128', icon: Users, color: 'text-emerald-400' },
                        { label: 'Tasa de Aprobación', value: '84%', icon: LayoutDashboard, color: 'text-amber-400' }
                    ].map((stat, i) => (
                        <div key={i} className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                            <div className={`p-4 rounded-xl bg-slate-900 ${stat.color} bg-opacity-20`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <div className="text-sm text-slate-400">{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quiz Grid */}
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Search className="w-5 h-5 text-slate-500" /> Biblioteca de Contenido
                </h2>

                {quizzes.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
                        <p className="text-slate-500 mb-4">No tienes material creado aún.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-indigo-400 font-medium hover:underline"
                        >
                            Crear el primero ahora
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <div key={quiz.id} className="glass-card p-6 rounded-2xl group hover:border-indigo-500/30 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
                                        {quiz.topic || 'General'}
                                    </span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => deleteQuiz(quiz.id)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold mb-2 line-clamp-1">{quiz.title}</h3>
                                <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                                    Generado el {new Date(quiz.createdAt).toLocaleDateString()}
                                </p>

                                <div className="flex gap-3 mt-auto">
                                    <button
                                        onClick={() => router.push(`/host/${quiz.id}`)}
                                        className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700"
                                    >
                                        Gestionar
                                    </button>
                                    <button
                                        onClick={() => router.push(`/play/${quiz.id}`)}
                                        title="Probar como alumno"
                                        className="px-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg transition-colors border border-indigo-500/20"
                                    >
                                        <Play className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* CREATE MODAL */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => !isProcessing && setShowCreateModal(false)}
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl overflow-hidden"
                        >
                            {isProcessing ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                                    <h3 className="text-xl font-bold">{processStep}</h3>
                                    <p className="text-slate-400">Transformando conocimiento en preguntas...</p>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-6">Crear Nuevo Material</h2>

                                    {/* Input Method Tabs */}
                                    <div className="flex gap-4 mb-8">
                                        <button
                                            onClick={() => setCreateMode('text')}
                                            className={`flex-1 py-3 rounded-xl border font-medium transition-all flex flex-col items-center gap-2
                                    ${createMode === 'text' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                                        >
                                            <FileText className="w-5 h-5" /> Texto Manual
                                        </button>
                                        <button
                                            onClick={() => setCreateMode('file')}
                                            className={`flex-1 py-3 rounded-xl border font-medium transition-all flex flex-col items-center gap-2
                                    ${createMode === 'file' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                                        >
                                            <FileType className="w-5 h-5" /> Subir Archivo
                                        </button>
                                        <button
                                            onClick={() => setCreateMode('url')}
                                            className={`flex-1 py-3 rounded-xl border font-medium transition-all flex flex-col items-center gap-2
                                    ${createMode === 'url' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'}`}
                                        >
                                            <LinkIcon className="w-5 h-5" /> Desde Web
                                        </button>
                                    </div>

                                    {/* Content Area */}
                                    <div className="min-h-[200px] mb-8">
                                        {createMode === 'text' && (
                                            <textarea
                                                className="input-field h-52 resize-none"
                                                placeholder="Pega aquí tus apuntes, resumen o contenido de clase..."
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                            />
                                        )}

                                        {createMode === 'file' && (
                                            <div className="h-52 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl bg-slate-950/50 flex flex-col items-center justify-center relative cursor-pointer group transition-colors">
                                                <input type="file" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" accept=".pdf,.docx,.txt" />
                                                <Upload className="w-10 h-10 text-slate-500 group-hover:text-indigo-500 mb-3 transition-colors" />
                                                <span className="font-medium text-slate-400 group-hover:text-white">Arrastra o Click para subir</span>
                                                <span className="text-xs text-slate-600 mt-2">Soporta: PDF, Word, TXT</span>
                                            </div>
                                        )}

                                        {createMode === 'url' && (
                                            <div className="flex flex-col gap-4">
                                                <label className="text-sm text-slate-400">Pegar URL del artículo o blog</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        className="input-field"
                                                        placeholder="https://es.wikipedia.org/wiki/..."
                                                        value={inputUrl}
                                                        onChange={(e) => setInputUrl(e.target.value)}
                                                    />
                                                </div>
                                                <button onClick={handleUrlSubmit} className="btn-secondary w-full">
                                                    Analizar Web
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end gap-3">
                                        <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 rounded-lg font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                                            Cancelar
                                        </button>
                                        {createMode === 'text' && (
                                            <button onClick={handleTextSubmit} disabled={!inputText} className="btn-primary">
                                                Generar Quiz
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
