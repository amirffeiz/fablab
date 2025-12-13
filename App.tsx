
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import MachineList from './components/MachineList';
import MaintenancePanel from './components/MaintenancePanel';
import TeamList from './components/TeamList';
import AIAssistant from './components/AIAssistant';
import AddItemModal from './components/AddItemModal';
import EditItemModal from './components/EditItemModal';
import EditMachineModal from './components/EditMachineModal';
import EditMemberModal from './components/EditMemberModal';
import ItemHistoryModal from './components/ItemHistoryModal';
import ConfirmModal from './components/ConfirmModal';
import SettingsModal from './components/SettingsModal';
import LoginScreen from './components/LoginScreen';
import { InventoryItem, StockMovementType, StockHistoryEntry, TeamMember, Machine, MaintenanceTicket, MachineStatus } from './types';
import { useDataProvider } from './hooks/useDataProvider';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  
  const { 
    items, setItems, deleteItem,
    machines, setMachines, deleteMachine,
    maintenanceTickets, setMaintenanceTickets,
    teamMembers, setTeamMembers, deleteMember,
    isLoading, error, settings, updateSettings,
    uploadLocalData, downloadCloudData
  } = useDataProvider();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // States for Edit Modals
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- AUTHENTIFICATION EFFECT ---
  useEffect(() => {
    const checkAuth = async () => {
      setAuthLoading(true);

      // 1. Mode Supabase : Vérifier la session
      if (settings.mode === 'supabase' && settings.supabaseUrl && settings.supabaseKey) {
        try {
          const supabase = createClient(settings.supabaseUrl, settings.supabaseKey);
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user?.email) {
             // Si connecté via Supabase, on cherche le membre correspondant dans l'équipe
             // Note: teamMembers est chargé via useDataProvider. S'il n'est pas encore prêt, cela peut poser souci.
             // Dans une vraie app, on ferait un fetch spécifique ici.
             // Pour l'instant, on attend que useDataProvider charge (isLoading dans le render).
             const member = teamMembers.find(m => m.email.toLowerCase() === session.user.email?.toLowerCase());
             if (member) {
               setCurrentUser(member);
             } else {
               // Utilisateur authentifié mais pas dans la liste 'team'
               console.warn("Utilisateur connecté mais non trouvé dans l'équipe FabLab");
             }
          }
        } catch (e) {
          console.error("Auth check failed", e);
        }
      } 
      // 2. Mode Local : Pas de persistance de session "complexe" ici, on reste déconnecté au refresh pour sécurité
      // ou on pourrait utiliser localStorage pour se souvenir du dernier utilisateur.
      // Pour l'instant, on force la reconnexion au refresh pour plus de sécurité ("Seul lui voit son profil").
      
      setAuthLoading(false);
    };

    if (!isLoading) {
        checkAuth();
    }
  }, [settings.mode, settings.supabaseUrl, settings.supabaseKey, teamMembers, isLoading]);


  const handleLoginSuccess = (member: TeamMember) => {
    setCurrentUser(member);
  };

  const handleLogout = async () => {
    if (settings.mode === 'supabase' && settings.supabaseUrl && settings.supabaseKey) {
        const supabase = createClient(settings.supabaseUrl, settings.supabaseKey);
        await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };


  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    isDestructive: true
  });

  // --- LOGIQUE INVENTAIRE ---
  const createHistoryEntry = (type: StockMovementType, change: number, remaining: number, user: string): StockHistoryEntry => ({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    date: new Date().toISOString(),
    type, quantityChange: change, remainingQuantity: remaining, user
  });

  const handleUpdateQuantity = (id: string, delta: number) => {
    if (!currentUser?.canManageStock) { alert("Accès refusé"); return; }
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(0, item.quantity + delta);
        if (newQuantity === item.quantity) return item; 
        const historyEntry = createHistoryEntry(delta > 0 ? StockMovementType.ADDITION : StockMovementType.REMOVAL, delta, newQuantity, currentUser.name);
        return { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString().split('T')[0], history: [...item.history, historyEntry] };
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleUpdateItemDetails = (updatedItem: InventoryItem) => {
    const newItems = items.map(i => i.id === updatedItem.id ? updatedItem : i);
    setItems(newItems);
  };

  const handleAddItem = (newItemData: Omit<InventoryItem, 'id' | 'lastUpdated' | 'history'>) => {
    if (!currentUser) return;
    const historyEntry = createHistoryEntry(StockMovementType.CREATION, newItemData.quantity, newItemData.quantity, currentUser.name);
    const newItem: InventoryItem = { ...newItemData, id: Date.now().toString(), lastUpdated: new Date().toISOString().split('T')[0], history: [historyEntry] };
    setItems([newItem, ...items]);
  };

  // --- LOGIQUE MACHINES ---
  const handleAddMachine = (newMachine: Omit<Machine, 'id'>) => {
      const m: Machine = { ...newMachine, id: 'm' + Date.now().toString() };
      setMachines([...machines, m]);
  };

  const handleUpdateMachineDetails = (updatedMachine: Machine) => {
      const newMachines = machines.map(m => m.id === updatedMachine.id ? updatedMachine : m);
      setMachines(newMachines);
  };

  const handleDeleteMachine = (id: string) => {
      if (!currentUser?.canManageStock) return;
      setConfirmModal({
        isOpen: true, title: "Supprimer la machine", message: "Confirmation requise.", 
        onConfirm: () => deleteMachine(id, machines.filter(m => m.id !== id)), isDestructive: true
      });
  };

  const handleRequestMaintenance = (machineId: string) => {
      setCurrentView('maintenance');
  };

  // --- LOGIQUE MAINTENANCE ---
  const handleAddTicket = (t: Omit<MaintenanceTicket, 'id' | 'dateCreated' | 'status'>) => {
      const newTicket: MaintenanceTicket = {
          ...t,
          id: 'mt' + Date.now(),
          dateCreated: new Date().toISOString(),
          status: 'Open'
      };
      setMaintenanceTickets([newTicket, ...maintenanceTickets]);
      const updatedMachines = machines.map(m => m.id === t.machineId ? { ...m, status: MachineStatus.MAINTENANCE_REQ } : m);
      setMachines(updatedMachines);
  };

  const handleUpdateTicket = (id: string, updates: Partial<MaintenanceTicket>) => {
      const updatedTickets = maintenanceTickets.map(t => t.id === id ? { ...t, ...updates } : t);
      setMaintenanceTickets(updatedTickets);
      if (updates.status === 'Done') {
          const ticket = maintenanceTickets.find(t => t.id === id);
          if (ticket) {
              const updatedMachines = machines.map(m => 
                  m.id === ticket.machineId 
                      ? { ...m, status: MachineStatus.OPERATIONAL } 
                      : m
              );
              setMachines(updatedMachines);
          }
      }
  };

  // --- LOGIQUE EQUIPE ---
  const handleAddMember = (m: Omit<TeamMember, 'id'>) => setTeamMembers([...teamMembers, { ...m, id: 'u' + Date.now() }]);
  const handleUpdateMember = (id: string, upd: Partial<TeamMember>) => setTeamMembers(teamMembers.map(m => m.id === id ? { ...m, ...upd } : m));
  
  const handleUpdateMemberDetails = (updatedMember: TeamMember) => {
      const newMembers = teamMembers.map(m => m.id === updatedMember.id ? updatedMember : m);
      setTeamMembers(newMembers);
  };

  const handleDeleteMember = (id: string) => {
     setConfirmModal({
        isOpen: true, title: "Supprimer membre", message: "Confirmer ?",
        onConfirm: () => deleteMember(id, teamMembers.filter(m => m.id !== id)), isDestructive: true
     });
  };

  // --- RENDER ---
  if (isLoading || (authLoading && !currentUser && settings.mode === 'supabase')) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin w-10 h-10 text-indigo-600" /></div>;
  }

  // SI NON CONNECTÉ -> Afficher LoginScreen
  if (!currentUser) {
      return (
          <>
            <LoginScreen 
                settings={settings}
                teamMembers={teamMembers}
                onLoginSuccess={handleLoginSuccess}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
            />
             <SettingsModal 
                isOpen={isSettingsModalOpen} 
                onClose={() => setIsSettingsModalOpen(false)} 
                settings={settings} 
                onSave={updateSettings} 
                onUpload={uploadLocalData}
                onDownload={downloadCloudData}
            />
          </>
      );
  }

  // SI CONNECTÉ -> Afficher l'App
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        currentView={currentView} onChangeView={setCurrentView} 
        currentUser={currentUser} 
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />
      
      <main className="flex-1 ml-64 p-8 h-screen overflow-hidden flex flex-col">
        {error && <div className="mb-4 bg-red-50 p-3 rounded text-red-700 flex gap-2"><AlertCircle />{error}</div>}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
                {currentView === 'dashboard' && 'Tableau de Bord'}
                {currentView === 'inventory' && 'Inventaire Consommables'}
                {currentView === 'machines' && 'Parc Machines'}
                {currentView === 'maintenance' && 'Maintenance'}
                {currentView === 'team' && 'Équipe'}
                {currentView === 'assistant' && 'Assistant IA'}
            </h1>
            <p className="text-sm text-slate-500">FabLab Manager • {currentUser.name}</p>
          </div>

          {currentView === 'inventory' && currentUser.canManageStock && (
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-lg">
              <Plus className="w-5 h-5" /> <span>Article</span>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {currentView === 'dashboard' && <Dashboard items={items} />}
            {currentView === 'inventory' && (
                <InventoryList 
                    items={items} onUpdateQuantity={handleUpdateQuantity} 
                    onDeleteItem={(id) => {
                        setConfirmModal({
                            isOpen: true, title: "Supprimer", message: "Irréversible.", 
                            onConfirm: () => deleteItem(id, items.filter(i => i.id !== id)), isDestructive: true
                        })
                    }} 
                    onViewHistory={setHistoryItem} 
                    onEditItem={setEditingItem}
                    currentUser={currentUser}
                />
            )}
            {currentView === 'machines' && (
                <MachineList 
                    machines={machines} onAddMachine={handleAddMachine} 
                    onDeleteMachine={handleDeleteMachine} 
                    onRequestMaintenance={handleRequestMaintenance}
                    onEditMachine={setEditingMachine}
                    currentUser={currentUser}
                />
            )}
            {currentView === 'maintenance' && (
                <MaintenancePanel 
                    tickets={maintenanceTickets} machines={machines} teamMembers={teamMembers}
                    onAddTicket={handleAddTicket} onUpdateTicket={handleUpdateTicket}
                    currentUser={currentUser}
                />
            )}
            {currentView === 'team' && (
                <TeamList 
                  members={teamMembers} 
                  onAddMember={handleAddMember} 
                  onUpdateMember={handleUpdateMember} 
                  onDeleteMember={handleDeleteMember} 
                  onEditMember={setEditingMember}
                  currentUser={currentUser}
                  settings={settings}
                />
            )}
            {currentView === 'assistant' && <AIAssistant inventory={items} />}
        </div>
      </main>

      {/* Modals */}
      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddItem} />
      
      <EditItemModal 
        isOpen={!!editingItem} 
        item={editingItem} 
        onClose={() => setEditingItem(null)} 
        onSave={handleUpdateItemDetails} 
      />

      <EditMachineModal
        isOpen={!!editingMachine}
        machine={editingMachine}
        onClose={() => setEditingMachine(null)}
        onSave={handleUpdateMachineDetails}
      />

      <EditMemberModal
        isOpen={!!editingMember}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSave={handleUpdateMemberDetails}
      />

      <ItemHistoryModal isOpen={!!historyItem} item={historyItem} onClose={() => setHistoryItem(null)} />
      <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} isDestructive={confirmModal.isDestructive} />
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        settings={settings} 
        onSave={updateSettings} 
        onUpload={uploadLocalData}
        onDownload={downloadCloudData}
      />
    </div>
  );
};

export default App;
