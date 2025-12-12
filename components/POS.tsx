import React, { useState, useMemo } from 'react';
import { Member, Product, CartItem, ProductType } from '../types';
import { Search, ShoppingCart, Trash2, Plus, Minus, UserCheck, AlertCircle } from 'lucide-react';

interface Props {
  members: Member[];
  products: Product[];
  onCheckout: (memberId: string, cart: CartItem[], total: number) => void;
}

export const POS: React.FC<Props> = ({ members, products, onCheckout }) => {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<ProductType | 'ALL'>('ALL');

  // Member Selection
  const filteredMembers = useMemo(() => {
    if (!memberSearch) return [];
    return members.filter(m => 
      m.fullName.toLowerCase().includes(memberSearch.toLowerCase()) || 
      m.docNumber.toLowerCase().includes(memberSearch.toLowerCase())
    ).slice(0, 5);
  }, [members, memberSearch]);

  // Product Selection
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || p.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [products, searchTerm, filterType]);

  const addToCart = (product: Product) => {
    if (!selectedMember) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.priceAtSale } 
          : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1, // Default 1g/unit
        priceAtSale: product.pricePerGram,
        subtotal: product.pricePerGram
      }];
    });
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const product = products.find(p => p.id === productId);
        // Check stock limit (simplified)
        if (product && newQty > product.stockGrams) {
          alert(`No hay suficiente stock. Solo ${product.stockGrams} disponibles.`);
          return item;
        }
        return { ...item, quantity: newQty, subtotal: newQty * item.priceAtSale };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const canCheckout = selectedMember && cart.length > 0 && selectedMember.balance >= cartTotal;

  const getUnitLabel = (type: ProductType) => {
    if (type === ProductType.FLOWER || type === ProductType.EXTRACT) return 'g';
    return 'ud';
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4">
      {/* Left: Product Catalog */}
      <div className="w-2/3 flex flex-col gap-4">
        {/* Filters */}
        <div className="flex gap-4 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar cepas, comestibles..." 
              className="w-full bg-slate-800 border-none rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-slate-800 text-white rounded-lg px-4 border-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="ALL">Todas las Categorías</option>
            <option value={ProductType.FLOWER}>Flor</option>
            <option value={ProductType.EXTRACT}>Extractos</option>
            <option value={ProductType.EDIBLE}>Comestibles</option>
            <option value={ProductType.ACCESSORY}>Accesorios</option>
            <option value={ProductType.DRINK}>Bebidas</option>
          </select>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 gap-4 pr-2">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={!selectedMember || product.stockGrams <= 0}
              className={`p-4 rounded-xl border flex flex-col items-start transition-all
                ${!selectedMember 
                  ? 'bg-slate-800/50 border-slate-700 opacity-50 cursor-not-allowed' 
                  : 'bg-slate-800 border-slate-700 hover:border-emerald-500 hover:bg-slate-750'
                }
              `}
            >
              <div className="flex justify-between w-full mb-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  product.type === ProductType.FLOWER ? 'bg-green-900 text-green-300' : 
                  product.type === ProductType.EXTRACT ? 'bg-purple-900 text-purple-300' :
                  product.type === ProductType.DRINK ? 'bg-blue-900 text-blue-300' : 'bg-slate-700 text-slate-300'
                }`}>
                  {product.type}
                </span>
                <span className="text-slate-400 text-sm">{product.stockGrams}{getUnitLabel(product.type)} rest.</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
              <div className="text-sm text-slate-400 mb-3 line-clamp-2 text-left">{product.description}</div>
              <div className="mt-auto font-bold text-emerald-400 text-xl w-full text-right">
                €{product.pricePerGram}/{getUnitLabel(product.type)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Cart & Member Context */}
      <div className="w-1/3 bg-slate-800 rounded-xl border border-slate-700 flex flex-col">
        {/* Member Selector Header */}
        <div className="p-4 border-b border-slate-700">
          {!selectedMember ? (
            <div className="relative">
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2 block">Selecciona Socio para Empezar</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Escanear DNI o buscar nombre..."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-10 text-white focus:outline-none focus:border-emerald-500"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  autoFocus
                />
              </div>
              {filteredMembers.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-slate-700 mt-1 rounded-lg shadow-xl z-20 overflow-hidden">
                  {filteredMembers.map(m => (
                    <div 
                      key={m.id}
                      onClick={() => {
                        setSelectedMember(m);
                        setMemberSearch('');
                      }}
                      className="p-3 hover:bg-emerald-600 hover:text-white cursor-pointer flex items-center gap-3 border-b border-slate-600 last:border-0"
                    >
                      <img src={m.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-sm">{m.fullName}</div>
                        <div className="text-xs opacity-70">{m.docNumber}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-emerald-500/30">
              <div className="flex items-center gap-3">
                <img src={selectedMember.photoUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-emerald-500" />
                <div>
                  <div className="font-bold text-white">{selectedMember.fullName}</div>
                  <div className={`text-sm ${selectedMember.balance < cartTotal ? 'text-red-400' : 'text-emerald-400'}`}>
                    Saldo: €{selectedMember.balance.toFixed(2)}
                  </div>
                </div>
              </div>
              <button onClick={() => { setSelectedMember(null); setCart([]); }} className="text-xs text-slate-400 hover:text-white underline">
                Cambiar
              </button>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">
              <ShoppingCart className="mx-auto mb-2 opacity-20" size={48} />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => {
              const product = products.find(p => p.id === item.productId);
              const unitLabel = product ? getUnitLabel(product.type) : 'u';
              return (
                <div key={item.productId} className="bg-slate-700/30 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white text-sm">{item.productName}</div>
                    <div className="text-emerald-400 text-xs font-mono">€{item.priceAtSale}/{unitLabel}</div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <div className="flex items-center bg-slate-900 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - (unitLabel === 'g' ? 0.5 : 1))} className="p-1 hover:text-emerald-400">
                          <Minus size={14} />
                        </button>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.productId, parseFloat(e.target.value))}
                          className="w-12 bg-transparent text-center text-sm font-bold focus:outline-none text-white appearance-none"
                        />
                        <span className="text-xs text-slate-500 pr-1">{unitLabel}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + (unitLabel === 'g' ? 0.5 : 1))} className="p-1 hover:text-emerald-400">
                          <Plus size={14} />
                        </button>
                     </div>
                     <div className="font-bold text-white w-16 text-right">
                        €{item.subtotal.toFixed(2)}
                     </div>
                     <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-300">
                        <Trash2 size={16} />
                     </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Checkout */}
        <div className="p-4 bg-slate-900 border-t border-slate-700 mt-auto">
          <div className="flex justify-between items-end mb-4">
            <span className="text-slate-400">Total</span>
            <span className="text-3xl font-bold text-white">€{cartTotal.toFixed(2)}</span>
          </div>

          {selectedMember && selectedMember.balance < cartTotal && (
            <div className="mb-3 flex items-center gap-2 text-red-400 bg-red-400/10 p-2 rounded text-sm">
              <AlertCircle size={16} />
              Saldo insuficiente. Recargar monedero.
            </div>
          )}

          <button
            onClick={() => selectedMember && onCheckout(selectedMember.id, cart, cartTotal)}
            disabled={!canCheckout}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2
              ${canCheckout 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'}
            `}
          >
            <UserCheck size={20} />
            Completar Venta
          </button>
        </div>
      </div>
    </div>
  );
};