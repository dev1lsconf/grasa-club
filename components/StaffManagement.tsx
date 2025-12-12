import React, { useState } from 'react';
import { StaffUser, Role } from '../types';
import { ShieldCheck, Package, ShoppingBag, Edit2, Trash2, Plus, X, Save, KeyRound } from 'lucide-react';

interface Props {
  staff: StaffUser[];
  onAdd: (user: StaffUser) => void;
  onUpdate: (user: StaffUser) => void;
  onDelete: (id: string) => void;
}

export const StaffManagement: React.FC<Props> = ({ staff, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('SALES');
  const [password, setPassword] = useState('');

  const resetForm = () => {
    setName('');
    setRole('SALES');
    setPassword('');
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (user: StaffUser) => {
    setEditingUser(user);
    setName(user.name);
    setRole(user.role);
    setPassword(user.password);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!name || !password) {
      alert("El nombre y la contraseña son obligatorios.");
      return;
    }

    if (editingUser) {
      // Update existing
      onUpdate({
        ...editingUser,
        name,
        role,
        password
      });
    } else {
      // Create new
      const newUser: StaffUser = {
        id: crypto.randomUUID(),
        name,
        role,
        password,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };
      onAdd(newUser);
    }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      onDelete(id);
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'ADMIN': return <ShieldCheck className="text-emerald-400" size={18} />;
      case 'INVENTORY': return <Package className="text-indigo-400" size={18} />;
      case 'SALES': return <ShoppingBag className="text-amber-400" size={18} />;
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'INVENTORY': return 'Almacén / Inventario';
      case 'SALES': return 'Vendedor';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Gestión del Equipo</h2>
        <button 
          onClick={openAddModal}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Plus size={20} /> Nuevo Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(user => (
          <div key={user.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-4 group hover:border-emerald-500 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border-2 border-slate-600" />
                <div>
                  <h3 className="font-bold text-white text-lg">{user.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-slate-400">
                    {getRoleIcon(user.role)}
                    {getRoleLabel(user.role)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded text-sm text-slate-400 font-mono">
              <KeyRound size={14} />
              <span className="opacity-50">Contraseña:</span> {user.password}
            </div>

            <div className="pt-4 border-t border-slate-700 flex justify-end gap-2 mt-auto">
              <button 
                onClick={() => openEditModal(user)}
                className="p-2 hover:bg-slate-700 rounded-lg text-blue-400 hover:text-white transition-colors"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              {staff.length > 1 && (
                <button 
                  onClick={() => handleDelete(user.id)}
                  className="p-2 hover:bg-red-900/30 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 w-full max-w-md shadow-2xl relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-white mb-6">
              {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Nombre y Apellido</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded p-3 text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Rol / Permisos</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setRole('SALES')}
                    className={`flex items-center gap-3 p-3 rounded border text-left transition-colors ${role === 'SALES' ? 'bg-amber-900/20 border-amber-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'}`}
                  >
                    <ShoppingBag className={role === 'SALES' ? 'text-amber-400' : 'text-slate-500'} />
                    <div>
                      <div className="font-bold text-sm">Vendedor</div>
                      <div className="text-xs opacity-70">Acceso a TPV y Socios</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setRole('INVENTORY')}
                    className={`flex items-center gap-3 p-3 rounded border text-left transition-colors ${role === 'INVENTORY' ? 'bg-indigo-900/20 border-indigo-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'}`}
                  >
                    <Package className={role === 'INVENTORY' ? 'text-indigo-400' : 'text-slate-500'} />
                    <div>
                      <div className="font-bold text-sm">Encargado de Inventario</div>
                      <div className="text-xs opacity-70">Control de stock y productos</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setRole('ADMIN')}
                    className={`flex items-center gap-3 p-3 rounded border text-left transition-colors ${role === 'ADMIN' ? 'bg-emerald-900/20 border-emerald-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'}`}
                  >
                    <ShieldCheck className={role === 'ADMIN' ? 'text-emerald-400' : 'text-slate-500'} />
                    <div>
                      <div className="font-bold text-sm">Administrador</div>
                      <div className="text-xs opacity-70">Acceso total al sistema</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-1">Contraseña</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded p-3 pl-10 text-white focus:border-emerald-500 focus:outline-none font-mono"
                    placeholder="Contraseña de acceso"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button onClick={resetForm} className="flex-1 py-3 text-slate-400 hover:text-white">Cancelar</button>
                <button 
                  onClick={handleSave}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
