import { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, RotateCcw, Check, Sparkles, Tag } from 'lucide-react';

const DEFAULT_MENSAJE =
  '¡Hola {familia}! 💍✨ Nos hace una inmensa ilusión compartir con ustedes el día de nuestra boda. Tienen reservado(s) {asientos} espacio(s). Por favor vean todos los detalles y confirmen su asistencia en el siguiente enlace:\n\n{enlace}';

const TAGS_DISPONIBLES = [
  { key: '{familia}', label: 'Nombre de Familia', desc: 'Ej: Familia Quevedo Valencia' },
  { key: '{asientos}', label: 'Asientos Reservados', desc: 'Ej: 2' },
  { key: '{enlace}', label: 'Enlace con Código', desc: 'URL para ver y confirmar' },
  { key: '{codigo}', label: 'Código de Confirmación', desc: 'Código de seguridad' },
];

export default function ModalMensajeWhatsApp({
  isOpen,
  onClose,
  mensajeActual,
  invitaciones = [],
  onSaved,
  token,
  showToast,
}) {
  const [mensaje, setMensaje] = useState(mensajeActual || DEFAULT_MENSAJE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invitacionSeleccionadaIndex, setInvitacionSeleccionadaIndex] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (mensajeActual) {
      setMensaje(mensajeActual);
    } else {
      setMensaje(DEFAULT_MENSAJE);
    }
    setError(null);
  }, [mensajeActual, isOpen]);

  if (!isOpen) return null;

  // Insertar etiqueta en la posición del cursor del textarea
  const handleInsertTag = (tagKey) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMensaje((prev) => prev + ' ' + tagKey);
      return;
    }

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentVal = textarea.value;

    const newVal =
      currentVal.substring(0, startPos) +
      tagKey +
      currentVal.substring(endPos, currentVal.length);

    setMensaje(newVal);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + tagKey.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleResetDefault = () => {
    setMensaje(DEFAULT_MENSAJE);
    showToast('Mensaje restaurado al texto predeterminado', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) {
      setError('El mensaje no puede estar vacío.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mensaje_whatsapp: mensaje.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar plantilla.');
      }

      showToast('Plantilla de WhatsApp actualizada con éxito', 'success');
      if (onSaved) onSaved(mensaje.trim());
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener datos de ejemplo para la simulación en tiempo real
  const invitacionMuestra =
    invitaciones.length > 0 && invitaciones[invitacionSeleccionadaIndex]
      ? invitaciones[invitacionSeleccionadaIndex]
      : {
          nombre_familia: 'Familia Quevedo Valencia',
          numero_asientos: 2,
          codigo_confirmacion: 'ABC-123',
          token_id: 'ejemplo-token-boda',
        };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'https://boda-quevedo-valencia.paulperez.dev';
  const sampleUrl = `${originUrl}/?inv=${invitacionMuestra.token_id}&codigo=${invitacionMuestra.codigo_confirmacion}`;

  // Mensaje renderizado en tiempo real con sustitución de variables
  let mensajeRenderizado = mensaje
    .replaceAll('{familia}', invitacionMuestra.nombre_familia)
    .replaceAll('{asientos}', String(invitacionMuestra.numero_asientos))
    .replaceAll('{codigo}', invitacionMuestra.codigo_confirmacion)
    .replaceAll('{enlace}', sampleUrl);

  if (!mensaje.includes('{enlace}')) {
    mensajeRenderizado += `\n\n${sampleUrl}`;
  }

  // Extraer hora actual formateada para la simulación (ej. 10:45 p. m.)
  const now = new Date();
  const horaSimulada = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-mensaje-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado del Modal */}
        <div className="modal-header">
          <div className="modal-header-info">
            <div className="modal-header-icon-wrapper">
              <MessageSquare size={20} className="modal-header-icon" />
            </div>
            <div>
              <h2 className="modal-title">Plantilla de Mensaje (WhatsApp)</h2>
              <p className="modal-description">
                Personaliza el mensaje automático que se enviará a cada familia. Usa etiquetas dinámicas y observa el resultado en tiempo real.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-shadcn btn-ghost btn-icon"
            onClick={onClose}
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="modal-mensaje-body">
          {/* Columna Izquierda: Editor y Etiquetas */}
          <div className="modal-mensaje-col-editor">
            {/* Gestión de Etiquetas Inteligentes */}
            <div className="tags-management-section">
              <div className="tags-header">
                <span className="tags-title">
                  <Tag size={13} />
                  Etiquetas dinámicas disponibles
                </span>
                <span className="tags-subtitle">Haz clic en una etiqueta para insertarla</span>
              </div>

              <div className="tags-chips-container">
                {TAGS_DISPONIBLES.map((tag) => (
                  <button
                    key={tag.key}
                    type="button"
                    className="tag-chip-btn"
                    onClick={() => handleInsertTag(tag.key)}
                    title={`Insertar ${tag.key}: ${tag.desc}`}
                  >
                    <span className="tag-chip-key">{tag.key}</span>
                    <span className="tag-chip-label">{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Formulario de Edición */}
            <form onSubmit={handleSubmit} className="mensaje-editor-form">
              <div className="form-group">
                <div className="textarea-header-bar">
                  <label htmlFor="mensaje-template-input" className="form-label">
                    Texto del Mensaje
                  </label>
                  <button
                    type="button"
                    className="btn-reset-template"
                    onClick={handleResetDefault}
                    title="Restablecer plantilla inicial recomendada"
                  >
                    <RotateCcw size={12} />
                    Restablecer
                  </button>
                </div>

                <textarea
                  id="mensaje-template-input"
                  ref={textareaRef}
                  className="input-shadcn textarea-mensaje"
                  rows={7}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Escribe el mensaje de WhatsApp..."
                  required
                />

                <div className="textarea-footer-info">
                  <span className="textarea-char-count">
                    {mensaje.length} caracteres
                  </span>
                  <span className="textarea-tag-note">
                    {mensaje.includes('{enlace}') ? (
                      <span className="tag-status-ok">
                        <Check size={12} /> Incluye enlace de confirmación
                      </span>
                    ) : (
                      <span className="tag-status-warn">
                        ⚠️ Se agregará el enlace al final automáticamente
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Selector de Familia de Ejemplo (si hay invitaciones registradas) */}
              {invitaciones.length > 0 && (
                <div className="preview-selector-bar">
                  <label htmlFor="select-sample-inv" className="preview-selector-label">
                    Previsualizar con datos de:
                  </label>
                  <select
                    id="select-sample-inv"
                    className="input-shadcn preview-select"
                    value={invitacionSeleccionadaIndex}
                    onChange={(e) => setInvitacionSeleccionadaIndex(parseInt(e.target.value, 10))}
                  >
                    {invitaciones.slice(0, 15).map((inv, idx) => (
                      <option key={inv.id} value={idx}>
                        {inv.nombre_familia} ({inv.numero_asientos} asientos)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="modal-footer" style={{ marginTop: '1.25rem' }}>
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
                  {loading ? 'Guardando...' : 'Guardar Plantilla'}
                </button>
              </div>
            </form>
          </div>

          {/* Columna Derecha: Vista Previa en Tiempo Real estilo WhatsApp */}
          <div className="modal-mensaje-col-preview">
            <div className="wa-preview-header-label">
              <Sparkles size={14} style={{ color: '#10b981' }} />
              <span>Simulación WhatsApp en Tiempo Real</span>
            </div>

            {/* Contenedor Mockup de Pantalla de WhatsApp */}
            <div className="wa-mockup-window">
              {/* Barra Superior WhatsApp */}
              <div className="wa-mockup-topbar">
                <div className="wa-avatar-circle">
                  <span>💍</span>
                </div>
                <div className="wa-topbar-info">
                  <span className="wa-contact-name">
                    {invitacionMuestra.nombre_familia}
                  </span>
                  <span className="wa-contact-status">en línea</span>
                </div>
              </div>

              {/* Área de Conversación / Mensajes */}
              <div className="wa-chat-canvas">
                <div className="wa-date-pill">HOY</div>

                {/* Burbuja de Mensaje Saliente */}
                <div className="wa-bubble-outgoing">
                  {/* Tarjeta de Previsualización de Enlace Enriquecido */}
                  <div className="wa-link-card-preview">
                    <div className="wa-link-card-image-wrapper">
                      <img
                        src="/A%26D.png"
                        alt="Preview Boda Quevedo Valencia"
                        className="wa-link-card-img"
                        onError={(e) => {
                          e.target.src = '/A&D.png';
                        }}
                      />
                    </div>
                    <div className="wa-link-card-content">
                      <span className="wa-link-card-site">
                        {typeof window !== 'undefined' ? window.location.hostname : 'boda-quevedo-valencia.paulperez.dev'}
                      </span>
                      <h4 className="wa-link-card-title">
                        Boda Quevedo Valencia | Andrea & Daniel
                      </h4>
                      <p className="wa-link-card-desc">
                        Nos hace una inmensa ilusión compartir con ustedes el día de nuestra boda. Andrea & Daniel - 24.10.26.
                      </p>
                    </div>
                  </div>

                  {/* Texto dinámico del mensaje con saltos de línea */}
                  <div className="wa-message-text">
                    {mensajeRenderizado.split('\n').map((parrafo, idx) => (
                      <span key={idx}>
                        {parrafo.startsWith('http://') || parrafo.startsWith('https://') ? (
                          <span className="wa-link-url">{parrafo}</span>
                        ) : (
                          parrafo
                        )}
                        {idx < mensajeRenderizado.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>

                  {/* Metadatos de la burbuja (Hora y doble check azul) */}
                  <div className="wa-bubble-meta">
                    <span className="wa-msg-time">{horaSimulada}</span>
                    <span className="wa-double-check">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
