import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Send,
  Copy,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  LogOut,
  Sliders,
  KeyRound,
  Check,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import ModalNuevaInvitacion from './ModalNuevaInvitacion.jsx';
import ModalCapacidad from './ModalCapacidad.jsx';
import ModalCambiarPassword from './ModalCambiarPassword.jsx';

export default function AdminDashboard({ admin, token, onLogout, showToast }) {
  const [invitaciones, setInvitaciones] = useState([]);
  const [metrics, setMetrics] = useState({
    total_asientos_evento: 150,
    asientos_asignados: 0,
    asientos_confirmados: 0,
    asientos_disponibles: 150,
    total_invitaciones: 0,
    invitaciones_enviadas: 0,
    invitaciones_confirmadas: 0,
    invitaciones_pendientes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('todas');

  // Modales
  const [modalInvitacionOpen, setModalInvitacionOpen] = useState(false);
  const [invitacionParaEditar, setInvitacionParaEditar] = useState(null);
  const [modalCapacidadOpen, setModalCapacidadOpen] = useState(false);
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [invitacionParaEliminar, setInvitacionParaEliminar] = useState(null);
  const [copiandoId, setCopiandoId] = useState(null);
  const [enviandoId, setEnviandoId] = useState(null);

  // Cargar métricas y listado de invitaciones
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [resConfig, resInvs] = await Promise.all([
        fetch('/api/config', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/invitaciones', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (resConfig.ok) {
        const dataConfig = await resConfig.json();
        if (dataConfig.metrics) setMetrics(dataConfig.metrics);
      }

      if (resInvs.ok) {
        const dataInvs = await resInvs.json();
        setInvitaciones(dataInvs.invitaciones || []);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      showToast('Error al conectar con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Enviar invitación por WhatsApp (actualiza a 'enviada' y abre WhatsApp)
  const handleEnviarWhatsApp = async (inv) => {
    try {
      setEnviandoId(inv.id);
      const baseUrl = window.location.origin;

      const res = await fetch(`/api/invitaciones/${inv.id}/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ baseUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar envío.');
      }

      // Actualizar invitación en el estado local
      setInvitaciones((prev) =>
        prev.map((item) => (item.id === inv.id ? data.invitacion : item))
      );

      // Abrir enlace de WhatsApp en pestaña nueva
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      showToast(`¡Invitación enviada para ${inv.nombre_familia}!`, 'success');
      cargarDatos(); // Recargar métricas
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setEnviandoId(null);
    }
  };

  // Copiar enlace con código de confirmación
  const handleCopiarEnlace = (inv) => {
    const url = `${window.location.origin}/?inv=${inv.token_id}&codigo=${inv.codigo_confirmacion}`;
    navigator.clipboard.writeText(url);
    setCopiandoId(inv.id);
    showToast('Enlace con código copiado al portapapeles', 'success');
    setTimeout(() => setCopiandoId(null), 2000);
  };

  // Confirmar eliminación de invitación
  const handleEliminarInvitacion = async () => {
    if (!invitacionParaEliminar) return;

    try {
      const res = await fetch(`/api/invitaciones/${invitacionParaEliminar.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Error al eliminar la invitación');
      }

      setInvitaciones((prev) => prev.filter((item) => item.id !== invitacionParaEliminar.id));
      showToast('Invitación eliminada correctamente', 'success');
      setInvitacionParaEliminar(null);
      cargarDatos();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Filtrado de invitaciones
  const invitacionesFiltradas = useMemo(() => {
    return invitaciones.filter((inv) => {
      const matchesSearch =
        inv.nombre_familia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.telefono.includes(searchTerm);

      if (!matchesSearch) return false;
      if (selectedTab === 'todas') return true;
      return inv.estado === selectedTab;
    });
  }, [invitaciones, searchTerm, selectedTab]);

  // Contadores para las pestañas
  const counts = useMemo(() => {
    return {
      todas: invitaciones.length,
      pendiente: invitaciones.filter((i) => i.estado === 'pendiente').length,
      enviada: invitaciones.filter((i) => i.estado === 'enviada').length,
      confirmada: invitaciones.filter((i) => i.estado === 'confirmada').length,
    };
  }, [invitaciones]);

  const porcentajeOcupacion = Math.min(
    100,
    Math.round((metrics.asientos_asignados / (metrics.total_asientos_evento || 1)) * 100)
  );

  const porcentajeConfirmados = Math.min(
    100,
    metrics.asientos_asignados > 0
      ? Math.round((metrics.asientos_confirmados / metrics.asientos_asignados) * 100)
      : 0
  );

  return (
    <div className="admin-root">
      {/* ── Barra Superior ── */}
      <nav className="admin-navbar">
        <div className="admin-navbar-inner">
          <div className="admin-brand">
            <span className="admin-brand-title">Boda Quevedo Valencia</span>
            <span className="admin-brand-badge">{admin?.nombre || 'Admin'}</span>
          </div>

          <div className="admin-nav-actions">
            <a
              href={invitaciones.length > 0 ? `/?inv=${invitaciones[0].token_id}&codigo=${invitaciones[0].codigo_confirmacion}` : '/'}
              target="_blank"
              rel="noreferrer"
              className="btn-shadcn btn-outline btn-sm"
              title="Abrir invitación con asientos asignados en nueva pestaña"
            >
              <ExternalLink size={14} />
              <span>Ver Invitación</span>
            </a>

            <button
              type="button"
              className="btn-shadcn btn-outline btn-sm"
              onClick={() => setModalCapacidadOpen(true)}
              title="Ajustar capacidad total de asientos"
            >
              <Sliders size={14} />
              <span style={{ display: 'none' }} className="d-md-inline">Capacidad</span>
            </button>

            <button
              type="button"
              className="btn-shadcn btn-outline btn-sm"
              onClick={() => setModalPasswordOpen(true)}
              title="Cambiar contraseña"
            >
              <KeyRound size={14} />
            </button>

            <button
              type="button"
              className="btn-shadcn btn-ghost btn-sm"
              onClick={onLogout}
              title="Cerrar sesión"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Contenedor Principal ── */}
      <main className="admin-container">
        {/* ── Tarjetas de Métricas (Vercel Style) ── */}
        <div className="metrics-grid">
          {/* Capacidad Total */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Capacidad Total</span>
              <Sliders size={16} className="metric-icon" />
            </div>
            <div className="metric-value">{metrics.total_asientos_evento}</div>
            <div className="metric-subtext">
              {metrics.asientos_disponibles} asientos aún disponibles
            </div>
            <div className="metric-progress">
              <div
                className="metric-progress-bar"
                style={{ width: `${porcentajeOcupacion}%` }}
              />
            </div>
          </div>

          {/* Asientos Asignados */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Asientos Asignados</span>
              <Users size={16} className="metric-icon" />
            </div>
            <div className="metric-value">{metrics.asientos_asignados}</div>
            <div className="metric-subtext">
              {porcentajeOcupacion}% del cupo del evento
            </div>
            <div className="metric-progress">
              <div
                className="metric-progress-bar"
                style={{ width: `${porcentajeOcupacion}%` }}
              />
            </div>
          </div>

          {/* Asientos Confirmados */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Asientos Confirmados</span>
              <CheckCircle2 size={16} className="metric-icon" style={{ color: '#10b981' }} />
            </div>
            <div className="metric-value" style={{ color: '#34d399' }}>
              {metrics.asientos_confirmados}
            </div>
            <div className="metric-subtext">
              {porcentajeConfirmados}% de los asientos asignados
            </div>
            <div className="metric-progress">
              <div
                className="metric-progress-bar success"
                style={{ width: `${porcentajeConfirmados}%` }}
              />
            </div>
          </div>

          {/* Total Invitaciones */}
          <div className="metric-card">
            <div className="metric-header">
              <span className="metric-label">Invitaciones</span>
              <TrendingUp size={16} className="metric-icon" />
            </div>
            <div className="metric-value">{invitaciones.length}</div>
            <div className="metric-subtext">
              {counts.confirmada} confirmadas • {counts.enviada} enviadas • {counts.pendiente} pendientes
            </div>
            <div className="metric-progress">
              <div
                className="metric-progress-bar"
                style={{
                  width: `${invitaciones.length > 0 ? (counts.confirmada / invitaciones.length) * 100 : 0}%`,
                  backgroundColor: '#34d399',
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Barra de Búsqueda, Filtros y Creación ── */}
        <div className="actions-bar">
          <div className="actions-filters">
            {/* Buscador */}
            <div className="search-input-wrapper">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                className="input-shadcn"
                placeholder="Buscar por familia o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Pestañas de Filtro (shadcn Tabs) */}
            <div className="tabs-list">
              <button
                type="button"
                className={`tab-trigger ${selectedTab === 'todas' ? 'active' : ''}`}
                onClick={() => setSelectedTab('todas')}
              >
                Todas <span className="tab-count">{counts.todas}</span>
              </button>
              <button
                type="button"
                className={`tab-trigger ${selectedTab === 'pendiente' ? 'active' : ''}`}
                onClick={() => setSelectedTab('pendiente')}
              >
                Pendientes <span className="tab-count">{counts.pendiente}</span>
              </button>
              <button
                type="button"
                className={`tab-trigger ${selectedTab === 'enviada' ? 'active' : ''}`}
                onClick={() => setSelectedTab('enviada')}
              >
                Enviadas <span className="tab-count">{counts.enviada}</span>
              </button>
              <button
                type="button"
                className={`tab-trigger ${selectedTab === 'confirmada' ? 'active' : ''}`}
                onClick={() => setSelectedTab('confirmada')}
              >
                Confirmadas <span className="tab-count">{counts.confirmada}</span>
              </button>
            </div>
          </div>

          {/* Botón Nueva Invitación */}
          <button
            type="button"
            className="btn-shadcn btn-primary"
            onClick={() => {
              setInvitacionParaEditar(null);
              setModalInvitacionOpen(true);
            }}
          >
            <Plus size={16} />
            Nueva Invitación
          </button>
        </div>

        {/* ── Vista de Tabla (Escritorio) ── */}
        <div className="table-wrapper table-desktop-view">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Familia / Invitado</th>
                  <th>Asientos</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Envío / Confirmación</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>
                      Cargando invitaciones...
                    </td>
                  </tr>
                ) : invitacionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>
                      No se encontraron invitaciones con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  invitacionesFiltradas.map((inv) => {
                    const urlInvitacion = `${window.location.origin}/?inv=${inv.token_id}&codigo=${inv.codigo_confirmacion}`;

                    return (
                      <tr key={inv.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fafafa' }}>
                            {inv.nombre_familia}
                          </div>
                          {inv.notas && (
                            <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.15rem' }}>
                              {inv.notas}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge-seats">
                            {inv.numero_asientos} {inv.numero_asientos === 1 ? 'asiento' : 'asientos'}
                          </span>
                        </td>
                        <td>
                          <a
                            href={`tel:${inv.telefono}`}
                            style={{ color: '#a1a1aa', textDecoration: 'none' }}
                          >
                            {inv.telefono}
                          </a>
                        </td>
                        <td>
                          <span className={`badge-status badge-${inv.estado}`}>
                            {inv.estado === 'confirmada' && <CheckCircle2 size={12} />}
                            {inv.estado === 'enviada' && <Send size={12} />}
                            {inv.estado === 'pendiente' && <Clock size={12} />}
                            {inv.estado.charAt(0).toUpperCase() + inv.estado.slice(1)}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>
                          {inv.fecha_confirmacion ? (
                            <span style={{ color: '#34d399' }}>
                              Confirmó: {new Date(inv.fecha_confirmacion).toLocaleDateString()}
                            </span>
                          ) : inv.fecha_envio ? (
                            <span>Enviada: {new Date(inv.fecha_envio).toLocaleDateString()}</span>
                          ) : (
                            <span style={{ color: '#71717a' }}>No enviada</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                            {/* Enviar WhatsApp */}
                            <button
                              type="button"
                              className="btn-shadcn btn-whatsapp btn-sm"
                              onClick={() => handleEnviarWhatsApp(inv)}
                              disabled={enviandoId === inv.id}
                              title="Enviar invitación por WhatsApp"
                            >
                              <Send size={13} />
                              {enviandoId === inv.id ? '...' : 'WhatsApp'}
                            </button>

                            {/* Copiar Enlace con Código */}
                            <button
                              type="button"
                              className="btn-shadcn btn-outline btn-sm btn-icon"
                              onClick={() => handleCopiarEnlace(inv)}
                              title="Copiar enlace con código de confirmación"
                            >
                              {copiandoId === inv.id ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                            </button>

                            {/* Previsualizar */}
                            <a
                              href={urlInvitacion}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-shadcn btn-outline btn-sm"
                              title="Ver cómo ve el invitado su invitación con sus asientos"
                            >
                              <ExternalLink size={13} />
                              Ver Invitación
                            </a>

                            {/* Editar */}
                            <button
                              type="button"
                              className="btn-shadcn btn-outline btn-sm btn-icon"
                              onClick={() => {
                                setInvitacionParaEditar(inv);
                                setModalInvitacionOpen(true);
                              }}
                              title="Editar datos"
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Eliminar */}
                            <button
                              type="button"
                              className="btn-shadcn btn-destructive btn-sm btn-icon"
                              onClick={() => setInvitacionParaEliminar(inv)}
                              title="Eliminar invitación"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Vista de Tarjetas (Móvil / Tablet) ── */}
        <div className="cards-mobile-view">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>
              Cargando invitaciones...
            </div>
          ) : invitacionesFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#71717a' }}>
              No se encontraron invitaciones.
            </div>
          ) : (
            invitacionesFiltradas.map((inv) => {
              const urlInvitacion = `${window.location.origin}/?inv=${inv.token_id}&codigo=${inv.codigo_confirmacion}`;

              return (
                <div key={inv.id} className="invitacion-card-mobile">
                  <div className="card-mobile-top">
                    <div>
                      <div className="card-mobile-title">{inv.nombre_familia}</div>
                      {inv.notas && (
                        <div style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.2rem' }}>
                          {inv.notas}
                        </div>
                      )}
                    </div>
                    <span className={`badge-status badge-${inv.estado}`}>
                      {inv.estado === 'confirmada' && <CheckCircle2 size={12} />}
                      {inv.estado === 'enviada' && <Send size={12} />}
                      {inv.estado === 'pendiente' && <Clock size={12} />}
                      {inv.estado.charAt(0).toUpperCase() + inv.estado.slice(1)}
                    </span>
                  </div>

                  <div className="card-mobile-meta">
                    <span className="badge-seats">
                      {inv.numero_asientos} {inv.numero_asientos === 1 ? 'asiento' : 'asientos'}
                    </span>
                    <a href={`tel:${inv.telefono}`} style={{ color: '#a1a1aa', textDecoration: 'none' }}>
                      {inv.telefono}
                    </a>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#71717a' }}>
                    {inv.fecha_confirmacion ? (
                      <span style={{ color: '#34d399' }}>
                        Confirmó: {new Date(inv.fecha_confirmacion).toLocaleDateString()}
                      </span>
                    ) : inv.fecha_envio ? (
                      <span>Enviada: {new Date(inv.fecha_envio).toLocaleDateString()}</span>
                    ) : (
                      <span>No enviada aún</span>
                    )}
                  </div>

                  <div className="card-mobile-actions">
                    <button
                      type="button"
                      className="btn-shadcn btn-whatsapp btn-sm"
                      onClick={() => handleEnviarWhatsApp(inv)}
                      disabled={enviandoId === inv.id}
                    >
                      <Send size={14} />
                      {enviandoId === inv.id ? 'Enviando...' : 'WhatsApp'}
                    </button>

                    <button
                      type="button"
                      className="btn-shadcn btn-outline btn-sm"
                      onClick={() => handleCopiarEnlace(inv)}
                    >
                      {copiandoId === inv.id ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      Copiar
                    </button>

                    <a
                      href={urlInvitacion}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-shadcn btn-outline btn-sm btn-icon"
                      title="Ver invitación"
                    >
                      <ExternalLink size={14} />
                    </a>

                    <button
                      type="button"
                      className="btn-shadcn btn-outline btn-sm btn-icon"
                      onClick={() => {
                        setInvitacionParaEditar(inv);
                        setModalInvitacionOpen(true);
                      }}
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      className="btn-shadcn btn-destructive btn-sm btn-icon"
                      onClick={() => setInvitacionParaEliminar(inv)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* ── Modal Crear / Editar Invitación ── */}
      <ModalNuevaInvitacion
        isOpen={modalInvitacionOpen}
        onClose={() => setModalInvitacionOpen(false)}
        onSaved={cargarDatos}
        invitacionParaEditar={invitacionParaEditar}
        token={token}
        showToast={showToast}
      />

      {/* ── Modal Ajustar Capacidad Total ── */}
      <ModalCapacidad
        isOpen={modalCapacidadOpen}
        onClose={() => setModalCapacidadOpen(false)}
        capacidadActual={metrics.total_asientos_evento}
        onSaved={cargarDatos}
        token={token}
        showToast={showToast}
      />

      {/* ── Modal Cambiar Contraseña ── */}
      <ModalCambiarPassword
        isOpen={modalPasswordOpen}
        onClose={() => setModalPasswordOpen(false)}
        token={token}
        showToast={showToast}
      />

      {/* ── Diálogo Confirmar Eliminación ── */}
      {invitacionParaEliminar && (
        <div className="modal-overlay" onClick={() => setInvitacionParaEliminar(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={20} style={{ color: '#f87171' }} />
                ¿Eliminar invitación?
              </h3>
              <p className="modal-description" style={{ marginTop: '0.5rem' }}>
                Estás a punto de eliminar la invitación de la{' '}
                <strong>{invitacionParaEliminar.nombre_familia}</strong> ({invitacionParaEliminar.numero_asientos} asientos). Esta acción liberará los asientos en el evento y no se puede deshacer.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-shadcn btn-outline"
                onClick={() => setInvitacionParaEliminar(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-shadcn btn-destructive"
                onClick={handleEliminarInvitacion}
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
