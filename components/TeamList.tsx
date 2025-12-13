
import React, { useState } from 'react';
import { TeamMember, AppSettings } from '../types';
import { Users, UserPlus, Shield, Trash2, Lock, Pencil, Mail, Send, Loader2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface TeamListProps {
  members: TeamMember[];
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => void;
  onDeleteMember: (id: string) => void;
  onEditMember?: (member: TeamMember) => void;
  currentUser: TeamMember;
  settings?: AppSettings;
}

const TeamList: React.FC<TeamListProps> = ({ members, onAddMember, onUpdateMember, onDeleteMember, onEditMember, currentUser, settings }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Admin' | 'Membre' | 'Stagiaire'>('Membre');
  
  const [sendingEmail, setSendingEmail] = useState(false);

  const isAdmin = currentUser.role === 'Admin';

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newMember: Omit<TeamMember, 'id'> = {
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      canManageStock: newMemberRole !== 'Stagiaire',
      avatarColor: randomColor
    };

    onAddMember(newMember);

    // L'email étant maintenant obligatoire, on tente l'envoi
    await sendInviteEmail(newMemberEmail, newMemberName);

    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('Membre');
    setIsAdding(false);
  };

  const sendInviteEmail = async (email: string, name: string) => {
      // 1. Check if EmailJS is configured
      if (settings?.emailJsServiceId && settings?.emailJsTemplateId && settings?.emailJsPublicKey) {
          setSendingEmail(true);
          try {
              // We trim the keys to avoid copy-paste whitespace errors
              await emailjs.send(
                  settings.emailJsServiceId.trim(),
                  settings.emailJsTemplateId.trim(),
                  {
                      to_name: name,
                      to_email: email,
                      invite_link: window.location.href, // Utilise l'URL actuelle du navigateur
                  },
                  settings.emailJsPublicKey.trim()
              );
              alert(`Invitation envoyée à ${name} via EmailJS !`);
          } catch (error: any) {
              console.error("Erreur EmailJS", error);
              
              // Extract meaningful error message logic
              let errorMessage = "Erreur inconnue";
              if (error && typeof error === 'object') {
                  // EmailJS often returns the error text in the 'text' property
                  errorMessage = error.text || error.message || JSON.stringify(error);
              }
              
              // Affichage de l'erreur sans ouvrir le client mail
              alert(`Erreur lors de l'envoi EmailJS : ${errorMessage}.\n\nVeuillez vérifier vos clés API dans les paramètres.`);
          } finally {
              setSendingEmail(false);
          }
      } else {
          // 2. Si EmailJS n'est pas configuré, on prévient l'utilisateur au lieu d'ouvrir une page externe
          alert("EmailJS n'est pas configuré. Impossible d'envoyer l'email automatiquement.\n\nVeuillez configurer les clés API dans les paramètres.");
      }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Membres de l'équipe
            </h2>
            <p className="text-sm text-slate-500 mt-1">Gérez les accès et les permissions des utilisateurs.</p>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium border border-indigo-100"
            >
              <UserPlus className="w-4 h-4" />
              {isAdding ? 'Fermer' : 'Inviter un membre'}
            </button>
          )}
        </div>

        {isAdding && isAdmin && (
          <div className="p-6 bg-slate-50 border-b border-slate-100 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Créer un nouveau profil</h3>
            <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Nom</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean Dupont"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Email (Obligatoire)</label>
                <input
                  type="email"
                  required
                  placeholder="ex: jean@fablab.com"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Rôle</label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                >
                  <option value="Admin">Admin</option>
                  <option value="Membre">Membre</option>
                  <option value="Stagiaire">Stagiaire</option>
                </select>
              </div>
              
              <div className="md:col-span-3 flex justify-end mt-2">
                 <button 
                  type="submit"
                  disabled={sendingEmail}
                  className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50"
                >
                  {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sendingEmail ? 'Envoi...' : 'Créer et Inviter'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Droit Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${member.avatarColor}`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{member.name}</div>
                        <div className="text-xs text-indigo-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${member.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                        member.role === 'Stagiaire' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                        'bg-blue-50 text-blue-700 border-blue-100'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <label className={`relative inline-flex items-center ${isAdmin && member.id !== currentUser.id ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={member.canManageStock}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (isAdmin && member.id !== currentUser.id) {
                             onUpdateMember(member.id, { canManageStock: e.target.checked });
                          }
                        }}
                        disabled={!isAdmin || member.id === currentUser.id}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className="ml-3 text-sm font-medium text-slate-600">
                        {member.canManageStock ? 'Autorisé' : 'Lecture seule'}
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {member.id === currentUser.id ? (
                       <span className="text-xs text-slate-300 italic px-2">Vous</span>
                    ) : isAdmin ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={() => sendInviteEmail(member.email, member.name)}
                            disabled={sendingEmail}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Renvoyer l'invitation par mail"
                        >
                            <Mail className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onEditMember && onEditMember(member)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier le profil"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteMember(member.id); }}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer l'utilisateur"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="p-2 text-slate-200 inline-block cursor-not-allowed" title="Droits administrateur requis">
                        <Lock className="w-4 h-4" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm">
        <Shield className="w-5 h-5 flex-shrink-0" />
        <div>
          <p className="font-semibold mb-1">À propos des permissions</p>
          <p>Seuls les <strong>Administrateurs</strong> peuvent modifier l'équipe. L'invitation nécessite la configuration d'EmailJS dans les paramètres.</p>
        </div>
      </div>
    </div>
  );
};

export default TeamList;
