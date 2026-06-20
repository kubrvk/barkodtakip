export type Role = 'warehouse' | 'driver' | 'admin';
export type LocationType = 'shelf' | 'vehicle' | 'other';
export type MovementType = 'in' | 'out' | 'transfer' | 'count';

export type AppUser = {
  uid: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  currentStock: number;
  minStock: number;
  unit: string;
  locationCode: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Location = {
  id: string;
  type: LocationType;
  code: string;
  description: string;
};

export type StockMovement = {
  id: string;
  productId: string;
  productName: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  type: MovementType;
  userName: string;
  note: string;
  timestamp: string;
};

export type CountTask = {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  locationCode: string;
  progress: number;
  total: number;
  createdAt?: string;
};

export const UNITS = ['adet', 'kg', 'litre', 'kutu', 'paket', 'rulo', 'metre', 'çift'];

export const movementTypeLabel: Record<MovementType, string> = {
  in: 'Giriş',
  out: 'Çıkış',
  transfer: 'Transfer',
  count: 'Sayım',
};

export const movementTypeColor: Record<MovementType, string> = {
  in: '#3ecf72',
  out: '#ff4d55',
  transfer: '#3d9eff',
  count: '#f5a623',
};
