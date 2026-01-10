'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Loader2, Zap, Brain, Trophy, Send, Users, Clock, Target, LogOut, LayoutDashboard } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);

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
  };

  const loadingSteps = [
    '🔍 Analizando tu contenido...',
    '🧠 Generando preguntas con IA...',
    '✨ Preparando tu quiz...',
  ];

  const handleSubmit = useCallback(async () => {
    if (!text.trim()) {
      setError('Por favor, pega algún texto primero');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingStep(0);

    // Animate through loading steps
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 1500);

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
  }, [text, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background with Kahoot-style colors */}
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Main content */}

      {/* Auth Status Bar */}
      <div className="absolute top-4 right-4 z-20">
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
        ) : (
          <button
            onClick={() => router.push('/auth')}
            className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 
                       backdrop-blur-md border border-white/20 rounded-full font-medium transition-all"
          >
            <Users className="w-4 h-4" /> Login / Registrarse
          </button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl text-center"
      >
        {/* Logo & Title - Kahoot style */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="mb-8"
        >
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-10 h-10 text-purple-400" />
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              KuiQuizz
            </h1>
            <Zap className="w-10 h-10 text-cyan-400" />
          </motion.div>
          <p className="text-slate-400 text-lg md:text-xl">
            Transforma cualquier texto en un quiz interactivo 🎮
          </p>
        </motion.div>

        {/* Stats/Features - Kahoot style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-center gap-6 md:gap-10 mb-8"
        >
          {[
            { icon: Brain, label: 'IA Potente', value: 'Gemini', color: 'text-purple-400' },
            { icon: Zap, label: 'Instantáneo', value: '5 seg', color: 'text-yellow-400' },
            { icon: Trophy, label: 'Gamificado', value: 'Top 10', color: 'text-green-400' },
          ].map((feature, idx) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className="flex flex-col items-center gap-1"
            >
              <div className={`p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <span className="text-white font-bold text-sm">{feature.value}</span>
              <span className="text-slate-500 text-xs">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Text Input Area - Improved */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="glass rounded-3xl p-6 border border-slate-700/50 shadow-2xl"
        >
          <div className="flex items-center gap-2 mb-4 text-left">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-white font-semibold block">Pega tu contenido</span>
              <span className="text-slate-500 text-sm">PDF, artículo, apuntes o cualquier texto</span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Copia el texto de cualquier PDF, artículo de Wikipedia, libro o apuntes de clase...

La IA generará 5 preguntas de opción múltiple basadas en tu contenido. ¡Entre más contenido des, mejores serán las preguntas!"
            disabled={isLoading}
            className="w-full h-44 px-4 py-3 bg-slate-800/70 border border-slate-600/50 rounded-2xl
                       text-white placeholder-slate-500 resize-none text-base
                       focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30
                       transition-all duration-300 disabled:opacity-50"
          />

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Target className="w-4 h-4" />
              <span>{text.length.toLocaleString()} / 50,000 caracteres</span>
            </div>

            <motion.button
              onClick={handleSubmit}
              disabled={isLoading || !text.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
                         rounded-xl text-white font-bold shadow-lg shadow-purple-500/25
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         flex items-center gap-2 transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-5 h-5" />
                  </motion.div>
                  Generando...
                </>
              ) : (
                <>
                  Crear Quiz <Send className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Loading Progress - Kahoot style */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 glass rounded-2xl p-4"
            >
              <div className="flex items-center justify-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-2xl"
                >
                  {loadingSteps[loadingStep].split(' ')[0]}
                </motion.div>
                <span className="text-white font-medium">
                  {loadingSteps[loadingStep].substring(2)}
                </span>
              </div>
              <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${((loadingStep + 1) / 3) * 100}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400"
            >
              ❌ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips - Improved */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          {['� PDFs', '📰 Artículos', '📝 Apuntes', '🌐 Wikipedia'].map((tip, i) => (
            <span
              key={tip}
              className="px-3 py-1.5 bg-slate-800/50 rounded-full text-slate-400 text-sm border border-slate-700/50"
            >
              {tip}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
