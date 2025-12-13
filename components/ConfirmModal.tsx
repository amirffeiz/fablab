import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, onConfirm, onClose, isDestructive = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-white rounded-lg font-medium text-sm shadow-sm transition-colors ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-100' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
