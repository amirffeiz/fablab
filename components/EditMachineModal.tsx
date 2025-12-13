
import React, { useState, useEffect } from 'react';
import { Machine, MachineStatus } from '../types';
import { X, Save, Printer } from 'lucide-react';

interface EditMachineModalProps {
  isOpen: boolean;
  machine: Machine | null;
  onClose: () => void;
  onSave: (updatedMachine: Machine) => void;
}

const EditMachineModal: React.FC<EditMachineModalProps> = ({ isOpen, machine, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Machine>>({});

  useEffect(() => {
    if (machine) {
      setFormData({ ...machine });
    }
  }, [machine]);

  if (!isOpen || !machine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      onSave(formData as Machine);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            Modifier la machine
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
            <input 
              required type="text" 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
                <input 
                  required type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.model || ''} 
                  onChange={e => setFormData({...formData, model: e.target.value})} 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Emplacement</label>
                <input 
                  required type="text" 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={formData.location || ''} 
                  onChange={e => setFormData({...formData, location: e.target.value})} 
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de Série</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.serialNumber || ''} 
              onChange={e => setFormData({...formData, serialNumber: e.target.value})} 
            />
          </div>

           <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut Actuel</label>
              <select 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as MachineStatus})}
              >
                  {Object.values(MachineStatus).map(s => (
                      <option key={s} value={s}>{s}</option>
                  ))}
              </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Description</label>
            <textarea 
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
              value={formData.notes || ''} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
             <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 border border-transparent rounded-lg">Annuler</button>
             <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMachineModal;
