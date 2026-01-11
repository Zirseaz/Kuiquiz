'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, isTeacher, loading, signInWithGoogle } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (isTeacher) router.push('/dashboard/teacher');
      else router.push('/dashboard/student');
    }
  }, [user, isTeacher, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative selection:bg-indigo-500/30">

      {/* Background Gradients */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 h-screen flex flex-col md:flex-row items-center justify-center md:justify-between gap-12">

        {/* Left Column: Value Prop */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Nueva Versión Enterprise 2.0
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Evaluación inteligente <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              para el futuro.
            </span>
          </h1>

          <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg">
            Genera evaluaciones de alta calidad en segundos usando IA.
            Sube tus PDFs o apuntes y deja que KuiQuizz haga el trabajo pesado.
            Diseñado para instituciones educativas modernas.
          </p>

          <div className="space-y-4 mb-8">
            {[
              'Generación automática desde PDF y Word',
              'Panel de control avanzado para profesores',
              'Historial de progreso para estudiantes',
              'Seguridad y privacidad empresarial'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none" />

            <div className="relative z-10 text-center">
              <img
                src="/logo.png"
                alt="KuiQuizz"
                className="w-20 h-20 mx-auto mb-6 rounded-2xl shadow-lg shadow-indigo-500/20"
              />

              <h2 className="text-2xl font-bold mb-2">Bienvenido a KuiQuizz</h2>
              <p className="text-slate-400 mb-8 text-sm">
                Ingresa con tu cuenta institucional para continuar
              </p>

              <button
                onClick={() => signInWithGoogle()}
                className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-lg active:scale-95"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                Continuar con Google
              </button>

              <div className="mt-6 text-xs text-slate-500">
                Al continuar, aceptas nuestros términos de servicio y política de privacidad de datos.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
