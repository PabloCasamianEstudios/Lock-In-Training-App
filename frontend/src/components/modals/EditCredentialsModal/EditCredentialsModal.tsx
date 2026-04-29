import { useState, type FC, useEffect } from 'react';
import { X, Lock, Mail, User, Activity } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface EditCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  currentUsername: string;
  currentEmail: string;
  onSuccess: (newUsername: string) => void;
}

const EditCredentialsModal: FC<EditCredentialsModalProps> = ({
  isOpen,
  onClose,
  userId,
  currentUsername,
  currentEmail,
  onSuccess
}) => {
  const [username, setUsername] = useState(currentUsername);
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUsername);
      setEmail(currentEmail);
      setPassword('');
      setError(null);
    }
  }, [isOpen, currentUsername, currentEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (password && password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const dto: any = {};
      if (username !== currentUsername) dto.username = username;
      if (email !== currentEmail) dto.email = email;
      if (password) dto.password = password;

      if (Object.keys(dto).length === 0) {
        onClose();
        setLoading(false);
        return;
      }

      await apiClient(`/api/user/${userId}/credentials`, {
        method: 'PUT',
        body: dto
      });

      onSuccess(username);
      onClose();
    } catch (err: any) {
      setError(err.error || err.message || 'Error updating credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="modal-overlay" onClick={onClose} />
      <div className="w-full max-w-md bg-surface border-4 border-neutral-white shadow-[8px_8px_0px_var(--neutral-white)]">
        <div className="p-4 border-b-4 border-neutral-white flex justify-between items-center bg-neutral-black">
          <h2 className="text-text-main font-black italic uppercase tracking-widest text-xl">
            EDITAR DATOS
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary opacity-50 hover:opacity-100 hover:text-text-main hover:scale-110 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-600 border-2 border-red-500 text-neutral-black p-3 font-black text-xs uppercase tracking-widest italic">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-main font-black italic uppercase text-sm flex items-center gap-2">
              <User className="w-4 h-4" /> USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-neutral-black border-2 border-border p-3 text-text-main font-black uppercase italic focus:border-main outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-main font-black italic uppercase text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" /> EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-neutral-black border-2 border-border p-3 text-text-main font-black uppercase italic focus:border-main outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-main font-black italic uppercase text-sm flex items-center gap-2">
              <Lock className="w-4 h-4" /> NEW PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="DEJAR EN BLANCO PARA NO CAMBIAR"
              className="w-full bg-neutral-black border-2 border-border p-3 text-text-main font-black uppercase italic focus:border-main outline-none transition-colors placeholder:text-text-secondary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-main hover:bg-neutral-white text-neutral-black font-black italic uppercase py-4 border-2 border-transparent hover:border-neutral-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group shadow-[4px_4px_0px_var(--border)]"
          >
            {loading ? <Activity className="w-5 h-5 animate-spin" /> : 'GUARDAR CAMBIOS'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCredentialsModal;
