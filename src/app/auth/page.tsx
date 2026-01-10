'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Sparkles, Loader2, ArrowRight, UserPlus, LogIn } from 'lucide-react';

type AuthMode = 'login' | 'register';

interface UserData {
    id: string;
    username: string;
    email: string;
    stats: {
        gamesPlayed: number;
        totalScore: number;
        bestStreak: number;
    };
}

export default function AuthPage() {
    const router = useRouter();
    const [mode, setMode] = useState<AuthMode>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form fields
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { auth } = await import('@/lib/firebase');
            const { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');

            let userCredential;

            if (mode === 'login') {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (auth.currentUser && username) {
                    await updateProfile(auth.currentUser, { displayName: username });
                }
            }

            const user = userCredential.user;

            // Minimal user object for local app compatibility
            const appUser = {
                id: user.uid,
                username: user.displayName || username || email.split('@')[0],
                email: user.email,
            };

            // Save user to localStorage for legacy components
            localStorage.setItem('kuiquizz_user', JSON.stringify(appUser));

            // Redirect to home
            router.push('/');

        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Credenciales inválidas');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('El email ya está registrado');
            } else {
                setError(err.message || 'Error de autenticación');
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError(null);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-slate-950">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                >
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            KuiQuizz
                        </h1>
                    </div>
                    <p className="text-slate-400">
                        {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta gratis'}
                    </p>
                </motion.div>

                {/* Auth Card */}
                <motion.div
                    layout
                    className="glass rounded-3xl p-8 border border-slate-700/50 shadow-2xl"
                >
                    {/* Mode Toggle */}
                    <div className="flex mb-6 bg-slate-800/50 rounded-xl p-1">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${mode === 'login'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <LogIn className="w-4 h-4" /> Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${mode === 'register'
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            <UserPlus className="w-4 h-4" /> Registrarse
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username (only for register) */}
                        <AnimatePresence>
                            {mode === 'register' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <label className="block text-sm text-slate-400 mb-2">Nombre de usuario</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Tu apodo"
                                            maxLength={15}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-800/70 border border-slate-600/50 rounded-xl
                                 text-white placeholder-slate-500
                                 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30
                                 transition-all"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800/70 border border-slate-600/50 rounded-xl
                             text-white placeholder-slate-500
                             focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30
                             transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-800/70 border border-slate-600/50 rounded-xl
                             text-white placeholder-slate-500
                             focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30
                             transition-all"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 
                         hover:from-purple-500 hover:to-pink-500 rounded-xl text-white text-lg font-bold
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25
                         transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {mode === 'login' ? 'Iniciando...' : 'Registrando...'}
                                </>
                            ) : (
                                <>
                                    {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Skip/Continue as guest */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => router.push('/')}
                            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                        >
                            Continuar sin cuenta →
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
