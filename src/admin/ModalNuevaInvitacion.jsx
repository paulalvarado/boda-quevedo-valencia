import { useState, useEffect } from 'react';
import { X, Users, Phone, Hash, FileText } from 'lucide-react';

export default function ModalNuevaInvitacion({
  isOpen,
  onClose,
  onSaved,
  invitacionParaEditar,
  token,
  showToast,
}) {
  const [nombreFamilia, setNombreFamilia] = useState('');
  const [numeroAsientos, setNumeroAsientos] = useState(2);
  const [telefono, setTelefono] = useState('');
  const [notas, setNotas] = useState('');
  const [estado, setEstado] = useState('pendiente');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (invitacionParaEditar) {
      setNombreFamilia(invitacionParaEditar.nombre_familia || '');
      setNumeroAsientos(invitacionParaEditar.numero_asientos || 1);
      setTelefono(invitacionParaEditar.telefono || '');
      setNotas(invitacionParaEditar.notas || '');
      setEstado(invitacionParaEditar.estado || 'pendiente');
    } else {
      setNombreFamilia('');
      setNumeroAsientos(2);
      setTelefono('');
      setNotas('');
      setEstado('pendiente');
    }
    setError(null);
  }, [invitacionParaEditar, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const isEdit = Boolean(invitacionParaEditar?.id);
    const url = isEdit
      ? `/api/invitaciones/${invitacionParaEditar.id}`
      : '/api/invitaciones';
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      nombre_familia: nombreFamilia.trim(),
      numero_asientos: parseInt(numeroAsientos, 10),
      telefono: telefono.trim(),
      notas: notas.trim(),
    };

    if (isEdit) {
      payload.estado = estado;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar la invitación.');
      }

      showToast(
        isEdit ? 'Invitación actualizada con éxito' : '¡Invitación creada correctamente!',
        'success'
      );
      onSaved(data.invitacion);
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
            <h2 className="modal-title">
              {invitacionParaEditar ? 'Editar Invitación' : 'Nueva Invitación de Boda'}
            </h2>
            <p className="modal-description">
              {invitacionParaEditar
                ? 'Modifica los datos asignados a la familia.'
                : 'Ingresa los datos para generar el enlace con código de confirmación.'}
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
          <div className="form-group">
            <label className="form-label" htmlFor="nombre_familia">
              Nombre de la Familia o Invitado(s) *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="nombre_familia"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Ej. Familia Quevedo Valencia"
                value={nombreFamilia}
                onChange={(e) => setNombreFamilia(e.target.value)}
                required
                autoFocus
              />
              <Users
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="numero_asientos">
                Asientos Disponibles *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="numero_asientos"
                  type="number"
                  min="1"
                  max="20"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={numeroAsientos}
                  onChange={(e) => setNumeroAsientos(e.target.value)}
                  required
                />
                <Hash
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
              <label className="form-label" htmlFor="telefono">
                Teléfono (WhatsApp) *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="telefono"
                  type="tel"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  placeholder="Ej. 50688888888"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
                <Phone
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
          </div>
          <p className="form-hint" style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
            Para WhatsApp incluye el código de país sin signo + (ej. 506 para Costa Rica).
          </p>

          {invitacionParaEditar && (
            <div className="form-group">
              <label className="form-label" htmlFor="estado">Estado de Asistencia</label>
              <select
                id="estado"
                className="form-input"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <option value="pendiente">Pendiente</option>
                <option value="enviada">Enviada</option>
                <option value="confirmada">Confirmada</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="notas">Notas Internas (Opcional)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="notas"
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
                placeholder="Ej. Amigos de la universidad, mesa de honor"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
              />
              <FileText
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
              {loading ? 'Guardando...' : (invitacionParaEditar ? 'Guardar Cambios' : 'Crear Invitación')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
