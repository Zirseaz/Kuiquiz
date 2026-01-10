'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Sparkles, Loader2, Zap, Brain, Trophy, Send, Users,
  Clock, Target, LogOut, LayoutDashboard, GraduationCap, Upload
} from 'lucide-react';
import { extractTextFromPDF } from '@/lib/pdf';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<'landing' | 'create' | 'join'>('landing');

  // Create State
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [quizIdInput, setQuizIdInput] = useState('');

  // Check auth state
  useEffect(() => {
    const savedUser = localStorage.getItem('kuiquizz_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('kuiquizz_user');
    setUser(null);
    setView('landing'); // Go back to landing on logout
  };

  const loadingSteps = [
    '🔍 Analizando tu contenido...',
    '🧠 Generando preguntas con IA...',
    '✨ Preparando tu quiz...',
  ];

  /* -------------------------------------------------------------------------- */
  /*                                PDF HANDLING                                */
  /* -------------------------------------------------------------------------- */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Por favor sube solo archivos PDF');
      return;
    }

    setIsProcessingFile(true);
    setError(null);

    try {
      const extractedText = await extractTextFromPDF(file);
      if (extractedText.length < 50) {
        throw new Error('El PDF parece estar vacío o es una imagen escaneada sin texto seleccionable.');
      }
      setText(extractedText);
      // Optional: Clear file input?
    } catch (err: any) {
      setError(err.message || 'Error al leer el PDF');
    } finally {
      setIsProcessingFile(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                QUIZ CREATION                               */
  /* -------------------------------------------------------------------------- */
  const handleSubmit = useCallback(async () => {
    if (!text.trim()) {
      setError('Por favor, pega algún texto o sube un PDF primero');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingStep(0);

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 2500); // Slightly slower to account for deepseek latency

    try {
      const response = await fetch('/api/create-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          userId: user?.id,
          username: user?.username
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear el quiz');
      }

      const { quizId } = await response.json();
      clearInterval(interval);
      router.push(`/play/${quizId}`);

    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Algo salió mal');
      setIsLoading(false);
    }
  }, [text, router, user]);

  const handleJoinGame = () => {
    if (!quizIdInput.trim()) return;
    router.push(`/play/${quizIdInput}`);
  };

  /* -------------------------------------------------------------------------- */
  /*                                VIEW: LANDING                               */
  /* -------------------------------------------------------------------------- */
  if (view === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
        <BackgroundEffects />

        <div className="relative z-10 max-w-4xl w-full text-center">
          {/* Header */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tight mb-4 drop-shadow-2xl">
              KuiQuizz
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 font-light">
              La plataforma educativa del futuro
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto">
            {/* Card Profesor */}
            <motion.button
              whileHover={{ scale: 1.05, translateY: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (user) setView('create');
                else router.push('/auth');
              }}
              className="group relative p-8 rounded-3xl bg-gradient-to-br from-violet-600/20 to-purple-900/40 border border-violet-500/30 hover:border-violet-400 transition-all text-left flex flex-col h-64 justify-between overflow-hidden"
            >
              <div className="absolute inset-0 bg-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="p-3 bg-violet-500/20 rounded-2xl w-fit mb-4 group-hover:bg-violet-500 group-hover:text-white transition-colors text-violet-300">
                  <LayoutDashboard className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Soy Profesor</h2>
                <p className="text-violet-200">Crear quizzes con IA, gestionar clases y ver estadísticas.</p>
              </div>
              <div className="flex items-center gap-2 text-violet-300 group-hover:text-white font-medium">
                Crear ahora <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>

            {/* Card Estudiante */}
            <motion.button
              whileHover={{ scale: 1.05, translateY: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView('join')}
              className="group relative p-8 rounded-3xl bg-gradient-to-br from-cyan-600/20 to-blue-900/40 border border-cyan-500/30 hover:border-cyan-400 transition-all text-left flex flex-col h-64 justify-between overflow-hidden"
            >
              <div className="absolute inset-0 bg-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="p-3 bg-cyan-500/20 rounded-2xl w-fit mb-4 group-hover:bg-cyan-500 group-hover:text-white transition-colors text-cyan-300">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Soy Estudiante</h2>
                <p className="text-cyan-200">Unirme a una partida, repasar materias y competir.</p>
              </div>
              <div className="flex items-center gap-2 text-cyan-300 group-hover:text-white font-medium">
                Unirse a juego <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                                 VIEW: JOIN                                 */
  /* -------------------------------------------------------------------------- */
  if (view === 'join') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
        <BackgroundEffects />
        <div className="relative z-10 w-full max-w-md">
          <button onClick={() => setView('landing')} className="mb-8 text-slate-400 hover:text-white flex items-center gap-2">
            ← Volver
          </button>

          <div className="glass rounded-3xl p-8 border border-slate-700/50 shadow-2xl text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">¡A Jugar!</h2>
            <p className="text-slate-400 mb-8">Ingresa el ID del Quiz que te dio tu profesor.</p>

            <input
              type="text"
              value={quizIdInput}
              onChange={(e) => setQuizIdInput(e.target.value)}
              placeholder="Ej: 8f4a..."
              className="w-full text-center text-2xl font-bold bg-slate-900/50 border border-slate-700 rounded-xl py-4 mb-4 text-white focus:border-cyan-500 focus:outline-none placeholder:text-slate-700 uppercase tracking-widest"
            />

            <button
              onClick={handleJoinGame}
              disabled={!quizIdInput.trim()}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Entrar al Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }


  /* -------------------------------------------------------------------------- */
  /*                                VIEW: CREATE                                */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
      <BackgroundEffects />

      {/* Auth Status Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        <button onClick={() => setView('landing')} className="text-slate-400 hover:text-white px-3 text-sm">Inicio</button>
        {user ? (
          <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md p-2 pl-4 rounded-full border border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
                {user.username[0].toUpperCase()}
              </div>
              <span className="font-medium text-white">{user.username}</span>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-purple-300 hover:text-white"
              title="Mis Quizzes"
            >
              <LayoutDashboard className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-3xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Crear Nuevo Quiz</h1>
          <p className="text-slate-400">Pega tu texto o sube un PDF para generar preguntas automáticamente.</p>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8 border border-slate-700/50 shadow-2xl">

          {/* Tabs / Input Type Selector */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-32 border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center bg-slate-900/40 hover:bg-slate-900/60 transition-all cursor-pointer relative group">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isLoading || isProcessingFile}
              />
              {isProcessingFile ? (
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
              ) : (
                <Upload className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform mb-2" />
              )}
              <span className="font-medium text-slate-300 group-hover:text-white">
                {isProcessingFile ? 'Leyendo PDF...' : 'Subir PDF'}
              </span>
              <span className="text-xs text-slate-500 mt-1">Click o arrastra aquí</span>
            </div>

            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-500 font-bold">O</div>

            <div className="flex-1 h-32 border-2 border-transparent bg-slate-800/50 rounded-2xl flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-8 h-8 mb-2" />
              <span>Pegar Texto abajo</span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Si no tienes un PDF, pega aquí el texto de tus apuntes, libro o artículo..."
            disabled={isLoading || isProcessingFile}
            className="w-full h-64 px-4 py-4 bg-slate-800/70 border border-slate-600/50 rounded-2xl
                       text-white placeholder-slate-500 resize-none text-lg leading-relaxed
                       focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30
                       transition-all duration-300 disabled:opacity-50 mb-4 font-sans"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {text.length > 0 && (
                <span className="text-green-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {text.length.toLocaleString()} caracteres listos
                </span>
              )}
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={isLoading || !text.trim() || isProcessingFile}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
                         rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-500/25
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         flex items-center gap-3 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generando Quiz...
                </>
              ) : (
                <>
                  Generar Quiz con IA <Zap className="w-5 h-5 fill-white" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 glass rounded-2xl p-6 text-center"
            >
              <div className="text-2xl mb-2 animate-bounce">
                {loadingSteps[loadingStep].split(' ')[0]}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {loadingSteps[loadingStep].substring(2)}
              </h3>
              <p className="text-slate-400 text-sm">Esto puede tomar unos segundos, DeepSeek está pensando...</p>
              <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden max-w-xs mx-auto">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 flex items-center gap-3"
            >
              <div className="p-2 bg-red-500/20 rounded-lg">❌</div>
              <div>
                <div className="font-bold">Error</div>
                <div className="text-sm opacity-80">{error}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 70%)'
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
      />
    </div>
  )
}

// Icon helper components to be clean
function ArrowRight(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
}
