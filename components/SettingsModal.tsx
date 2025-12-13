
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { X, Database, HardDrive, Check, AlertCircle, Copy, UploadCloud, Loader2, Mail, FileCode, DownloadCloud } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onUpload: (settings: AppSettings) => Promise<void>;
  onDownload: (settings: AppSettings) => Promise<void>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave, onUpload, onDownload }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [showSqlHelp, setShowSqlHelp] = useState(false);
  const [showEmailHelp, setShowEmailHelp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionStatus, setActionStatus] = useState<{success: boolean; message: string} | null>(null);

  // CRITICAL: Ensure form data is synced with props whenever modal opens or props change
  // This prevents keys from being "erased" if the modal was closed and re-opened
  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleUpload = async () => {
      if (!formData.supabaseUrl || !formData.supabaseKey) {
          setActionStatus({ success: false, message: 'URL et Clé requises.' });
          return;
      }
      setIsProcessing(true);
      setActionStatus(null);
      try {
          await onUpload(formData);
          setActionStatus({ success: true, message: 'Données locales ENVOYÉES vers le cloud avec succès !' });
      } catch (e: any) {
          setActionStatus({ success: false, message: 'Erreur: ' + e.message });
      } finally {
          setIsProcessing(false);
      }
  };

  const handleDownload = async () => {
      if (!formData.supabaseUrl || !formData.supabaseKey) {
          setActionStatus({ success: false, message: 'URL et Clé requises.' });
          return;
      }
      if (!window.confirm("Attention : Cette action va REMPLACER toutes vos données locales par celles du serveur Supabase. Continuer ?")) {
          return;
      }
      setIsProcessing(true);
      setActionStatus(null);
      try {
          await onDownload(formData);
          setActionStatus({ success: true, message: 'Données cloud REÇUES avec succès !' });
      } catch (e: any) {
          setActionStatus({ success: false, message: 'Erreur: ' + e.message });
      } finally {
          setIsProcessing(false);
      }
  };

  const sqlSnippet = `
-- Créez ces tables dans l'éditeur SQL de Supabase

create table inventory ( id text primary key, data jsonb not null );
create table team ( id text primary key, data jsonb not null );
create table machines ( id text primary key, data jsonb not null );
create table maintenance ( id text primary key, data jsonb not null );

-- Activez Row Level Security
alter table inventory enable row level security;
alter table team enable row level security;
alter table machines enable row level security;
alter table maintenance enable row level security;

-- Politiques permissives (DEV UNIQUEMENT)
create policy "Public Inv" on inventory for all using (true);
create policy "Public Team" on team for all using (true);
create policy "Public Mach" on machines for all using (true);
create policy "Public Maint" on maintenance for all using (true);
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Paramètres de Données
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-8">
          
          {/* Mode Selection */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Mode de Stockage</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => setFormData({ ...formData, mode: 'local' })}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                  formData.mode === 'local' 
                    ? 'border-indigo-600 bg-indigo-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${formData.mode === 'local' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold ${formData.mode === 'local' ? 'text-indigo-900' : 'text-slate-700'}`}>LocalStorage</h3>
                  <p className="text-xs text-slate-500 mt-1">Stockage local. Gratuit, pas de synchro.</p>
                </div>
                {formData.mode === 'local' && <Check className="w-5 h-5 text-indigo-600 ml-auto" />}
              </div>

              <div 
                onClick={() => setFormData({ ...formData, mode: 'supabase' })}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                  formData.mode === 'supabase' 
                    ? 'border-emerald-600 bg-emerald-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${formData.mode === 'supabase' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold ${formData.mode === 'supabase' ? 'text-emerald-900' : 'text-slate-700'}`}>Supabase (Cloud)</h3>
                  <p className="text-xs text-slate-500 mt-1">Synchro temps réel via internet.</p>
                </div>
                {formData.mode === 'supabase' && <Check className="w-5 h-5 text-emerald-600 ml-auto" />}
              </div>
            </div>
          </div>

          {/* Supabase Configuration */}
          {/* NOTE: We keep rendering inputs (hidden/visible) but ensuring values are bound to prevent data loss */}
          {formData.mode === 'supabase' && (
            <div className="animate-in fade-in slide-in-from-top-4 space-y-6 pt-4 border-t border-slate-100">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>Nécessite un projet <a href="https://supabase.com" target="_blank" className="underline font-bold">Supabase</a>.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Project URL</label>
                  <input 
                    type="text" 
                    autoComplete="off"
                    placeholder="https://xyz.supabase.co"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                    value={formData.supabaseUrl}
                    onChange={(e) => setFormData({...formData, supabaseUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">API Key (public/anon)</label>
                  <input 
                    type="password" 
                    autoComplete="off"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm"
                    value={formData.supabaseKey}
                    onChange={(e) => setFormData({...formData, supabaseKey: e.target.value})}
                  />
                </div>
              </div>

               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Migration & Synchronisation Initiale</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Upload Button */}
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                          <div className="flex flex-col items-start text-xs text-left">
                             <span className="font-bold">Envoyer vers Supabase</span>
                             <span className="opacity-75 text-[10px]">Local {'->'} Cloud</span>
                          </div>
                      </button>

                      {/* Download Button */}
                      <button
                        type="button"
                        onClick={handleDownload}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                          <div className="flex flex-col items-start text-xs text-left">
                             <span className="font-bold">Recevoir de Supabase</span>
                             <span className="opacity-75 text-[10px]">Cloud {'->'} Local</span>
                          </div>
                      </button>
                  </div>
                  {actionStatus && (
                      <div className={`text-xs mt-3 p-2 rounded flex items-start gap-2 ${actionStatus.success ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-rose-700 bg-rose-50 border border-rose-100'}`}>
                          {actionStatus.success ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                          {actionStatus.message}
                      </div>
                  )}
                  <p className="text-[10px] text-slate-400 mt-2 text-center">Utilisez ces actions uniquement lors de l'installation sur un nouvel appareil ou pour une migration.</p>
              </div>

              <div className="pt-2">
                <button 
                  type="button"
                  onClick={() => setShowSqlHelp(!showSqlHelp)}
                  className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1"
                >
                  {showSqlHelp ? 'Masquer' : 'Voir'} le code SQL requis
                </button>
                
                {showSqlHelp && (
                  <div className="mt-3 relative">
                    <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg text-xs overflow-x-auto">
                      {sqlSnippet}
                    </pre>
                    <button 
                      type="button"
                      onClick={() => navigator.clipboard.writeText(sqlSnippet)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-white"
                      title="Copier"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EmailJS Configuration */}
           <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Configuration Email (EmailJS)</h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setShowEmailHelp(!showEmailHelp)}
                  className="text-xs flex items-center gap-1 text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                >
                  <FileCode className="w-3 h-3" />
                  Voir le modèle
                </button>
            </div>
            
            {showEmailHelp && (
                 <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-900 animate-in fade-in">
                    <p className="font-semibold mb-2">Configurez votre modèle EmailJS avec ces variables :</p>
                    <ul className="list-disc pl-5 space-y-1 mb-2 text-xs font-mono">
                        <li>{`{{to_name}}`} : Nom du membre</li>
                        <li>{`{{invite_link}}`} : Lien de l'application</li>
                    </ul>
                    <p className="text-xs text-indigo-700">Exemple de corps : "Bonjour {`{{to_name}}`}, rejoins-nous ici : {`{{invite_link}}`}"</p>
                 </div>
            )}

            <p className="text-xs text-slate-500">Pour envoyer des emails directement (au lieu d'ouvrir Outlook/Mail), configurez <a href="https://www.emailjs.com" target="_blank" className="underline font-bold">EmailJS</a>.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Service ID</label>
                <input 
                  type="text" 
                  autoComplete="off"
                  placeholder="service_xxxxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                  value={formData.emailJsServiceId || ''}
                  onChange={(e) => setFormData({...formData, emailJsServiceId: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Template ID</label>
                <input 
                  type="text" 
                  autoComplete="off"
                  placeholder="template_xxxxx"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                  value={formData.emailJsTemplateId || ''}
                  onChange={(e) => setFormData({...formData, emailJsTemplateId: e.target.value})}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Public Key</label>
                <input 
                  type="password" 
                  autoComplete="off"
                  placeholder="Public Key (User ID)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                  value={formData.emailJsPublicKey || ''}
                  onChange={(e) => setFormData({...formData, emailJsPublicKey: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-900/20"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
