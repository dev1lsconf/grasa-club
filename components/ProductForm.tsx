import React, { useState } from 'react';
import { Product, ProductType } from '../types';
import { X, Save, Leaf, Droplet, Cookie, Box, GlassWater } from 'lucide-react';

interface Props {
  onSave: (product: Product) => void;
  onCancel: () => void;
  initialData?: Product;
}

export const ProductForm: React.FC<Props> = ({ onSave, onCancel, initialData }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<ProductType>(initialData?.type || ProductType.FLOWER);
  const [strainType, setStrainType] = useState<'Indica' | 'Sativa' | 'Híbrida'>(initialData?.strainType || 'Híbrida');
  const [thc, setThc] = useState(initialData?.thcContent?.toString() || '');
  const [cbd, setCbd] = useState(initialData?.cbdContent?.toString() || '');
  const [stock, setStock] = useState(initialData?.stockGrams?.toString() || '');
  const [price, setPrice] = useState(initialData?.pricePerGram?.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = () => {
    if (!name || !stock || !price) {
      alert('Nombre, Stock y Precio son obligatorios');
      return;
    }

    const newProduct: Product = {
      id: initialData?.id || crypto.randomUUID(),
      name,
      type,
      stockGrams: parseFloat(stock),
      pricePerGram: parseFloat(price),
      description,
      strainType: type === ProductType.FLOWER ? strainType : undefined,
      thcContent: thc ? parseFloat(thc) : undefined,
      cbdContent: cbd ? parseFloat(cbd) : undefined,
    };

    onSave(newProduct);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-4xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <h2 className="text-3xl font-bold text-white">
            {initialData ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-slate-400 text-sm font-bold mb-2">Nombre del Producto</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Ej. Blue Dream"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-sm font-bold mb-2">Tipo de Producto</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: ProductType.FLOWER, icon: Leaf, label: 'Flor' },
                  { id: ProductType.EXTRACT, icon: Droplet, label: 'Extracto' },
                  { id: ProductType.EDIBLE, icon: Cookie, label: 'Comestible' },
                  { id: ProductType.ACCESSORY, icon: Box, label: 'Accesorio' },
                  { id: ProductType.DRINK, icon: GlassWater, label: 'Bebida' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
                      type === t.id 
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg scale-105' 
                        : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600 hover:text-white'
                    }`}
                  >
                    <t.icon size={20} /> <span className="text-xs font-bold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {type === ProductType.FLOWER && (
               <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                <label className="block text-slate-400 text-sm font-bold mb-2">Variedad (Genética)</label>
                <div className="flex gap-2">
                  {['Sativa', 'Indica', 'Híbrida'].map((st) => (
                     <button
                      key={st}
                      onClick={() => setStrainType(st as any)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${
                        strainType === st 
                        ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500' 
                        : 'bg-slate-800 text-slate-400 border-slate-600 hover:bg-slate-700'
                      }`}
                     >
                       {st}
                     </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
               <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">Stock Inicial</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none text-right pr-12 font-mono text-lg"
                    placeholder="0.0"
                  />
                  <span className="absolute right-3 top-3.5 text-slate-500 text-sm font-bold">
                    {type === ProductType.FLOWER || type === ProductType.EXTRACT ? 'g' : 'ud'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">Precio de Venta</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none text-right pr-12 font-mono text-lg"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-3.5 text-slate-500 text-sm font-bold">€</span>
                </div>
              </div>
            </div>

             <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">% THC</label>
                <input 
                  type="number" 
                  value={thc}
                  onChange={(e) => setThc(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">% CBD</label>
                <input 
                  type="number" 
                  value={cbd}
                  onChange={(e) => setCbd(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="0"
                />
              </div>
             </div>

             <div>
                <label className="block text-slate-400 text-sm font-bold mb-2">Descripción</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-32 bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:border-emerald-500 focus:outline-none resize-none"
                  placeholder="Describe el aroma, efectos, terpenos..."
                />
              </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-slate-700">
          <button onClick={onCancel} className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-colors">Cancelar</button>
          <button 
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold text-lg shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 transition-all transform hover:-translate-y-0.5"
          >
            <Save size={20} /> Guardar Producto
          </button>
        </div>
      </div>
    </div>
  );
};