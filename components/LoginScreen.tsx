
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AppSettings, TeamMember } from '../types';
import { Lock, Mail, ArrowRight, Settings, Loader2, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  settings: AppSettings;
  teamMembers: TeamMember[];
  onLoginSuccess: (member: TeamMember) => void;
  onOpenSettings: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ settings, teamMembers, onLoginSuccess, onOpenSettings }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const normalizedEmail = email.toLowerCase().trim();
      const isSuperAdmin = normalizedEmail === 'admin@fablab.com';

      // 1. Recherche du membre dans l'équipe
      let member = teamMembers.find(m => m.email && m.email.toLowerCase() === normalizedEmail);

      // 2. Si pas trouvé ET pas super admin -> Erreur
      if (!member && !isSuperAdmin) {
        throw new Error("Cet email ne correspond à aucun membre de l'équipe.");
      }

      // 3. Construction d'un profil administrateur à la volée si c'est le Super Admin manquant
      if (isSuperAdmin && !member) {
         member = {
             id: 'super-admin',
             name: 'Administrateur Principal',
             email: 'admin@fablab.com',
             role: 'Admin',
             canManageStock: true,
             avatarColor: 'bg-indigo-600'
         };
      }

      // Si on arrive ici, member est défini (soit trouvé, soit créé artificiellement)
      if (!member) throw new Error("Erreur inattendue lors de la récupération du profil.");

      if (settings.mode === 'supabase' && settings.supabaseUrl && settings.supabaseKey) {
        // --- MODE SUPABASE (Authentification Réelle) ---
        const supabase = createClient(settings.supabaseUrl, settings.supabaseKey);
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            emailRedirectTo: window.location.href,
          },
        });

        if (authError) throw authError;
        setMagicLinkSent(true);
      } else {
        // --- MODE LOCAL (Simulation) ---
        await new Promise(resolve => setTimeout(resolve, 800));
        onLoginSuccess(member);
      }

    } catch (err: any) {
      setError(err.message || "Erreur de connexion");
      setMagicLinkSent(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[100px]"></div>
         <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-blue-600 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 relative">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-mono font-bold shadow-lg shadow-indigo-200 transform rotate-3">
              F
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">FabStock Manager</h1>
          <p className="text-center text-slate-500 text-sm mb-8">
            Connectez-vous pour accéder à la gestion du FabLab.
          </p>

          {magicLinkSent ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-800 mb-2">Vérifiez vos emails !</h3>
              <p className="text-sm text-emerald-700 mb-4">
                Un lien magique a été envoyé à <strong>{email}</strong>. Cliquez dessus pour vous connecter.
              </p>
              <button 
                onClick={() => setMagicLinkSent(false)}
                className="text-xs text-emerald-600 underline hover:text-emerald-800"
              >
                Retour à la connexion
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Adresse Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="membre@fablab.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-medium hover:bg-slate-800 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                {isLoading ? 'Vérification...' : 'Accéder à l\'espace'}
              </button>
            </form>
          )}
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${settings.mode === 'supabase' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            Mode: {settings.mode === 'supabase' ? 'Cloud (Supabase)' : 'Local'}
          </div>
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-1 hover:text-slate-800 transition-colors"
          >
            <Settings className="w-3 h-3" />
            Configurer
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-500 text-xs text-center max-w-xs leading-relaxed opacity-60">
        En mode Local, entrez simplement l'email d'un membre existant. En mode Supabase, un lien magique sera envoyé.
      </p>
    </div>
  );
};

export default LoginScreen;
