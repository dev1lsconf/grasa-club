import React, { useState } from 'react';
import { StaffUser } from '../types';
import { Lock, ShieldCheck, ShoppingBag, Package, X, ArrowRight, KeyRound } from 'lucide-react';

interface Props {
  staff: StaffUser[];
  onLogin: (user: StaffUser) => void;
}

export const LoginScreen: React.FC<Props> = ({ staff, onLogin }) => {
  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck className="text-emerald-400" />;
      case 'INVENTORY': return <Package className="text-indigo-400" />;
      case 'SALES': return <ShoppingBag className="text-amber-400" />;
      default: return <Lock />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'INVENTORY': return 'Encargado Inventario';
      case 'SALES': return 'Vendedor';
      default: return role;
    }
  };

  const handleUserClick = (user: StaffUser) => {
    setSelectedUser(user);
    setPassword('');
    setError(false);
  };

  const handlePasswordSubmit = () => {
    if (!selectedUser) return;
    
    if (password === selectedUser.password) {
      onLogin(selectedUser);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  // Custom Cannabis Leaf Icon
  const CannabisLogo = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-white">
       <path d="M17.15,19.34L15.39,15.82C15.82,15.08 16.29,14.33 16.79,13.59C17.56,12.44 18.53,11.39 19.66,10.45C19.79,10.34 19.88,10.18 19.89,10C19.9,9.83 19.82,9.66 19.68,9.54C18.66,8.69 17.51,7.96 16.27,7.39C15.53,7.05 14.75,6.78 13.96,6.56C13.62,6.46 13.39,6.21 13.33,5.86C13.11,4.56 12.63,3.22 12,2C11.37,3.22 10.89,4.56 10.67,5.86C10.61,6.21 10.38,6.46 10.04,6.56C9.25,6.78 8.47,7.05 7.73,7.39C6.49,7.96 5.34,8.69 4.32,9.54C4.18,9.66 4.1,9.83 4.11,10C4.12,10.18 4.21,10.34 4.34,10.45C5.47,11.39 6.44,12.44 7.21,13.59C7.71,14.33 8.18,15.08 8.61,15.82L6.85,19.34C6.77,19.5 6.78,19.69 6.87,19.84C6.96,19.99 7.13,20.07 7.3,20.06C8.84,19.93 10.31,19.5 11.64,18.81L11.75,22H12.25L12.36,18.81C13.69,19.5 15.16,19.93 16.7,20.06C16.87,20.07 17.04,19.99 17.13,19.84C17.22,19.69 17.23,19.5 17.15,19.34Z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative">
      <div className="mb-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-700 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-900/50 mb-6 rotate-3 hover:rotate-6 transition-transform">
          <CannabisLogo />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">GRASA <span className="text-emerald-400">CLUB</span></h1>
        <p className="text-slate-400 text-sm tracking-widest uppercase">Sistema de Gestión de Asociaciones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {staff.map(user => (
          <button
            key={user.id}
            onClick={() => handleUserClick(user)}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center transition-all group shadow-xl hover:-translate-y-1"
          >
            <div className="relative mb-6">
              <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full object-cover border-4 border-slate-600 group-hover:border-emerald-500 transition-colors shadow-lg" />
              <div className="absolute -bottom-3 -right-3 bg-slate-900 p-3 rounded-full border border-slate-700">
                {getRoleIcon(user.role)}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{user.name}</h3>
            <span className={`text-sm px-4 py-1.5 rounded-full font-bold uppercase tracking-wider
              ${user.role === 'ADMIN' ? 'bg-emerald-900/50 text-emerald-400' : ''}
              ${user.role === 'INVENTORY' ? 'bg-indigo-900/50 text-indigo-400' : ''}
              ${user.role === 'SALES' ? 'bg-amber-900/50 text-amber-400' : ''}
            `}>
              {getRoleLabel(user.role)}
            </span>
          </button>
        ))}
      </div>
      
      <p className="mt-12 text-slate-500 text-sm">v1.3 - Acceso Restringido</p>

      {/* Password Modal Overlay */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl border border-slate-600 p-8 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center mb-6">
              <img src={selectedUser.avatar} alt={selectedUser.name} className="w-24 h-24 rounded-full border-4 border-emerald-500 mb-4" />
              <h3 className="text-2xl font-bold text-white">Hola, {selectedUser.name}</h3>
              <p className="text-slate-400 text-sm">Introduce tu contraseña para continuar</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3.5 text-slate-500" size={20} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Contraseña"
                  className={`w-full bg-slate-900 border rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2
                    ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-slate-600 focus:ring-emerald-500/50 focus:border-emerald-500'}
                  `}
                  autoFocus
                />
              </div>
              
              {error && (
                <p className="text-red-400 text-sm text-center font-medium animate-pulse">
                  Contraseña incorrecta
                </p>
              )}

              <button 
                onClick={handlePasswordSubmit}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
              >
                Acceder <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};