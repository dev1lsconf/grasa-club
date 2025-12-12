export enum ProductType {
  FLOWER = 'Flor',
  EXTRACT = 'Extracto',
  EDIBLE = 'Comestible',
  ACCESSORY = 'Accesorio',
  DRINK = 'Bebida'
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  strainType?: 'Indica' | 'Sativa' | 'Híbrida';
  thcContent?: number;
  cbdContent?: number;
  stockGrams: number; // Para items que no son gramos, son unidades
  pricePerGram: number; // O precio por unidad
  description: string;
}

export interface Member {
  id: string;
  fullName: string;
  docNumber: string; // DNI, NIE, Pasaporte
  docType: 'DNI' | 'NIE' | 'PASAPORTE';
  photoUrl: string; // Base64 o URL
  docPhotoUrl: string; // Base64 o URL
  balance: number;
  joinedDate: string;
  active: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number; // Gramos o unidades
  priceAtSale: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  memberId: string;
  memberName: string;
  type: 'DEPOSIT' | 'PURCHASE';
  amount: number;
  items?: CartItem[]; // Solo para compras
  timestamp: string;
}

export type ViewState = 'DASHBOARD' | 'MEMBERS' | 'INVENTORY' | 'POS' | 'AI_ASSISTANT' | 'STAFF';

// Hierarchy Types
export type Role = 'ADMIN' | 'INVENTORY' | 'SALES';

export interface StaffUser {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  password: string;
}