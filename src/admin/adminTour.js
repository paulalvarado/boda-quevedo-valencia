import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STORAGE_KEY = 'boda_admin_tour_seen';

/**
 * Inicia el tour interactivo con Driver.js
 * @param {boolean} forzar - Si es true, inicia el tour aunque el usuario ya lo haya visto antes
 */
export function iniciarGuia(forzar = false) {
  if (!forzar) {
    const yaVisto = localStorage.getItem(TOUR_STORAGE_KEY);
    if (yaVisto === 'true') {
      return;
    }
  }

  // Verificar qué elemento de lista usar (primera tarjeta/fila o contenedor general)
  const existeElementoInvitacion = document.querySelector('#tour-invitacion-item');
  const targetLista = existeElementoInvitacion ? '#tour-invitacion-item' : '#tour-list-container';

  const steps = [
    {
      element: '#tour-brand',
      popover: {
        title: '¡Bienvenido al Panel de Invitaciones! 💍',
        description:
          'Aquí puedes gestionar todas las familias invitadas, controlar los cupos de asientos y enviar las invitaciones personalizadas por WhatsApp de forma automática.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#tour-metrics',
      popover: {
        title: '📊 Control de Asientos y Cupos',
        description:
          'Monitorea en tiempo real la <b>Capacidad Total</b> del evento, los asientos que ya has asignado y los confirmados. Las barras te mostrarán el porcentaje de ocupación.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: '#tour-btn-capacidad',
      popover: {
        title: '⚙️ Ajustar Capacidad del Evento',
        description:
          'Haz clic aquí si necesitas ampliar o reducir el límite total de asientos de la boda (por defecto 150) en cualquier momento.',
        side: 'bottom',
        align: 'end',
      },
    },
    {
      element: '#tour-btn-nueva-invitacion',
      popover: {
        title: '➕ Crear Nueva Invitación',
        description:
          'Presiona este botón para registrar una familia o invitado. Solo necesitas su <b>nombre</b>, <b>número de asientos</b> que les reservas y su <b>teléfono con WhatsApp</b>. El sistema genera un código seguro automáticamente.',
        side: 'bottom',
        align: 'end',
      },
    },
    {
      element: '#tour-search',
      popover: {
        title: '🔍 Buscador en Tiempo Real',
        description:
          'Escribe el nombre de la familia o su teléfono para encontrar rápidamente cualquier invitación en la lista.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '#tour-tabs',
      popover: {
        title: '📂 Pestañas de Filtrado',
        description:
          'Filtra tus invitaciones al instante por estado:<br/>' +
          '• <b>Todas</b>: Lista completa.<br/>' +
          '• <b>Pendientes</b>: Creadas pero aún no enviadas.<br/>' +
          '• <b>Enviadas</b>: Ya enviadas por WhatsApp.<br/>' +
          '• <b>Confirmadas</b>: Familias que confirmaron su asistencia.',
        side: 'bottom',
        align: 'center',
      },
    },
    {
      element: targetLista,
      popover: {
        title: '📲 Enviar y Gestionar Invitaciones',
        description:
          'Cada invitación tiene botones directos:<br/>' +
          '• <b style="color:#34d399">WhatsApp</b>: Abre WhatsApp con el mensaje y enlace listos para enviar.<br/>' +
          '• <b>Copiar</b>: Copia el enlace privado con código de confirmación.<br/>' +
          '• <b>Ver Invitación</b>: Previsualiza la invitación como la verá el invitado.<br/>' +
          '• <b>Editar / Eliminar</b>: Modifica los asientos asignados o elimina la invitación.',
        side: 'top',
        align: 'center',
      },
    },
    {
      element: '#tour-btn-guia',
      popover: {
        title: '💡 Botón de Guía / Tutorial',
        description:
          '¡Y listo! Si alguna vez olvidas cómo funciona o alguien más necesita una explicación, puedes volver a iniciar esta guía interactiva haciendo clic en este botón de <b>Guía</b>.',
        side: 'bottom',
        align: 'end',
      },
    },
  ];

  // Filtrar pasos cuyos elementos no existan en el DOM actual
  const pasosValidos = steps.filter((s) => {
    if (!s.element) return true;
    return !!document.querySelector(s.element);
  });

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.8)',
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Entendido! 🎉',
    progressText: 'Paso {{current}} de {{total}}',
    steps: pasosValidos,
    onDestroyed: () => {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    },
  });

  driverObj.drive();
}
