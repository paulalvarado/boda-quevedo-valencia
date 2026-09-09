import { useState, useEffect, useCallback } from 'react';
import './admin.css';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';

export default function AdminApp() {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('boda_admin_token'));
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Restablecer estilos de body para que el panel no esté recortado ni escalado como la invitación móvil
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalBg = document.body.style.backgroundColor;
    const originalHeight = document.body.style.height;

    document.body.style.overflow = 'auto';
    document.body.style.backgroundColor = '#09090b';
    document.body.style.height = 'auto';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.backgroundColor = originalBg;
      document.body.style.height = originalHeight;
    };
  }, []);

  // Sistema de notificaciones Toast estilo Shadcn
  const showToast = useCallback((message, type = 'default') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Verificar sesión existente
  useEffect(() => {
    const verificarSesion = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setAdmin(data.admin);
        } else {
          localStorage.removeItem('boda_admin_token');
          setToken(null);
          setAdmin(null);
        }
      } catch {
        // Error de red, mantener estado
      } finally {
        setLoading(false);
      }
    };

    verificarSesion();
  }, [token]);

  const handleLoginSuccess = (adminData) => {
    setAdmin(adminData);
    setToken(localStorage.getItem('boda_admin_token'));
    showToast(`Bienvenido/a, ${adminData.nombre || adminData.username}`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('boda_admin_token');
    setToken(null);
    setAdmin(null);
    showToast('Sesión cerrada correctamente');
  };

  if (loading) {
    return (
      <div className="admin-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Cargando panel...</div>
      </div>
    );
  }

  return (
    <>
      {!admin ? (
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      ) : (
        <AdminDashboard
          admin={admin}
          token={token}
          onLogout={handleLogout}
          showToast={showToast}
        />
      )}

      {/* Contenedor de Toasts estilo Shadcn */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </>
  );
}
