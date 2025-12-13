
import { InventoryItem, Category, StockMovementType, TeamMember, Machine, MachineStatus, MaintenanceTicket, MaintenanceType } from '../types';

const createInitialHistory = (qty: number): any[] => [{
  id: 'hist_init_' + Math.random().toString(36).substr(2, 9),
  date: '2023-01-01T10:00:00.000Z',
  type: StockMovementType.CREATION,
  quantityChange: qty,
  remainingQuantity: qty,
  user: 'Système'
}];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Arduino Uno R3',
    description: 'Microcontrôleur standard pour prototypage.',
    category: Category.ELECTRONICS,
    quantity: 12,
    minQuantity: 5,
    location: 'Armoire A, Étagère 2',
    lastUpdated: '2023-10-25',
    pricePerUnit: 24.00,
    history: createInitialHistory(12)
  },
  {
    id: '2',
    name: 'PLA Blanc 1.75mm',
    description: 'Filament PLA standard pour imprimantes Prusa.',
    category: Category.CONSUMABLES,
    quantity: 3,
    minQuantity: 4,
    location: 'Stockage Sec',
    lastUpdated: '2023-10-28',
    pricePerUnit: 19.99,
    history: createInitialHistory(3)
  },
  {
    id: '4',
    name: 'Contreplaqué Bouleau 3mm',
    description: 'Plaque 600x400mm pour découpeuse laser.',
    category: Category.RAW_MATERIALS,
    quantity: 45,
    minQuantity: 20,
    location: 'Rack Bois Vertical',
    lastUpdated: '2023-10-29',
    pricePerUnit: 4.50,
    history: createInitialHistory(45)
  },
  {
    id: '5',
    name: 'Fer à souder Weller',
    description: 'Station de soudage réglable (Main).',
    category: Category.TOOLS,
    quantity: 8,
    minQuantity: 8,
    location: 'Zone Électronique',
    lastUpdated: '2023-09-15',
    pricePerUnit: 120.00,
    history: createInitialHistory(8)
  },
  {
    id: '6',
    name: 'Vis M3 x 10mm',
    description: 'Boite de 100 vis tête cylindrique.',
    category: Category.CONSUMABLES,
    quantity: 15,
    minQuantity: 5,
    location: 'Organisateur Visserie',
    lastUpdated: '2023-10-30',
    pricePerUnit: 3.20,
    history: createInitialHistory(15)
  }
];

export const INITIAL_MACHINES: Machine[] = [
  {
    id: 'm1',
    name: 'Prusa i3 MK3S+',
    model: 'MK3S+',
    status: MachineStatus.OPERATIONAL,
    location: 'Zone Impression 3D',
    serialNumber: 'CZ-2023-5594'
  },
  {
    id: 'm2',
    name: 'Trotec Speedy 100',
    model: 'Speedy 100',
    status: MachineStatus.MAINTENANCE_REQ,
    location: 'Atelier Sale',
    notes: 'Le filtre commence à être saturé.'
  },
  {
    id: 'm3',
    name: 'CNC ShopBot',
    model: 'Desktop MAX',
    status: MachineStatus.OPERATIONAL,
    location: 'Grand Atelier'
  }
];

export const INITIAL_MAINTENANCE: MaintenanceTicket[] = [
  {
    id: 'mt1',
    machineId: 'm2',
    machineName: 'Trotec Speedy 100',
    dateCreated: '2023-10-20T10:00:00Z',
    status: 'Open',
    type: MaintenanceType.PREVENTIVE,
    description: 'Remplacement du filtre charbon et nettoyage des miroirs.',
    assignedToId: 'u1'
  }
];

export const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'u1',
    name: 'Fab Admin',
    email: 'admin@fablab.com',
    role: 'Admin',
    canManageStock: true,
    avatarColor: 'bg-indigo-500'
  }
];
