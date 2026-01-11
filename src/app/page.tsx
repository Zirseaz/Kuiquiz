'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Loader2, Play, GraduationCap, Sparkles, Users, Zap, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, isTeacher, loading, signInWithGoogle } = useAuth();
  const [gameCode, setGameCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (isTeacher) router.push('/dashboard/teacher');
      else router.push('/dashboard/student');
    }
  }, [user, isTeacher, loading, router]);

  const handleJoinGame = async () => {
    if (!gameCode.trim()) return;
    setIsJoining(true);
    // Navigate to play page with the code
    router.push(`/play/${gameCode.trim()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="KuiQuizz" className="w-10 h-10 rounded-xl" />
          <span className="text-xl font-bold">KuiQuizz</span>
        </div>
        <button
          onClick={signInWithGoogle}
          className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <GraduationCap className="w-4 h-4" />
          Soy Profesor
        </button>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-12 md:pt-20 text-center">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Plataforma de Evaluación con IA
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Aprende jugando,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
              compite aprendiendo.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Únete a quizzes interactivos creados por tus profesores.
            Responde preguntas, gana puntos y sube al podio.
          </p>
        </motion.div>

        {/* Join Game Card - MAIN CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Play className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold">¿Listo para jugar?</h2>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ingresa el código del quiz"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                className="w-full px-6 py-4 bg-slate-950/50 border border-slate-700 rounded-xl text-center text-2xl font-mono tracking-widest placeholder:text-slate-600 placeholder:text-base placeholder:font-sans focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                maxLength={20}
              />

              <button
                onClick={handleJoinGame}
                disabled={!gameCode.trim() || isJoining}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isJoining ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Zap className="w-5 h-5" /> Entrar al Juego
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              Pide el código a tu profesor para unirte
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16"
        >
          {[
            { icon: Zap, title: 'Tiempo Real', desc: 'Compite en vivo con tu clase' },
            { icon: Users, title: 'Multijugador', desc: 'Hasta 100 jugadores simultáneos' },
            { icon: CheckCircle2, title: 'Resultados', desc: 'Retroalimentación instantánea' }
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-3 text-left p-4 bg-slate-900/30 rounded-xl border border-slate-800/50">
              <feature.icon className="w-5 h-5 text-indigo-400 mt-1 shrink-0" />
              <div>
                <div className="font-semibold text-white">{feature.title}</div>
                <div className="text-sm text-slate-500">{feature.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Teacher CTA - Secondary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pb-12"
        >
          <div className="inline-flex items-center gap-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
            <div className="text-left">
              <div className="font-semibold text-sm">¿Eres profesor?</div>
              <div className="text-xs text-slate-500">Crea quizzes con IA desde PDFs</div>
            </div>
            <button
              onClick={signInWithGoogle}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-all flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" /> Acceder
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
