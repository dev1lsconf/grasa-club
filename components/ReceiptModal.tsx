import React from 'react';
import { Transaction } from '../types';
import { Printer, X, CheckCircle } from 'lucide-react';

interface Props {
  transaction: Transaction;
  onClose: () => void;
}

export const ReceiptModal: React.FC<Props> = ({ transaction, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt-content, #receipt-content * {
              visibility: visible;
            }
            #receipt-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
              background-color: white;
              color: black;
              border: none;
              box-shadow: none;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      
      <div className="bg-white text-slate-900 rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header - No Print */}
        <div className="bg-emerald-600 p-4 flex justify-between items-center text-white no-print">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle /> Venta Exitosa
          </div>
          <button onClick={onClose} className="hover:bg-emerald-700 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Printable Content */}
        <div id="receipt-content" className="p-8 font-mono text-sm overflow-y-auto bg-white">
          <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
            <div className="text-3xl font-black mb-2 tracking-tighter">GRASA CLUB</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">Asociación Cannábica</div>
            <div className="text-sm text-slate-600">C/ Ejemplo, 123 - Ciudad</div>
            <div className="text-sm text-slate-600">NIF: G-12345678</div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-2">
              <div className="text-xs text-slate-500 uppercase font-bold">Detalles de Transacción</div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-600">Fecha:</span>
                <span className="font-bold">{new Date(transaction.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-600">Ticket ID:</span>
                <span className="font-mono">#{transaction.id.slice(0, 8)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-slate-500 uppercase font-bold">Datos del Socio</div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <span className="text-slate-600">Nombre:</span>
                <span className="font-bold text-right">{transaction.memberName}</span>
              </div>
            </div>
          </div>

          <table className="w-full text-left mb-6">
            <thead>
              <tr className="text-xs text-slate-500 border-b-2 border-slate-900 uppercase tracking-wider">
                <th className="pb-3 pt-2">Cant.</th>
                <th className="pb-3 pt-2 w-1/2">Producto</th>
                <th className="pb-3 pt-2 text-right">Precio Unit.</th>
                <th className="pb-3 pt-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transaction.items?.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  <td className="py-3 align-top font-bold text-slate-700">{item.quantity}</td>
                  <td className="py-3 align-top">{item.productName}</td>
                  <td className="py-3 text-right align-top text-slate-600">€{item.priceAtSale}</td>
                  <td className="py-3 text-right align-top font-bold">€{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
             <div className="w-1/2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex justify-between items-end text-2xl font-black text-slate-900">
                  <span>TOTAL</span>
                  <span>€{transaction.amount.toFixed(2)}</span>
                </div>
             </div>
          </div>

          <div className="text-center text-xs text-slate-400 mt-12 border-t border-slate-200 pt-4">
            <p className="mb-2 font-bold text-slate-500">GRACIAS POR SU APORTACIÓN</p>
            <p>Este documento certifica la retirada de productos para consumo personal e intransferible en el ámbito privado de la asociación.</p>
          </div>
        </div>

        {/* Footer Actions - No Print */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3 no-print">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition-colors"
          >
            Cerrar
          </button>
          <div className="flex-1"></div>
          <button 
            onClick={handlePrint}
            className="px-8 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <Printer size={18} /> Imprimir Recibo
          </button>
        </div>
      </div>
    </div>
  );
};