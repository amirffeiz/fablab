import React from 'react';
import { InventoryItem, StockMovementType } from '../types';
import { X, Calendar, ArrowUpRight, ArrowDownLeft, Box } from 'lucide-react';

interface ItemHistoryModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const ItemHistoryModal: React.FC<ItemHistoryModalProps> = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item) return null;

  // Sort history by date descending
  const sortedHistory = [...item.history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementIcon = (type: StockMovementType) => {
    switch (type) {
      case StockMovementType.ADDITION:
        return <ArrowUpRight className="w-4 h-4 text-emerald-600" />;
      case StockMovementType.REMOVAL:
        return <ArrowDownLeft className="w-4 h-4 text-rose-600" />;
      case StockMovementType.CREATION:
        return <Box className="w-4 h-4 text-indigo-600" />;
      default:
        return <Box className="w-4 h-4 text-slate-600" />;
    }
  };

  const getMovementColor = (type: StockMovementType) => {
    switch (type) {
      case StockMovementType.ADDITION: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case StockMovementType.REMOVAL: return 'bg-rose-50 text-rose-700 border-rose-100';
      case StockMovementType.CREATION: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Historique des mouvements
            </h2>
            <div className="mt-1 text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{item.name}</span> • Stock actuel : {item.quantity}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200"></div>

            <div className="space-y-6">
              {sortedHistory.map((entry) => (
                <div key={entry.id} className="relative flex gap-6 group">
                  {/* Timeline dot */}
                  <div className={`absolute left-6 -translate-x-1/2 mt-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 
                    ${entry.type === StockMovementType.ADDITION ? 'bg-emerald-500' : 
                      entry.type === StockMovementType.REMOVAL ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                  />

                  <div className="flex-1 bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getMovementColor(entry.type)}`}>
                          {getMovementIcon(entry.type)}
                          {entry.type}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        Par: {entry.user}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-slate-600">
                        {entry.type === StockMovementType.CREATION ? (
                          "Stock initial créé"
                        ) : (
                           <span>
                             Variation de <span className="font-mono font-medium text-slate-900">{entry.quantityChange > 0 ? '+' : ''}{entry.quantityChange}</span>
                           </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-800 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        Stock: {entry.remainingQuantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {sortedHistory.length === 0 && (
                <div className="text-center py-10 text-slate-400 italic">
                    Aucun historique disponible pour cet article.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemHistoryModal;
