
import React, { useState } from 'react';
import { Machine, MachineStatus, TeamMember } from '../types';
import { Printer, AlertTriangle, CheckCircle, PenTool, Plus, X, Search, Pencil } from 'lucide-react';

interface MachineListProps {
  machines: Machine[];
  onAddMachine: (m: Omit<Machine, 'id'>) => void;
  onDeleteMachine: (id: string) => void;
  onRequestMaintenance: (machineId: string) => void;
  onEditMachine?: (machine: Machine) => void;
  currentUser: TeamMember;
}

const MachineList: React.FC<MachineListProps> = ({ machines, onAddMachine, onDeleteMachine, onRequestMaintenance, onEditMachine, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [newMachine, setNewMachine] = useState<Partial<Machine>>({
    status: MachineStatus.OPERATIONAL,
    location: ''
  });

  const filteredMachines = machines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.OPERATIONAL: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case MachineStatus.MAINTENANCE_REQ: return 'bg-amber-100 text-amber-800 border-amber-200';
      case MachineStatus.IN_MAINTENANCE: return 'bg-blue-100 text-blue-800 border-blue-200';
      case MachineStatus.BROKEN: return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.OPERATIONAL: return <CheckCircle className="w-4 h-4" />;
      case MachineStatus.MAINTENANCE_REQ: return <AlertTriangle className="w-4 h-4" />;
      case MachineStatus.IN_MAINTENANCE: return <PenTool className="w-4 h-4" />;
      case MachineStatus.BROKEN: return <X className="w-4 h-4" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMachine.name || !newMachine.model) return;
    onAddMachine({
      name: newMachine.name,
      model: newMachine.model,
      status: newMachine.status || MachineStatus.OPERATIONAL,
      location: newMachine.location || 'Atelier',
      serialNumber: newMachine.serialNumber
    });
    setIsModalOpen(false);
    setNewMachine({ status: MachineStatus.OPERATIONAL, location: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <Printer className="w-6 h-6 text-indigo-600" />
             Parc Machines
           </h2>
           <p className="text-slate-500 text-sm">Gestion des équipements et suivi d'état.</p>
        </div>
        
        <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Rechercher une machine..." 
                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {currentUser.canManageStock && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter</span>
              </button>
            )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map(machine => (
          <div key={machine.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-lg ${machine.status === MachineStatus.OPERATIONAL ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'}`}>
                   <Printer className="w-8 h-8" />
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(machine.status)}`}>
                      {getStatusIcon(machine.status)}
                      {machine.status}
                    </span>
                    {currentUser.canManageStock && (
                        <button 
                            onClick={() => onEditMachine && onEditMachine(machine)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    )}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800">{machine.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{machine.model}</p>
              
              <div className="space-y-2 text-sm text-slate-600 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-400">Emplacement:</span>
                  <span className="font-medium">{machine.location}</span>
                </div>
                {machine.serialNumber && (
                   <div className="flex justify-between">
                    <span className="text-slate-400">S/N:</span>
                    <span className="font-mono text-xs">{machine.serialNumber}</span>
                  </div>
                )}
                 {machine.notes && (
                   <div className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                    {machine.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button 
                  onClick={() => onRequestMaintenance(machine.id)}
                  className="flex-1 py-2 px-3 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <PenTool className="w-4 h-4" />
                  Maintenance
                </button>
                {currentUser.canManageStock && (
                  <button 
                    onClick={() => onDeleteMachine(machine.id)}
                    className="p-2 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors shadow-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">Ajouter une machine</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg" value={newMachine.name || ''} onChange={e => setNewMachine({...newMachine, name: e.target.value})} placeholder="ex: Imprimante 3D #1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
                    <input required type="text" className="w-full px-3 py-2 border rounded-lg" value={newMachine.model || ''} onChange={e => setNewMachine({...newMachine, model: e.target.value})} placeholder="ex: MK3S" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Emplacement</label>
                    <input required type="text" className="w-full px-3 py-2 border rounded-lg" value={newMachine.location || ''} onChange={e => setNewMachine({...newMachine, location: e.target.value})} />
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de Série</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" value={newMachine.serialNumber || ''} onChange={e => setNewMachine({...newMachine, serialNumber: e.target.value})} />
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
                 <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineList;
