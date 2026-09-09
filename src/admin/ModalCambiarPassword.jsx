import { useState } from 'react';
import { X, KeyRound, Lock } from 'lucide-react';

export default function ModalCambiarPassword({
  isOpen,
  onClose,
  token,
  showToast,
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña.');
      }

      showToast('Contraseña actualizada correctamente', 'success');
      setCurrentPassword('');
      setNewPassword('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 className="modal-title">Cambiar Contraseña</h2>
            <p className="modal-description">Actualiza tu clave de acceso al panel administrativo.</p>
          </div>
          <button
            type="button"
            className="btn-shadcn btn-ghost btn-icon"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="curr_pass">Contraseña Actual</label>
            <div style={{ position: 'relative' }}>
              <input
                id="curr_pass"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoFocus
              />
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#71717a',
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new_pass">Nueva Contraseña (Mínimo 6 caracteres)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="new_pass"
                type="password"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
              <KeyRound
                size={16}
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#71717a',
                }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-shadcn btn-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-shadcn btn-primary"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
