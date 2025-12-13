
export enum Category {
  ELECTRONICS = 'Électronique',
  CONSUMABLES = 'Consommables 3D/CNC',
  TOOLS = 'Petit Outillage (Main)',
  RAW_MATERIALS = 'Matières Premières',
  FURNITURE = 'Mobilier',
  OTHER = 'Autre'
}

// Nouvelle énumération pour les statuts de stock
export enum StockStatus {
  IN_STOCK = 'En stock',
  LOW_STOCK = 'Stock faible',
  OUT_OF_STOCK = 'Rupture',
  ORDERED = 'Commandé'
}

export enum StockMovementType {
  CREATION = 'Création',
  ADDITION = 'Ajout',
  REMOVAL = 'Retrait',
  ADJUSTMENT = 'Ajustement'
}

export interface StockHistoryEntry {
  id: string;
  date: string;
  type: StockMovementType;
  quantityChange: number;
  remainingQuantity: number;
  user: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  quantity: number;
  minQuantity: number;
  location: string;
  lastUpdated: string;
  pricePerUnit?: number;
  history: StockHistoryEntry[];
}

// --- NOUVEAUX TYPES MACHINES & MAINTENANCE ---

export enum MachineStatus {
  OPERATIONAL = 'Opérationnelle',
  MAINTENANCE_REQ = 'Maintenance Requise',
  IN_MAINTENANCE = 'En Maintenance',
  BROKEN = 'Hors Service'
}

export interface Machine {
  id: string;
  name: string;
  model: string;
  serialNumber?: string;
  purchaseDate?: string;
  status: MachineStatus;
  location: string;
  image?: string; // URL optionnelle
  notes?: string;
}

export enum MaintenanceType {
  PREVENTIVE = 'Préventive',
  CORRECTIVE = 'Corrective',
  UPGRADE = 'Amélioration'
}

export interface MaintenanceTicket {
  id: string;
  machineId: string;
  machineName: string;
  dateCreated: string;
  status: 'Open' | 'In Progress' | 'Done';
  type: MaintenanceType;
  description: string;
  assignedToId?: string; // ID du membre de l'équipe
  performedBy?: string; // Nom pour l'affichage historique
  partsUsed?: string; // Description textuelle des pièces
  cost?: number;
  resolutionDate?: string;
  notes?: string;
}

// ---------------------------------------------

export interface TeamMember {
  id: string;
  name: string;
  email: string; // Champ rendu obligatoire
  role: 'Admin' | 'Membre' | 'Stagiaire';
  canManageStock: boolean;
  avatarColor: string;
}

export interface DashboardStats {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
  categoryDistribution: { name: string; value: number }[];
}

export interface AIAnalysisResult {
  name: string;
  description: string;
  category: Category;
  suggestedMinQuantity: number;
  locationSuggestion: string;
}

export type StorageMode = 'local' | 'supabase';

export interface AppSettings {
  mode: StorageMode;
  supabaseUrl: string;
  supabaseKey: string;
  // EmailJS Configuration
  emailJsServiceId?: string;
  emailJsTemplateId?: string;
  emailJsPublicKey?: string;
}
