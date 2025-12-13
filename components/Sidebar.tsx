
import React from 'react';
import { LayoutDashboard, Package, Bot, Users, UserCircle, Settings, Printer, Wrench, LogOut } from 'lucide-react';
import { TeamMember } from '../types';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  currentUser: TeamMember;
  onLogout: () => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, currentUser, onLogout, onOpenSettings }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventaire (Stock)', icon: Package },
    { id: 'machines', label: 'Machines', icon: Printer },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'team', label: 'Équipe', icon: Users },
    { id: 'assistant', label: 'Assistant IA', icon: Bot },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300 fixed left-0 top-0 border-r border-slate-800 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-lg font-mono">F</span>
          FabStock
        </h1>
        <p className="text-xs text-slate-500 mt-2 ml-1">v2.2.0 • Production</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="mb-4 flex items-center justify-between">
             <p className="text-xs uppercase font-bold text-slate-500 px-2">Compte Actif</p>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 min-w-0 flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${currentUser.avatarColor}`}>
                    {currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden min-w-0">
                    <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser.role}</p>
                </div>
            </div>
            
            {currentUser.role === 'Admin' && (
                <button 
                    onClick={onOpenSettings}
                    className="flex-shrink-0 p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors"
                    title="Paramètres de l'application"
                >
                    <Settings className="w-5 h-5" />
                </button>
            )}
        </div>

        <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors border border-transparent hover:border-red-900/20"
        >
            <LogOut className="w-3 h-3" />
            Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
