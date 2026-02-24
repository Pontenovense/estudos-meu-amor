import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, Mail, Lock, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'recovery';

export function AuthPage() {
  const { signIn, signUp, recoverPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await signIn(email, senha);
        if (result.error) setError(result.error);
      } else if (mode === 'register') {
        if (!nome.trim()) { setError('Por favor, informe seu nome.'); setLoading(false); return; }
        if (senha.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); setLoading(false); return; }
        const result = await signUp(email, senha, nome);
        if (result.error) setError(result.error);
        else setSuccess('Conta criada com sucesso! Verifique seu e-mail para confirmar.');
      } else {
        const result = await recoverPassword(email);
        if (result.error) setError(result.error);
        else setSuccess('Se este e-mail estiver cadastrado, você receberá instruções de recuperação.');
      }
    } catch {
      setError('Erro inesperado. Tente novamente.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #fdf2f8 30%, #eff6ff 60%, #f0fdf4 100%)' }}>
      <div className="fixed top-10 left-10 w-48 h-48 md:w-64 md:h-64 bg-purple-200/30 rounded-full blur-3xl animate-pulse-soft pointer-events-none" />
      <div className="fixed bottom-10 right-10 w-56 h-56 md:w-80 md:h-80 bg-pink-200/30 rounded-full blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: '1s' }} />
      <div className="fixed top-1/2 left-1/3 w-32 h-32 md:w-40 md:h-40 bg-blue-200/20 rounded-full blur-3xl animate-pulse-soft pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl shadow-purple-200 mb-4 animate-float">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            Estudos Meu Amor
          </h1>
          <p className="text-gray-500 mt-2 flex items-center justify-center gap-1.5 text-sm">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Organize seus estudos com carinho
            <Sparkles className="w-4 h-4 text-pink-400" />
          </p>
        </div>

        <div className="glass-card p-6 md:p-8 animate-slideUp">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {mode === 'login' && '👋 Bem-vinda de volta nenem!'}
            {mode === 'register' && '✨ Crie sua conta'}
            {mode === 'recovery' && '🔐 Recuperar senha'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 pointer-events-none z-10" />
                <input type="text" placeholder="Seu nome" value={nome}
                  onChange={e => setNome(e.target.value)} className="input-with-icon" required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 pointer-events-none z-10" />
              <input type="email" placeholder="Seu e-mail" value={email}
                onChange={e => setEmail(e.target.value)} className="input-with-icon" required />
            </div>
            {mode !== 'recovery' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 pointer-events-none z-10" />
                <input type="password" placeholder="Sua senha" value={senha}
                  onChange={e => setSenha(e.target.value)} className="input-with-icon" required minLength={6} />
              </div>
            )}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm animate-scaleIn">{error}</div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm animate-scaleIn">{success}</div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  {mode === 'login' && 'Entrar'}
                  {mode === 'register' && 'Criar conta'}
                  {mode === 'recovery' && 'Enviar recuperação'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3 text-center">
            {mode === 'login' && (
              <>
                <button onClick={() => { setMode('recovery'); setError(''); setSuccess(''); }}
                  className="text-sm text-purple-500 hover:text-purple-700 transition-colors block mx-auto">
                  Esqueceu sua senha?
                </button>
                <p className="text-sm text-gray-500">
                  Não tem conta?{' '}
                  <button onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                    className="text-purple-600 font-semibold hover:text-purple-700">Cadastre-se</button>
                </p>
              </>
            )}
            {mode === 'register' && (
              <p className="text-sm text-gray-500">
                Já tem conta?{' '}
                <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className="text-purple-600 font-semibold hover:text-purple-700">Faça login</button>
              </p>
            )}
            {mode === 'recovery' && (
              <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className="text-sm text-purple-600 font-semibold hover:text-purple-700">← Voltar ao login</button>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Feito com 💜 para a Isabella</p>
      </div>
    </div>
  );
}
