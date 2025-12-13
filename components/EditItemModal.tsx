
import React, { useState, useEffect } from 'react';
import { InventoryItem, Category } from '../types';
import { X, Save } from 'lucide-react';

interface EditItemModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (updatedItem: InventoryItem) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({ isOpen, item, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});

  useEffect(() => {
    if (item) {
      setFormData({ ...item });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id) {
      onSave(formData as InventoryItem);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
          <h2 className="text-xl font-bold text-slate-800">Modifier l'article</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nom de l'article</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Catégorie</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
                >
                  {Object.values(Category).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <textarea 
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Quantité</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                  value={formData.quantity}
                  disabled // Quantity managed via movement buttons usually, but can be enabled if needed. Keeping disabled to force history tracking via main view, or enable if instant adjust needed.
                  title="Utilisez les boutons + et - dans la liste pour ajuster le stock et créer un historique."
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Min. Alert</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.minQuantity}
                  onChange={(e) => setFormData({...formData, minQuantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Prix Unit (€)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({...formData, pricePerUnit: parseFloat(e.target.value) || 0})}
                />
              </div>
               <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Emplacement</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-900/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal;
