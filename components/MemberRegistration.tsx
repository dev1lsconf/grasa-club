import React, { useState, useRef } from 'react';
import { Member } from '../types';
import { Camera, Save, User, X } from 'lucide-react';

interface Props {
  onSave: (member: Member) => void;
  onCancel: () => void;
}

export const MemberRegistration: React.FC<Props> = ({ onSave, onCancel }) => {
  const [fullName, setFullName] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [docType, setDocType] = useState<'DNI' | 'NIE' | 'PASAPORTE'>('DNI');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [docPhotoUrl, setDocPhotoUrl] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [captureTarget, setCaptureTarget] = useState<'PROFILE' | 'DOC' | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async (target: 'PROFILE' | 'DOC') => {
    setCaptureTarget(target);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      alert("No se puede acceder a la cámara. Por favor, revisa los permisos.");
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');

      if (captureTarget === 'PROFILE') {
        setPhotoUrl(dataUrl);
      } else {
        setDocPhotoUrl(dataUrl);
      }
      
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
    setCaptureTarget(null);
  };

  const handleSave = () => {
    if (!fullName || !docNumber || !photoUrl) {
      alert("Por favor completa todos los campos requeridos y toma una foto de perfil.");
      return;
    }

    const newMember: Member = {
      id: crypto.randomUUID(),
      fullName,
      docNumber,
      docType,
      photoUrl,
      docPhotoUrl: docPhotoUrl || '',
      balance: 0,
      joinedDate: new Date().toISOString(),
      active: true
    };

    onSave(newMember);
  };

  return (
    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 max-w-5xl mx-auto shadow-2xl">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-emerald-400">Alta de Nuevo Socio</h2>
          <p className="text-slate-400 text-sm mt-1">Complete la información y capture las imágenes requeridas</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg"><X size={24} /></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Column: Form Fields */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700/50">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><User size={18} className="text-emerald-400"/> Datos Personales</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="Ej. Juan Pérez García"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-slate-400 text-sm mb-1">Documento</label>
                  <select 
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="DNI">DNI</option>
                    <option value="NIE">NIE</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 text-sm mb-1">Número</label>
                  <input 
                    type="text" 
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white uppercase focus:outline-none focus:border-emerald-500"
                    placeholder="12345678X"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Photos */}
        <div className="space-y-6">
           <div className="grid grid-cols-2 gap-4 h-full">
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
              <span className="text-slate-300 font-bold mb-4">Foto de Perfil</span>
              {photoUrl ? (
                <div className="relative group w-full aspect-square max-w-[200px] mb-4">
                  <img src={photoUrl} alt="Profile" className="w-full h-full object-cover rounded-xl border-2 border-emerald-500 shadow-lg" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <button onClick={() => startCamera('PROFILE')} className="text-white font-bold text-sm">Cambiar</button>
                  </div>
                </div>
              ) : (
                <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-600">
                  <User size={64} className="text-slate-500" />
                </div>
              )}
              <button 
                onClick={() => startCamera('PROFILE')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${photoUrl ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
              >
                <Camera size={16} /> {photoUrl ? 'Retomar' : 'Capturar Foto'}
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
               <span className="text-slate-300 font-bold mb-4">Documento ID</span>
               {docPhotoUrl ? (
                <div className="relative group w-full aspect-video mb-4">
                  <img src={docPhotoUrl} alt="Document" className="w-full h-full object-cover rounded-xl border border-slate-500 shadow-lg" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <button onClick={() => startCamera('DOC')} className="text-white font-bold text-sm">Cambiar</button>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-video bg-slate-800 rounded-xl flex items-center justify-center mb-6 border border-slate-600 text-slate-500 text-sm p-4 text-center">
                  Sin imagen del documento
                </div>
              )}
              <button 
                onClick={() => startCamera('DOC')}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full text-sm font-bold transition-colors"
              >
                <Camera size={16} /> Capturar ID
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100]">
          <div className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-2xl">
             <video ref={videoRef} autoPlay className="w-full h-auto" />
             <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
                <button 
                  onClick={stopCamera} 
                  className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg"
                >
                  Cancelar
                </button>
                <button 
                  onClick={capturePhoto} 
                  className="bg-white hover:bg-emerald-100 text-emerald-900 p-4 rounded-full border-4 border-emerald-500 shadow-lg transform active:scale-95 transition-transform"
                >
                  <div className="w-6 h-6 bg-emerald-600 rounded-full"></div>
                </button>
             </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-slate-700 flex justify-end gap-4">
        <button onClick={onCancel} className="px-6 py-3 text-slate-400 hover:text-white font-bold transition-colors">Cancelar</button>
        <button 
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl flex items-center gap-2 font-bold text-lg shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 transition-all transform hover:-translate-y-0.5"
        >
          <Save size={20} /> Registrar Nuevo Socio
        </button>
      </div>
    </div>
  );
};