import { useState, useEffect } from 'react';
import { X, Sliders } from 'lucide-react';

export default function ModalCapacidad({
  isOpen,
  onClose,
  capacidadActual,
  onSaved,
  token,
  showToast,
}) {
  const [capacidad, setCapacidad] = useState(capacidadActual || 150);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCapacidad(capacidadActual || 150);
    setError(null);
  }, [capacidadActual, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ total_asientos_evento: parseInt(capacidad, 10) }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al actualizar capacidad.');
      }

      showToast('Capacidad total actualizada', 'success');
      onSaved(parseInt(capacidad, 10));
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
            <h2 className="modal-title">Capacidad del Evento</h2>
            <p className="modal-description">
              Ajusta el número total de asientos disponibles para la boda.
            </p>
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
          <div className="form-group" id="tour-form-capacidad">
            <label className="form-label" htmlFor="capacidad">
              Número Total de Asientos
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="capacidad"
                type="number"
                min="1"
                max="1000"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                required
                autoFocus
              />
              <Sliders
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
            <p className="form-hint">
              Este valor se utiliza para calcular los asientos restantes y el porcentaje de ocupación.
            </p>
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
              id="tour-btn-guardar-capacidad"
              type="submit"
              className="btn-shadcn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Capacidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
