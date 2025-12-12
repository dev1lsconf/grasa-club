import { Member, Product, ProductType, Transaction, StaffUser } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Purple Haze',
    type: ProductType.FLOWER,
    strainType: 'Sativa',
    thcContent: 18,
    stockGrams: 450.5,
    pricePerGram: 12,
    description: 'Sativa clásica conocida por su estimulación cerebral de alta energía.'
  },
  {
    id: '2',
    name: 'OG Kush',
    type: ProductType.FLOWER,
    strainType: 'Híbrida',
    thcContent: 22,
    stockGrams: 120.0,
    pricePerGram: 15,
    description: 'Híbrida potente para eliminar el estrés con aroma a limón y pino.'
  },
  {
    id: '3',
    name: 'Northern Lights',
    type: ProductType.FLOWER,
    strainType: 'Indica',
    thcContent: 16,
    stockGrams: 800.0,
    pricePerGram: 10,
    description: 'Indica pura, excelente para relajación muscular y dormir.'
  },
  {
    id: '4',
    name: 'Moon Rocks',
    type: ProductType.EXTRACT,
    thcContent: 50,
    stockGrams: 50.0,
    pricePerGram: 35,
    description: 'Cogollos premium bañados en aceite de hachís y cubiertos de kief.'
  },
  {
    id: '5',
    name: 'Gominolas CBD',
    type: ProductType.EDIBLE,
    cbdContent: 25,
    stockGrams: 100, // Unidades
    pricePerGram: 5, // Precio por unidad
    description: 'Paquete de 10 gominolas, 25mg de CBD cada una.'
  },
  {
    id: '6',
    name: 'Papel King Size RAW',
    type: ProductType.ACCESSORY,
    stockGrams: 50, // Unidades
    pricePerGram: 1.50,
    description: 'Librillo de papel sin blanquear, tamaño King Size.'
  },
  {
    id: '7',
    name: 'Agua Mineral 50cl',
    type: ProductType.DRINK,
    stockGrams: 48,
    pricePerGram: 1.00,
    description: 'Botella de agua fría.'
  },
  {
    id: '8',
    name: 'Coca Cola',
    type: ProductType.DRINK,
    stockGrams: 24,
    pricePerGram: 1.50,
    description: 'Lata 33cl bien fría.'
  },
  {
    id: '9',
    name: 'Zumo de Piña',
    type: ProductType.DRINK,
    stockGrams: 12,
    pricePerGram: 1.20,
    description: 'Zumo natural en botella de vidrio.'
  },
  {
    id: '10',
    name: 'Cerveza 0,0%',
    type: ProductType.DRINK,
    stockGrams: 24,
    pricePerGram: 2.00,
    description: 'Cerveza sin alcohol refrescante.'
  }
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'm1',
    fullName: 'María García',
    docNumber: 'X1234567Z',
    docType: 'NIE',
    photoUrl: 'https://picsum.photos/200/200',
    docPhotoUrl: '',
    balance: 150.00,
    joinedDate: new Date().toISOString(),
    active: true
  },
  {
    id: 'm2',
    fullName: 'Juan Pérez',
    docNumber: '12345678A',
    docType: 'DNI',
    photoUrl: 'https://picsum.photos/201/201',
    docPhotoUrl: '',
    balance: 20.50,
    joinedDate: new Date().toISOString(),
    active: true
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    memberId: 'm1',
    memberName: 'María García',
    type: 'DEPOSIT',
    amount: 200,
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 't2',
    memberId: 'm1',
    memberName: 'María García',
    type: 'PURCHASE',
    amount: 50,
    items: [{ productId: '1', productName: 'Purple Haze', quantity: 4.16, priceAtSale: 12, subtotal: 50 }],
    timestamp: new Date(Date.now() - 40000000).toISOString()
  }
];

export const MOCK_STAFF: StaffUser[] = [
  { 
    id: 'admin1', 
    name: 'Duke Jefe', 
    role: 'ADMIN', 
    avatar: 'https://ui-avatars.com/api/?name=Duke+Jefe&background=10b981&color=fff',
    password: '1234'
  },
  { 
    id: 'inv1', 
    name: 'Pali Stock', 
    role: 'INVENTORY', 
    avatar: 'https://ui-avatars.com/api/?name=Pali+Stock&background=6366f1&color=fff',
    password: '1234'
  },
  { 
    id: 'sales1', 
    name: 'Yonfre Vendedor', 
    role: 'SALES', 
    avatar: 'https://ui-avatars.com/api/?name=Yonfre+Vendedor&background=f59e0b&color=fff',
    password: '1234'
  }
];