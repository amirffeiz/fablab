
import React, { useState } from 'react';
import { MaintenanceTicket, Machine, MaintenanceType, TeamMember } from '../types';
import { Wrench, Plus, Calendar, User, FileText, CheckCircle2, Clock, PlayCircle, Filter, X } from 'lucide-react';

interface MaintenancePanelProps {
  tickets: MaintenanceTicket[];
  machines: Machine[];
  teamMembers: TeamMember[];
  onAddTicket: (t: Omit<MaintenanceTicket, 'id' | 'dateCreated' | 'status'>) => void;
  onUpdateTicket: (id: string, updates: Partial<MaintenanceTicket>) => void;
  currentUser: TeamMember;
}

const MaintenancePanel: React.FC<MaintenancePanelProps> = ({ tickets, machines, teamMembers, onAddTicket, onUpdateTicket, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'In Progress' | 'Done'>('All');
  
  // New Ticket Form State
  const [formData, setFormData] = useState({
    machineId: '',
    type: MaintenanceType.CORRECTIVE,
    description: '',
    assignedToId: '',
    partsUsed: ''
  });

  // Closure Report State
  const [closeTicketId, setCloseTicketId] = useState<string | null>(null);
  const [closureReport, setClosureReport] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Done': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Open': return <Clock className="w-3 h-3" />;
        case 'In Progress': return <PlayCircle className="w-3 h-3" />;
        case 'Done': return <CheckCircle2 className="w-3 h-3" />;
    }
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = machines.find(m => m.id === formData.machineId);
    if (!machine) return;

    onAddTicket({
        machineId: formData.machineId,
        machineName: machine.name,
        type: formData.type,
        description: formData.description,
        assignedToId: formData.assignedToId || undefined,
        partsUsed: formData.partsUsed
    });
    setIsModalOpen(false);
    // Reset form
    setFormData({ machineId: '', type: MaintenanceType.CORRECTIVE, description: '', assignedToId: '', partsUsed: '' });
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (closeTicketId) {
          onUpdateTicket(closeTicketId, {
              status: 'Done',
              resolutionDate: new Date().toISOString(),
              notes: closureReport,
              performedBy: currentUser.name
          });
          setCloseTicketId(null);
          setClosureReport('');
      }
  };

  const filteredTickets = tickets.filter(t => filterStatus === 'All' || t.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
             <Wrench className="w-6 h-6 text-indigo-600" />
             Maintenance
           </h2>
           <p className="text-slate-500 text-sm">Suivi des interventions préventives et correctives.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-transparent text-sm text-slate-600 outline-none"
                >
                    <option value="All">Tous les tickets</option>
                    <option value="Open">Ouverts</option>
                    <option value="In Progress">En cours</option>
                    <option value="Done">Terminés</option>
                </select>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Ticket</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Machine</th>
                        <th className="px-6 py-4">Type & Description</th>
                        <th className="px-6 py-4">Assigné à</th>
                        <th className="px-6 py-4">Pièces / Détails</th>
                        <th className="px-6 py-4">Statut</th>
                        <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredTickets.map(ticket => {
                        const assignedUser = teamMembers.find(u => u.id === ticket.assignedToId);
                        return (
                            <tr key={ticket.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-800">
                                    {ticket.machineName}
                                    <div className="text-xs text-slate-400 font-normal mt-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(ticket.dateCreated).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                    <div className="font-semibold text-slate-700 mb-1">{ticket.type}</div>
                                    <p className="truncate text-slate-500" title={ticket.description}>{ticket.description}</p>
                                    {ticket.notes && (
                                        <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100" title={ticket.notes}>
                                            <span className="font-bold block mb-0.5">Rapport:</span> 
                                            <span className="line-clamp-2">{ticket.notes}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {assignedUser ? (
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full text-[10px] flex items-center justify-center text-white ${assignedUser.avatarColor}`}>
                                                {assignedUser.name.charAt(0)}
                                            </div>
                                            <span className="truncate max-w-[100px]">{assignedUser.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 italic">Non assigné</span>
                                    )}
                                    {ticket.performedBy && ticket.status === 'Done' && (
                                        <div className="text-xs text-slate-400 mt-1">
                                            Fait par: {ticket.performedBy}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                     {ticket.partsUsed ? (
                                         <div className="flex items-center gap-1 text-slate-600" title={ticket.partsUsed}>
                                            <FileText className="w-3 h-3" />
                                            <span className="truncate max-w-[150px]">{ticket.partsUsed}</span>
                                         </div>
                                     ) : <span className="text-slate-300">-</span>}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(ticket.status)}`}>
                                        {getStatusIcon(ticket.status)}
                                        {ticket.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {ticket.status !== 'Done' && (
                                        <button 
                                            onClick={() => {
                                                if (ticket.status === 'Open') {
                                                    onUpdateTicket(ticket.id, { status: 'In Progress' });
                                                } else {
                                                    setCloseTicketId(ticket.id);
                                                    setClosureReport('');
                                                }
                                            }}
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline px-3 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                        >
                                            {ticket.status === 'Open' ? 'Commencer' : 'Terminer'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {filteredTickets.length === 0 && (
                <div className="p-8 text-center text-slate-400">Aucun ticket de maintenance trouvé.</div>
            )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-lg font-bold text-slate-800">Déclarer une maintenance</h3>
                      <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Machine concernée</label>
                          <select 
                             required 
                             className="w-full px-3 py-2 border rounded-lg bg-white"
                             value={formData.machineId}
                             onChange={e => setFormData({...formData, machineId: e.target.value})}
                          >
                              <option value="">Sélectionner une machine...</option>
                              {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                              <select 
                                  className="w-full px-3 py-2 border rounded-lg bg-white"
                                  value={formData.type}
                                  onChange={e => setFormData({...formData, type: e.target.value as MaintenanceType})}
                              >
                                  {Object.values(MaintenanceType).map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Assigner à</label>
                              <select 
                                  className="w-full px-3 py-2 border rounded-lg bg-white"
                                  value={formData.assignedToId}
                                  onChange={e => setFormData({...formData, assignedToId: e.target.value})}
                              >
                                  <option value="">-- Personne --</option>
                                  {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Description du problème</label>
                          <textarea 
                              required
                              rows={3}
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="Décrivez la panne ou la tâche à effectuer..."
                              value={formData.description}
                              onChange={e => setFormData({...formData, description: e.target.value})}
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Pièces à utiliser / réparer</label>
                          <input 
                              type="text"
                              className="w-full px-3 py-2 border rounded-lg"
                              placeholder="ex: Courroie GT2, Buse 0.4mm..."
                              value={formData.partsUsed}
                              onChange={e => setFormData({...formData, partsUsed: e.target.value})}
                          />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                          <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Annuler</button>
                          <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">Créer Ticket</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Close Ticket Modal */}
      {closeTicketId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-800">Clôturer l'intervention</h3>
                    <button onClick={() => setCloseTicketId(null)}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleCloseSubmit} className="p-6 space-y-4">
                    <div>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-700 mb-4">
                            Veuillez résumer les actions effectuées pour résoudre ce problème.
                        </div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Rapport d'intervention</label>
                        <textarea 
                            required
                            autoFocus
                            rows={5}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                            placeholder="Ex: Remplacement du ventilateur hotend, calibration du PID..."
                            value={closureReport}
                            onChange={e => setClosureReport(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={() => setCloseTicketId(null)} 
                            className="px-4 py-2 text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg transition-colors"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg shadow-emerald-100 font-medium transition-colors flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Terminer et Fermer
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePanel;
