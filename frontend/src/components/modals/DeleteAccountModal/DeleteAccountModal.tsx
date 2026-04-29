import { useState, type FC } from 'react';
import { X, AlertTriangle, Activity } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSuccess: () => void;
}

const DeleteAccountModal: FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiClient(`/api/user/${userId}`, {
        method: 'DELETE'
      });
      onSuccess();
    } catch (err: any) {
      setError(err.error || err.message || 'Error deleting account');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-zinc-900 border-4 border-red-600 shadow-[8px_8px_0px_#dc2626]">
        <div className="p-4 border-b-4 border-red-600 flex justify-between items-center bg-black">
          <h2 className="text-red-600 font-black italic uppercase tracking-widest text-xl flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" /> ADVERTENCIA
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-white/50 hover:text-white hover:scale-110 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto animate-pulse" />

          <div className="space-y-2 text-white">
            <p className="font-black italic uppercase text-xl">¿ESTÁS SEGURO?</p>
            <p className="text-white/60 text-sm italic font-black uppercase tracking-widest">
              ESTA ACCIÓN ELIMINARÁ TU CUENTA Y TODOS TUS PROGRESOS, ESTADÍSTICAS Y MISIONES DE FORMA PERMANENTE.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border-2 border-red-500 text-red-500 p-3 font-black text-xs uppercase tracking-widest italic">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-black italic uppercase py-4 border-2 border-transparent hover:border-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? <Activity className="w-5 h-5 animate-spin" /> : 'SÍ, ELIMINAR CUENTA'}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full bg-transparent hover:bg-white/10 text-white/50 hover:text-white font-black italic uppercase py-4 border-2 border-white/20 hover:border-white/50 transition-all"
            >
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
