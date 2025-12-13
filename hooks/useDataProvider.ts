
import React, { useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InventoryItem, TeamMember, AppSettings, Machine, MaintenanceTicket } from '../types';
import { INITIAL_INVENTORY, INITIAL_TEAM, INITIAL_MACHINES, INITIAL_MAINTENANCE } from '../services/mockData';

const SETTINGS_KEY = 'fabstock_settings';

const DEFAULT_SETTINGS: AppSettings = {
  mode: 'local',
  supabaseUrl: '',
  supabaseKey: '',
  emailJsServiceId: '',
  emailJsTemplateId: '',
  emailJsPublicKey: ''
};

export function useDataProvider() {
  // --- States ---
  const [settings, setSettings] = useState<AppSettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const stored = window.localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

  // --- Initialization & Fetch ---
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      setError(null);

      let client: SupabaseClient | null = null;
      if (settings.mode === 'supabase' && settings.supabaseUrl && settings.supabaseKey) {
        try {
          client = createClient(settings.supabaseUrl, settings.supabaseKey);
          setSupabase(client);
        } catch (e) {
          console.error("Invalid Supabase config", e);
          setError("Configuration Supabase invalide.");
        }
      } else {
        setSupabase(null);
      }

      if (settings.mode === 'supabase' && client) {
        try {
            const fetchData = async (table: string) => {
                const { data, error } = await client!.from(table).select('*');
                if (error) throw error;
                const parsed = data?.map((row: any) => row.data) || [];
                return parsed; 
            };

            // Fetch initial data
            const [fetchedItems, fetchedMachines, fetchedTickets, fetchedTeam] = await Promise.all([
                fetchData('inventory'),
                fetchData('machines'),
                fetchData('maintenance'),
                fetchData('team')
            ]);

            setItems(fetchedItems);
            setMachines(fetchedMachines);
            setMaintenanceTickets(fetchedTickets);
            setTeamMembers(fetchedTeam);

        } catch (err: any) {
          console.error("Supabase Load Error", err);
          setError(`Erreur de connexion: ${err.message}`);
          // Fallback empty or local? Let's keep empty on error to avoid confusion, or handle gracefully.
          // For now, keep state as is or empty.
        }
      } else {
        // Mode LocalStorage
        try {
          const loadLocal = (key: string, fallback: any) => {
              const stored = window.localStorage.getItem(key);
              return stored ? JSON.parse(stored) : fallback;
          };

          setItems(loadLocal('fabstock_inventory', INITIAL_INVENTORY));
          setMachines(loadLocal('fabstock_machines', INITIAL_MACHINES));
          setMaintenanceTickets(loadLocal('fabstock_maintenance', INITIAL_MAINTENANCE));
          setTeamMembers(loadLocal('fabstock_team', INITIAL_TEAM));
        } catch (e) {
          console.error("Local Load Error", e);
          setItems(INITIAL_INVENTORY);
        }
      }
      setIsLoading(false);
    };

    initData();
  }, [settings.mode, settings.supabaseUrl, settings.supabaseKey]); // Re-run when connection settings change

  // --- Supabase Realtime Subscription ---
  useEffect(() => {
    if (settings.mode !== 'supabase' || !supabase) return;

    // Helper to reload a specific table when a change event occurs
    const reloadTable = async (table: string, setter: React.Dispatch<any>) => {
       const { data } = await supabase.from(table).select('*');
       if (data) {
           setter(data.map((row: any) => row.data));
       }
    };

    // Subscribe to all changes on our tables
    const channel = supabase.channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => reloadTable('inventory', setItems))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'machines' }, () => reloadTable('machines', setMachines))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance' }, () => reloadTable('maintenance', setMaintenanceTickets))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'team' }, () => reloadTable('team', setTeamMembers))
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [supabase, settings.mode]);


  // --- CRUD Operations Wrappers ---

  const updateSettings = (newSettings: AppSettings) => {
    // Merge new settings with existing to prevent data loss if newSettings is partial
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  };

  const persistData = async <T extends { id: string }>(
    data: T[], 
    setter: React.Dispatch<React.SetStateAction<T[]>>, 
    tableName: string, 
    storageKey: string
  ) => {
    setter(data); // Optimistic UI
    if (settings.mode === 'supabase' && supabase) {
      try {
          // In Supabase mode, we upsert entire array (inefficient but simple for JSON store pattern) 
          // OR better: we upsert only the changed item. 
          // Current architecture passes the WHOLE new array 'data'.
          // To make it efficient with Realtime, we should ideally upsert only the modified item.
          // BUT, 'data' is the full array.
          // For this specific request "ce soit les données du serveur supabase qui soient récupérées", 
          // The Realtime subscription handles the "Get from server" part.
          // The persistData handles the "Send to server" part.
          
          // Strategy: Upsert all items in the array.
          const upserts = data.map(item => ({ id: item.id, data: item }));
          const { error } = await supabase.from(tableName).upsert(upserts);
          if (error) console.error("Supabase upsert error", error);
      } catch (e) { console.error(e); }
    } else {
      window.localStorage.setItem(storageKey, JSON.stringify(data));
    }
  };

  const deleteData = async <T extends { id: string }>(
    id: string,
    currentData: T[],
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    tableName: string,
    storageKey: string
  ) => {
      const newData = currentData.filter(i => i.id !== id);
      setter(newData);
      if (settings.mode === 'supabase' && supabase) {
          await supabase.from(tableName).delete().eq('id', id);
      } else {
          window.localStorage.setItem(storageKey, JSON.stringify(newData));
      }
  };

  const uploadLocalData = async (targetSettings: AppSettings) => {
      if (!targetSettings.supabaseUrl || !targetSettings.supabaseKey) {
          throw new Error("URL ou Clé API manquante");
      }
      const client = createClient(targetSettings.supabaseUrl, targetSettings.supabaseKey);
      
      const push = async (table: string, data: any[]) => {
          if (!data || data.length === 0) return;
          const rows = data.map(d => ({ id: d.id, data: d }));
          const { error } = await client.from(table).upsert(rows);
          if (error) throw error;
      };

      await push('inventory', items);
      await push('machines', machines);
      await push('maintenance', maintenanceTickets);
      await push('team', teamMembers);
  };

  const downloadCloudData = async (targetSettings: AppSettings) => {
      if (!targetSettings.supabaseUrl || !targetSettings.supabaseKey) {
          throw new Error("URL ou Clé API manquante");
      }
      const client = createClient(targetSettings.supabaseUrl, targetSettings.supabaseKey);

      const pull = async (table: string) => {
          const { data, error } = await client.from(table).select('*');
          if (error) throw error;
          return data?.map((row: any) => row.data) || [];
      };

      // Fetch all from Supabase
      const [i, m, t, tm] = await Promise.all([
          pull('inventory'),
          pull('machines'),
          pull('maintenance'),
          pull('team')
      ]);

      // Update State
      setItems(i);
      setMachines(m);
      setMaintenanceTickets(t);
      setTeamMembers(tm);

      // Force persist to localStorage (so if we switch back to local mode, data is there)
      window.localStorage.setItem('fabstock_inventory', JSON.stringify(i));
      window.localStorage.setItem('fabstock_machines', JSON.stringify(m));
      window.localStorage.setItem('fabstock_maintenance', JSON.stringify(t));
      window.localStorage.setItem('fabstock_team', JSON.stringify(tm));
  };

  return {
    items, machines, maintenanceTickets, teamMembers,
    isLoading, error, settings,
    updateSettings,
    
    setItems: (data: InventoryItem[]) => persistData(data, setItems, 'inventory', 'fabstock_inventory'),
    deleteItem: (id: string, data: InventoryItem[]) => deleteData(id, data, setItems, 'inventory', 'fabstock_inventory'),
    
    setMachines: (data: Machine[]) => persistData(data, setMachines, 'machines', 'fabstock_machines'),
    deleteMachine: (id: string, data: Machine[]) => deleteData(id, data, setMachines, 'machines', 'fabstock_machines'),

    setMaintenanceTickets: (data: MaintenanceTicket[]) => persistData(data, setMaintenanceTickets, 'maintenance', 'fabstock_maintenance'),
    deleteTicket: (id: string, data: MaintenanceTicket[]) => deleteData(id, data, setMaintenanceTickets, 'maintenance', 'fabstock_maintenance'),

    setTeamMembers: (data: TeamMember[]) => persistData(data, setTeamMembers, 'team', 'fabstock_team'),
    deleteMember: (id: string, data: TeamMember[]) => deleteData(id, data, setTeamMembers, 'team', 'fabstock_team'),
    
    uploadLocalData,
    downloadCloudData
  };
}
