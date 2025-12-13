import React, { useState } from 'react';
import { InventoryItem, Category } from '../types';
import { analyzeItemText } from '../services/geminiService';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'history'>) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [smartInput, setSmartInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: Category.OTHER,
    quantity: 1,
    minQuantity: 5,
    location: '',
    pricePerUnit: 0
  });

  if (!isOpen) return null;

  const handleSmartAnalyze = async () => {
    if (!smartInput.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeItemText(smartInput);
      if (result) {
        setFormData({
          name: result.name || '',
          description: result.description || '',
          category: (result.category as Category) || Category.OTHER,
          quantity: result.suggestedQuantity || 1,
          minQuantity: result.suggestedMinQuantity || 5,
          location: result.locationSuggestion || 'Zone de réception',
          pricePerUnit: result.estimatedPrice || 0
        });
      }
    } catch (error) {
      console.error("Analysis failed", error);
      alert("L'IA n'a pas pu analyser le texte. Vérifiez votre clé API ou réessayez.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
    // Reset form
    setFormData({
        name: '',
        description: '',
        category: Category.OTHER,
        quantity: 1,
        minQuantity: 5,
        location: '',
        pricePerUnit: 0
    });
    setSmartInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur">
          <h2 className="text-xl font-bold text-slate-800">Ajouter un article</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* AI Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-indigo-900">Remplissage Intelligent (IA)</h3>
            </div>
            <div className="flex gap-3">
              <input 
                type="text" 
                placeholder="Ex: '3 bobines de PLA Rouge pour l'imprimante 3D, étagère B'"
                className="flex-1 px-4 py-2 rounded-lg border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={smartInput}
                onChange={(e) => setSmartInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSmartAnalyze()}
              />
              <button 
                onClick={handleSmartAnalyze}
                disabled={isAnalyzing || !smartInput}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyser'}
              </button>
            </div>
            <p className="text-xs text-indigo-400 mt-2">Décrivez simplement l'article, l'IA détectera la catégorie, la quantité et l'emplacement.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Nom de l'article</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Catégorie</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Quantité</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Min. Alert</label>
                <input 
                  type="number" 
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({...formData, pricePerUnit: parseFloat(e.target.value) || 0})}
                />
              </div>
               <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Emplacement</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
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
                Ajouter au stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;