
import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types';
import { X, Save, UserCog, Mail } from 'lucide-react';

interface EditMemberModalProps {
  isOpen: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSave: (updatedMember: TeamMember) => void;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({ isOpen, member, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<TeamMember>>({});

  useEffect(() => {
    if (member) {
      setFormData({ ...member });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id && formData.name && formData.email) {
      onSave(formData as TeamMember);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-indigo-600" />
            Modifier le profil
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
            <input 
              required type="text" 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
              <Mail className="w-3 h-3" /> Email (Obligatoire)
            </label>
            <input 
              required
              type="email" 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.email || ''} 
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="Ex: membre@fablab.com" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
            <select
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
            >
                <option value="Admin">Admin</option>
                <option value="Membre">Membre</option>
                <option value="Stagiaire">Stagiaire</option>
            </select>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
             <input 
                type="checkbox" 
                id="canManageStock"
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                checked={formData.canManageStock}
                onChange={(e) => setFormData({...formData, canManageStock: e.target.checked})}
             />
             <label htmlFor="canManageStock" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                Autoriser la gestion du stock (Ajout/Retrait)
             </label>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
             <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 border border-transparent rounded-lg">Annuler</button>
             <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md flex items-center gap-2">
                <Save className="w-4 h-4" />
                Enregistrer
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberModal;
