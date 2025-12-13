
import React, { useState, useMemo } from 'react';
import { InventoryItem, Category, StockStatus, TeamMember } from '../types';
import { Search, Filter, Plus, Minus, AlertTriangle, CheckCircle, PackageX, History, Trash2, Lock, Pencil } from 'lucide-react';

interface InventoryListProps {
  items: InventoryItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onDeleteItem: (id: string) => void;
  onViewHistory: (item: InventoryItem) => void;
  onEditItem?: (item: InventoryItem) => void;
  currentUser: TeamMember;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, onUpdateQuantity, onDeleteItem, onViewHistory, onEditItem, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchTerm, selectedCategory]);

  const getStatus = (item: InventoryItem): StockStatus => {
    if (item.quantity === 0) return StockStatus.OUT_OF_STOCK;
    if (item.quantity <= item.minQuantity) return StockStatus.LOW_STOCK;
    return StockStatus.IN_STOCK;
  };

  const getStatusColor = (status: StockStatus) => {
    switch (status) {
      case StockStatus.IN_STOCK: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case StockStatus.LOW_STOCK: return 'bg-amber-100 text-amber-800 border-amber-200';
      case StockStatus.OUT_OF_STOCK: return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: StockStatus) => {
    switch (status) {
      case StockStatus.IN_STOCK: return <CheckCircle className="w-4 h-4 mr-1" />;
      case StockStatus.LOW_STOCK: return <AlertTriangle className="w-4 h-4 mr-1" />;
      case StockStatus.OUT_OF_STOCK: return <PackageX className="w-4 h-4 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      {/* Header & Filters */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800">Inventaire</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select 
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white w-full sm:w-48"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
              >
                <option value="All">Toutes catégories</option>
                {Object.values(Category).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4">Nom</th>
              <th className="px-6 py-4">Catégorie</th>
              <th className="px-6 py-4">Emplacement</th>
              <th className="px-6 py-4 text-center">Quantité</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const status = getStatus(item);
                const canManage = currentUser.canManageStock;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td 
                      className={`px-6 py-4 ${canManage ? 'cursor-pointer' : ''}`}
                      onClick={() => canManage && onEditItem && onEditItem(item)}
                      title={canManage ? "Cliquer pour modifier" : ""}
                    >
                      <div className="font-medium text-slate-900 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                        {item.name}
                        {canManage && <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50" />}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{item.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.location}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, -1); }}
                          disabled={item.quantity <= 0 || !canManage}
                          className={`p-1 rounded-md transition-colors ${canManage ? 'hover:bg-slate-200 text-slate-500' : 'opacity-20 cursor-not-allowed text-slate-300'}`}
                          title={!canManage ? "Permissions insuffisantes" : "Retirer 1"}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-medium w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, 1); }}
                          disabled={!canManage}
                          className={`p-1 rounded-md transition-colors ${canManage ? 'hover:bg-slate-200 text-slate-500' : 'opacity-20 cursor-not-allowed text-slate-300'}`}
                          title={!canManage ? "Permissions insuffisantes" : "Ajouter 1"}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button
                           onClick={(e) => { e.stopPropagation(); onViewHistory(item); }}
                           className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                           title="Historique des mouvements"
                         >
                           <History className="w-4 h-4" />
                         </button>
                         
                         {canManage ? (
                           <>
                            <button
                                onClick={(e) => { e.stopPropagation(); onEditItem && onEditItem(item); }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Modifier l'article"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                             <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer l'article"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                           </>
                         ) : (
                           <button 
                             className="p-1.5 text-slate-200 cursor-not-allowed" 
                             title="Lecture seule"
                           >
                             <Lock className="w-4 h-4" />
                           </button>
                         )}
                       </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  Aucun élément trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryList;
