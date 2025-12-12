import React, { useState } from 'react';
import { LayoutDashboard, Users, Package, ShoppingCart, MessageSquare, LogOut, Wallet, UserCog } from 'lucide-react';
import { INITIAL_MEMBERS, INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, MOCK_STAFF } from './constants';
import { Member, Product, Transaction, ViewState, CartItem, StaffUser, Role } from './types';
import { MemberRegistration } from './components/MemberRegistration';
import { POS } from './components/POS';
import { LoginScreen } from './components/LoginScreen';
import { StaffManagement } from './components/StaffManagement';
import { ProductForm } from './components/ProductForm';
import { ReceiptModal } from './components/ReceiptModal';
import { getGeminiResponse } from './services/geminiService';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);

  // App State
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [staff, setStaff] = useState<StaffUser[]>(MOCK_STAFF);

  // UI State
  const [showMemberReg, setShowMemberReg] = useState(false);
  const [walletModalMember, setWalletModalMember] = useState<Member | null>(null);
  const [walletAmount, setWalletAmount] = useState('');
  
  // Transaction/Receipt State
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  
  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // --- Helpers for Permissions ---
  const canAccess = (role: Role, section: ViewState): boolean => {
    switch (section) {
      case 'DASHBOARD': return true; 
      case 'POS': return role === 'ADMIN' || role === 'SALES';
      case 'MEMBERS': return role === 'ADMIN' || role === 'SALES';
      case 'INVENTORY': return true; 
      case 'AI_ASSISTANT': return true;
      case 'STAFF': return role === 'ADMIN';
      default: return false;
    }
  };

  const canEditInventory = (role: Role) => role === 'ADMIN' || role === 'INVENTORY';
  const canSeeFinancials = (role: Role) => role === 'ADMIN';

  // --- Actions ---

  const handleLogin = (user: StaffUser) => {
    setCurrentUser(user);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Staff Management Actions
  const handleAddStaff = (newUser: StaffUser) => {
    setStaff([...staff, newUser]);
  };

  const handleUpdateStaff = (updatedUser: StaffUser) => {
    setStaff(staff.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If updating self, update current user state
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleDeleteStaff = (id: string) => {
    if (staff.length <= 1) {
      alert("No puedes eliminar al último usuario.");
      return;
    }
    setStaff(staff.filter(u => u.id !== id));
  };

  // Product Management Actions
  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, product]);
    }
    setShowProductForm(false);
    setEditingProduct(undefined);
  };

  const openAddProduct = () => {
    setEditingProduct(undefined);
    setShowProductForm(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleRegisterMember = (newMember: Member) => {
    setMembers([newMember, ...members]);
    setShowMemberReg(false);
  };

  const handleDeposit = () => {
    if (!walletModalMember || !walletAmount) return;
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Update Member Balance
    const updatedMembers = members.map(m => 
      m.id === walletModalMember.id ? { ...m, balance: m.balance + amount } : m
    );
    setMembers(updatedMembers);

    // Create Transaction Record
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      memberId: walletModalMember.id,
      memberName: walletModalMember.fullName,
      type: 'DEPOSIT',
      amount: amount,
      timestamp: new Date().toISOString()
    };
    setTransactions([newTx, ...transactions]);

    setWalletModalMember(null);
    setWalletAmount('');
  };

  const handleCheckout = (memberId: string, cart: CartItem[], total: number) => {
    // 1. Deduct from Member
    const updatedMembers = members.map(m => 
      m.id === memberId ? { ...m, balance: m.balance - total } : m
    );
    setMembers(updatedMembers);

    // 2. Deduct Stock
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(i => i.productId === p.id);
      if (cartItem) {
        return { ...p, stockGrams: p.stockGrams - cartItem.quantity };
      }
      return p;
    });
    setProducts(updatedProducts);

    // 3. Record Transaction
    const memberName = members.find(m => m.id === memberId)?.fullName || 'Desconocido';
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      memberId,
      memberName,
      type: 'PURCHASE',
      amount: total,
      items: cart,
      timestamp: new Date().toISOString()
    };
    setTransactions([newTx, ...transactions]);

    // 4. Show Receipt instead of Alert
    setLastTransaction(newTx);
  };

  const handleReceiptClose = () => {
    setLastTransaction(null);
    if (currentUser?.role !== 'SALES') {
      setView('DASHBOARD');
    }
  };

  const handleAiSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatInput('');
    setIsAiThinking(true);

    const response = await getGeminiResponse(userMsg, products);
    
    setChatMessages(prev => [...prev, { role: 'model', text: response || 'Sin respuesta.' }]);
    setIsAiThinking(false);
  };

  // Custom Cannabis Leaf Icon Component
  const CannabisLogo = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
       <path d="M17.15,19.34L15.39,15.82C15.82,15.08 16.29,14.33 16.79,13.59C17.56,12.44 18.53,11.39 19.66,10.45C19.79,10.34 19.88,10.18 19.89,10C19.9,9.83 19.82,9.66 19.68,9.54C18.66,8.69 17.51,7.96 16.27,7.39C15.53,7.05 14.75,6.78 13.96,6.56C13.62,6.46 13.39,6.21 13.33,5.86C13.11,4.56 12.63,3.22 12,2C11.37,3.22 10.89,4.56 10.67,5.86C10.61,6.21 10.38,6.46 10.04,6.56C9.25,6.78 8.47,7.05 7.73,7.39C6.49,7.96 5.34,8.69 4.32,9.54C4.18,9.66 4.1,9.83 4.11,10C4.12,10.18 4.21,10.34 4.34,10.45C5.47,11.39 6.44,12.44 7.21,13.59C7.71,14.33 8.18,15.08 8.61,15.82L6.85,19.34C6.77,19.5 6.78,19.69 6.87,19.84C6.96,19.99 7.13,20.07 7.3,20.06C8.84,19.93 10.31,19.5 11.64,18.81L11.75,22H12.25L12.36,18.81C13.69,19.5 15.16,19.93 16.7,20.06C16.87,20.07 17.04,19.99 17.13,19.84C17.22,19.69 17.23,19.5 17.15,19.34Z" />
    </svg>
  );

  // --- Views ---

  if (!currentUser) {
    return <LoginScreen staff={staff} onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    const totalMembers = members.length;
    const totalStock = products.reduce((acc, p) => acc + p.stockGrams, 0);
    const lowStock = products.filter(p => p.stockGrams < 50);
    const todaysSales = transactions
      .filter(t => t.type === 'PURCHASE' && new Date(t.timestamp).toDateString() === new Date().toDateString())
      .reduce((acc, t) => acc + t.amount, 0);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Panel de Control</h2>
          <span className="text-slate-400">Hola, <span className="text-emerald-400 font-bold">{currentUser.name}</span></span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Members Stats - Hidden for Inventory */}
          {currentUser.role !== 'INVENTORY' && (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h3 className="text-slate-400 text-sm font-bold uppercase mb-2">Total Socios</h3>
              <div className="text-4xl font-bold text-white">{totalMembers}</div>
            </div>
          )}

          {/* Stock Stats - Visible to All */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-slate-400 text-sm font-bold uppercase mb-2">Stock Total (g/u)</h3>
            <div className="text-4xl font-bold text-emerald-400">{totalStock.toFixed(1)}</div>
          </div>

          {/* Sales Stats - Admin Only */}
          {canSeeFinancials(currentUser.role) ? (
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
              <h3 className="text-slate-400 text-sm font-bold uppercase mb-2">Ventas de Hoy</h3>
              <div className="text-4xl font-bold text-blue-400">€{todaysSales.toFixed(2)}</div>
            </div>
          ) : (
             <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 opacity-50">
              <h3 className="text-slate-400 text-sm font-bold uppercase mb-2">Ventas</h3>
              <div className="text-lg text-slate-500 italic">Acceso restringido</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions - Admin & Sales */}
          {currentUser.role !== 'INVENTORY' && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Transacciones Recientes</h3>
              <div className="space-y-3">
                {transactions.slice(0, 5).map(t => (
                  <div key={t.id} className="flex justify-between items-center bg-slate-700/30 p-3 rounded">
                    <div>
                      <div className="font-bold text-white">{t.memberName}</div>
                      <div className="text-xs text-slate-400">{new Date(t.timestamp).toLocaleTimeString()}</div>
                    </div>
                    {canSeeFinancials(currentUser.role) && (
                      <div className={`font-bold ${t.type === 'DEPOSIT' ? 'text-green-400' : 'text-white'}`}>
                        {t.type === 'DEPOSIT' ? '+' : '-'}€{t.amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stock Alerts - Admin & Inventory */}
          {(currentUser.role === 'ADMIN' || currentUser.role === 'INVENTORY') && (
            <div className={`bg-slate-800 rounded-xl border border-slate-700 p-6 ${currentUser.role === 'INVENTORY' ? 'col-span-2' : ''}`}>
              <h3 className="text-xl font-bold text-white mb-4">Alertas de Stock</h3>
              {lowStock.length === 0 ? (
                <p className="text-slate-400">Los niveles de inventario son correctos.</p>
              ) : (
                <div className="space-y-3">
                  {lowStock.map(p => (
                    <div key={p.id} className="flex justify-between items-center bg-red-900/20 border border-red-900/50 p-3 rounded">
                      <span className="text-red-200 font-bold">{p.name}</span>
                      <span className="text-red-300 text-sm">{p.stockGrams} {p.type === 'Flor' || p.type === 'Extracto' ? 'g' : 'ud'} restantes</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMembers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Directorio de Socios</h2>
        <button 
          onClick={() => setShowMemberReg(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold"
        >
          + Nuevo Socio
        </button>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="p-4">Socio</th>
              <th className="p-4">Documento</th>
              <th className="p-4">Alta</th>
              <th className="p-4">Saldo</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 text-slate-200">
            {members.map(m => (
              <tr key={m.id} className="hover:bg-slate-700/50">
                <td className="p-4 flex items-center gap-3">
                  <img src={m.photoUrl} className="w-10 h-10 rounded-full object-cover" alt="" />
                  <span className="font-bold">{m.fullName}</span>
                </td>
                <td className="p-4"><span className="text-xs bg-slate-700 px-2 py-1 rounded">{m.docType}</span> {m.docNumber}</td>
                <td className="p-4 text-sm text-slate-400">{new Date(m.joinedDate).toLocaleDateString()}</td>
                <td className="p-4 font-mono text-emerald-400 font-bold">€{m.balance.toFixed(2)}</td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => setWalletModalMember(m)}
                    className="bg-slate-700 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                    title="Recargar Monedero"
                  >
                    <Wallet size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInventory = () => (
     <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Inventario</h2>
        {canEditInventory(currentUser.role) && (
          <button 
            onClick={openAddProduct}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20"
          >
            + Añadir Producto
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-emerald-500 transition-colors group">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-xs font-bold px-2 py-1 rounded bg-slate-900 ${
                  p.type === 'Flor' ? 'text-green-400' : 
                  p.type === 'Extracto' ? 'text-purple-400' :
                  p.type === 'Bebida' ? 'text-blue-400' : 'text-slate-400'
              }`}>{p.type} {p.strainType ? `• ${p.strainType}` : ''}</span>
              <span className="font-mono text-emerald-400 font-bold">€{p.pricePerGram}/{p.type === 'Flor' || p.type === 'Extracto' ? 'g' : 'ud'}</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{p.name}</h3>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{p.description}</p>
            <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
              <div>
                <span className="block text-xs text-slate-500 uppercase">Stock</span>
                <span className={`font-bold ${p.stockGrams < 50 ? 'text-red-400' : 'text-white'}`}>{p.stockGrams}{p.type === 'Flor' || p.type === 'Extracto' ? 'g' : 'ud'}</span>
              </div>
              {p.thcContent && (
                 <div>
                  <span className="block text-xs text-slate-500 uppercase">THC</span>
                  <span className="font-bold text-white">{p.thcContent}%</span>
                </div>
              )}
            </div>
            {canEditInventory(currentUser.role) && (
              <div className="mt-4 pt-2 border-t border-slate-700/50 flex justify-end">
                <button 
                  onClick={() => openEditProduct(p)} 
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold"
                >
                  Editar / Stock
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderAiAssistant = () => (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700 bg-slate-900 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-emerald-400" /> Budtender IA
          </h2>
          <p className="text-xs text-slate-400">Pregunta sobre inventario, efectos o ayuda de marketing.</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center text-slate-500 mt-20">
            <p>¿Cómo puedo ayudarte hoy, {currentUser.name}?</p>
            <div className="flex gap-2 justify-center mt-4">
              <button onClick={() => setChatInput("¿Qué tenemos para el insomnio?")} className="text-xs bg-slate-700 px-3 py-1 rounded hover:text-white">¿Ayuda para dormir?</button>
              <button onClick={() => setChatInput("Escribe un tweet sobre nuestra Purple Haze")} className="text-xs bg-slate-700 px-3 py-1 rounded hover:text-white">¿Marketing?</button>
            </div>
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none' 
                : 'bg-slate-700 text-slate-200 rounded-bl-none'
            }`}>
              {msg.text.split('\n').map((line, j) => <p key={j}>{line}</p>)}
            </div>
          </div>
        ))}
        {isAiThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-400 p-3 rounded-lg rounded-bl-none text-xs animate-pulse">
              Pensando...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-700">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
            placeholder="Pregunta lo que sea..."
            className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
          <button 
            onClick={handleAiSend}
            disabled={isAiThinking || !chatInput.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-200 font-sans">
      {/* Sidebar */}
      <nav className="w-20 lg:w-64 bg-slate-950 border-r border-slate-800 flex flex-col items-center lg:items-stretch py-6 sticky top-0 h-screen">
        <div className="mb-8 px-4 flex items-center justify-center lg:justify-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/50">
            <CannabisLogo className="w-6 h-6 text-white" />
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight">GRASA CLUB</span>
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Sistema de Gestión</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 px-2">
          {[
            { id: 'DASHBOARD', icon: LayoutDashboard, label: 'Inicio', visible: canAccess(currentUser.role, 'DASHBOARD') },
            { id: 'POS', icon: ShoppingCart, label: 'Punto de Venta', visible: canAccess(currentUser.role, 'POS') },
            { id: 'MEMBERS', icon: Users, label: 'Socios', visible: canAccess(currentUser.role, 'MEMBERS') },
            { id: 'INVENTORY', icon: Package, label: 'Inventario', visible: canAccess(currentUser.role, 'INVENTORY') },
            { id: 'AI_ASSISTANT', icon: MessageSquare, label: 'Budtender IA', visible: canAccess(currentUser.role, 'AI_ASSISTANT') },
            { id: 'STAFF', icon: UserCog, label: 'Equipo', visible: canAccess(currentUser.role, 'STAFF') },
          ]
          .filter(item => item.visible)
          .map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                view === item.id 
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              } justify-center lg:justify-start`}
            >
              <item.icon size={22} />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="px-2 pb-4">
           <div className="mb-4 px-2 hidden lg:flex items-center gap-3 bg-slate-900 p-2 rounded-lg">
             <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full" />
             <div className="overflow-hidden">
               <div className="text-sm font-bold truncate">{currentUser.name}</div>
               <div className="text-xs text-emerald-400">{currentUser.role}</div>
             </div>
           </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-900/10 justify-center lg:justify-start transition-colors"
          >
            <LogOut size={22} />
            <span className="hidden lg:block font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        {showMemberReg ? (
          <MemberRegistration 
            onSave={handleRegisterMember} 
            onCancel={() => setShowMemberReg(false)} 
          />
        ) : (
          <>
            {view === 'DASHBOARD' && renderDashboard()}
            {view === 'MEMBERS' && renderMembers()}
            {view === 'INVENTORY' && renderInventory()}
            {view === 'POS' && <POS members={members} products={products} onCheckout={handleCheckout} />}
            {view === 'AI_ASSISTANT' && renderAiAssistant()}
            {view === 'STAFF' && (
              <StaffManagement 
                staff={staff} 
                onAdd={handleAddStaff} 
                onUpdate={handleUpdateStaff}
                onDelete={handleDeleteStaff}
              />
            )}
          </>
        )}
      </main>

      {/* Wallet Top-Up Modal */}
      {walletModalMember && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Recargar Monedero</h3>
            <div className="flex items-center gap-3 mb-6 bg-slate-900/50 p-3 rounded-lg">
              <img src={walletModalMember.photoUrl} className="w-12 h-12 rounded-full object-cover" alt=""/>
              <div>
                <p className="font-bold text-white">{walletModalMember.fullName}</p>
                <p className="text-sm text-slate-400">Actual: €{walletModalMember.balance.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-slate-400 text-sm mb-2">Cantidad a Depositar (€)</label>
              <input 
                type="number" 
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white text-xl font-bold focus:border-emerald-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setWalletModalMember(null)}
                className="flex-1 py-3 text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeposit}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {lastTransaction && (
        <ReceiptModal 
          transaction={lastTransaction} 
          onClose={handleReceiptClose}
        />
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm 
          onSave={handleSaveProduct} 
          onCancel={() => setShowProductForm(false)} 
          initialData={editingProduct}
        />
      )}
    </div>
  );
};

export default App;