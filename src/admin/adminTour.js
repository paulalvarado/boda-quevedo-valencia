import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_STORAGE_KEY = 'boda_admin_tour_seen';

/**
 * Inicia el tour interactivo paso a paso con Driver.js
 * Cubre todas las opciones del panel y cada campo dentro de los formularios/modales.
 * @param {boolean} forzar - Si es true, inicia el tour aunque ya haya sido visto
 * @param {object} modalControls - Controladores para abrir/cerrar modales dinámicamente
 */
export function iniciarGuia(forzar = false, modalControls = {}) {
  if (!forzar) {
    const yaVisto = localStorage.getItem(TOUR_STORAGE_KEY);
    if (yaVisto === 'true') {
      return;
    }
  }

  // Asegurar que no haya modales residuales abiertos al comenzar
  modalControls.closeAll?.();

  // Selector para la lista de invitaciones
  const existeElementoInvitacion = document.querySelector('#tour-invitacion-item');
  const targetLista = existeElementoInvitacion ? '#tour-invitacion-item' : '#tour-list-container';

  const steps = [
    // 1. Bienvenida
    {
      element: '#tour-brand',
      popover: {
        title: '¡Bienvenido al Panel de Invitaciones! 💍',
        description:
          'Aquí gestionas todas las familias invitadas, controlas los cupos de asientos y envías las invitaciones por WhatsApp en tiempo real.',
        side: 'bottom',
        align: 'start',
      },
    },

    // 2. Tarjetas de métricas
    {
      element: '#tour-metrics',
      popover: {
        title: '📊 Control de Asientos y Cupos',
        description:
          'Monitorea en tiempo real la <b>Capacidad Total</b> del evento, los asientos asignados y los confirmados. Las barras de progreso te muestran los porcentajes de ocupación.',
        side: 'bottom',
        align: 'center',
      },
    },

    // 3. Botón Capacidad
    {
      element: '#tour-btn-capacidad',
      popover: {
        title: '⚙️ Botón: Capacidad del Evento',
        description:
          'Haz clic aquí para abrir el formulario y ajustar la capacidad total de asientos de la boda. ¡Vamos a ver cómo funciona por dentro!',
        side: 'bottom',
        align: 'end',
      },
    },

    // 4. Formulario Capacidad - Campo Asientos
    {
      element: '#tour-form-capacidad',
      waitForElement: 2500,
      onHighlightStarted: () => {
        modalControls.openCapacidad?.();
      },
      popover: {
        title: '🔢 Cupo Total de Asientos',
        description:
          'Ingresa el número total de asientos del evento (por ejemplo, 150). El sistema recalculará automáticamente los asientos disponibles y los porcentajes de ocupación.',
        side: 'bottom',
        align: 'start',
      },
    },

    // 5. Formulario Capacidad - Botón Guardar
    {
      element: '#tour-btn-guardar-capacidad',
      waitForElement: 2500,
      onHighlightStarted: () => {
        modalControls.openCapacidad?.();
      },
      onDeselected: () => {
        modalControls.closeCapacidad?.();
      },
      popover: {
        title: '💾 Guardar Capacidad',
        description:
          'Guarda el nuevo cupo en la base de datos para que todas las métricas del panel se actualicen de inmediato.',
        side: 'top',
        align: 'end',
      },
    },

    // 6. Botón Mensaje WhatsApp
    {
      element: '#tour-btn-mensaje',
      onHighlightStarted: () => {
        modalControls.closeCapacidad?.();
      },
      popover: {
        title: '💬 Botón: Plantilla de WhatsApp',
        description:
          'Permite personalizar el mensaje automático que recibirán las familias. Cuenta con etiquetas inteligentes y simulador en tiempo real. ¡Entremos a revisarlo!',
        side: 'bottom',
        align: 'end',
      },
    },

    // 7. Formulario WhatsApp - Etiquetas Dinámicas
    {
      element: '#tour-msg-tags',
      waitForElement: 2500,
      onHighlightStarted: () => {
        modalControls.openMensaje?.();
      },
      popover: {
        title: '🏷️ Gestión de Etiquetas Inteligentes',
        description:
          'Haz clic en cualquiera de estas etiquetas (<code>{familia}</code>, <code>{asientos}</code>, <code>{enlace}</code>, <code>{codigo}</code>) para insertarlas en el mensaje.<br/><br/><b>¡Míralas bien!</b> Cuando una variable ya está en el texto, <b>se ilumina en verde con el aviso "Activa"</b> para que sepas qué datos estás usando.',
        side: 'bottom',
        align: 'start',
      },
    },

    // 8. Formulario WhatsApp - Editor con Resaltado en Verde
    {
      element: '#tour-msg-textarea',
      waitForElement: 2500,
      onHighlightStarted: () => {
        modalControls.openMensaje?.();
      },
      popover: {
        title: '✍️ Editor Inteligente con Resaltado',
        description:
          'Escribe el texto a tu gusto. Todas las variables presentes en el mensaje se <b>resaltan automáticamente en verde</b>. La barra inferior te confirma el estado de cada una y te avisa si el enlace de confirmación está incluido.',
        side: 'top',
        align: 'start',
      },
    },

    // 9. Formulario WhatsApp - Simulador en Vivo
    {
      element: '#tour-msg-preview-card',
      waitForElement: 2500,
      onHighlightStarted: () => {
        modalControls.openMensaje?.();
      },
      popover: {
        title: '📲 Simulador WhatsApp en Tiempo Real',
        description:
          '¡Así verán el mensaje tus invitados en WhatsApp! Incluye la tarjeta enriquecida con la imagen oficial <b>A&D.png</b>, título, descripción y hora en vivo.',
        side: 'left',
        align: 'center',
      },
    },

    // 10. Formulario WhatsApp - Botón Guardar
    {
      element: '#tour-msg-btn-guardar',
      waitForElement: 2500,
      onHighlightStarted: () => {
        modalControls.openMensaje?.();
      },
      onDeselected: () => {
        modalControls.closeMensaje?.();
      },
      popover: {
        title: '💾 Guardar Plantilla de Mensaje',
        description:
          'Guarda tu plantilla personalizada en MySQL. A partir de ese momento, cada vez que presiones el botón de WhatsApp en cualquier invitación se usará este texto.',
        side: 'top',
        align: 'end',
      },
    },

    // 11. Botón Nueva Invitación
    {
      element: '#tour-btn-nueva-invitacion',
      onHighlightStarted: () => {
        modalControls.closeMensaje?.();
      },
      popover: {
        title: '➕ Botón: Crear Nueva Invitación',
        description:
          'Presiona este botón para registrar una familia o invitado. Vamos a ver los campos requeridos dentro del formulario.',
        side: 'bottom',
        align: 'end',
      },
    },

    // 12. Formulario Invitación - Nombre Familia
    {
      element: '#nombre_familia',
      waitForElement: 2500,
      onHighlightStarted: () => {
        modalControls.openInvitacion?.();
      },
      popover: {
        title: '👤 Nombre de la Familia o Invitado',
        description:
          'Escribe cómo deseas que aparezca en la invitación personalizada (por ejemplo: <i>Familia Quevedo Valencia</i>).',
        side: 'bottom',
        align: 'start',
      },
    },

    // 13. Formulario Invitación - Asientos
    {
      element: '#numero_asientos',
      waitForElement: 2500,
      onHighlightStarted: () => {
        modalControls.openInvitacion?.();
      },
      popover: {
        title: '🎟️ Asientos Reservados',
        description:
          'Define cuántos espacios le reservas a esta familia. Este número se descontará de los asientos disponibles del evento y se reflejará en la invitación del invitado.',
        side: 'bottom',
        align: 'start',
      },
    },

    // 14. Formulario Invitación - Teléfono WhatsApp
    {
      element: '#telefono',
      waitForElement: 2500,
      onHighlightStarted: () => {
        modalControls.openInvitacion?.();
      },
      popover: {
        title: '📱 Teléfono con WhatsApp',
        description:
          'Ingresa el número con el código de país sin signo + (por ejemplo <code>50688889999</code>). Este número habilitará el botón directo para enviar la invitación por WhatsApp.',
        side: 'bottom',
        align: 'start',
      },
    },

    // 15. Formulario Invitación - Notas
    {
      element: '#notas',
      waitForElement: 2500,
      onHighlightStarted: () => {
        modalControls.openInvitacion?.();
      },
      popover: {
        title: '📝 Notas Internas (Opcional)',
        description:
          'Campo libre para registrar información como número de mesa asignada, alergias o recordatorios internos.',
        side: 'top',
        align: 'start',
      },
    },

    // 16. Formulario Invitación - Botón Guardar
    {
      element: '#tour-btn-guardar-invitacion',
      waitForElement: 2500,
      onHighlightStarted: () => {
        modalControls.openInvitacion?.();
      },
      onDeselected: () => {
        modalControls.closeInvitacion?.();
      },
      popover: {
        title: '✨ Guardar Invitación',
        description:
          'Crea la invitación en la base de datos y genera automáticamente un <b>enlace único</b> y un <b>código secreto de confirmación</b>.',
        side: 'top',
        align: 'end',
      },
    },

    // 17. Buscador en tiempo real
    {
      element: '#tour-search',
      onHighlightStarted: () => {
        modalControls.closeInvitacion?.();
      },
      popover: {
        title: '🔍 Buscador en Tiempo Real',
        description:
          'Escribe cualquier apellido, nombre o número de teléfono para filtrar instantáneamente en la lista.',
        side: 'bottom',
        align: 'start',
      },
    },

    // 18. Pestañas de estado
    {
      element: '#tour-tabs',
      popover: {
        title: '📂 Pestañas Deslizables de Estado',
        description:
          'Filtra tus invitaciones por estado:<br/>' +
          '• <b>Todas</b>: Listado general.<br/>' +
          '• <b>Pendientes</b>: Creadas pero aún no enviadas.<br/>' +
          '• <b>Enviadas</b>: Ya enviadas por WhatsApp.<br/>' +
          '• <b>Confirmadas</b>: Familias que confirmaron su asistencia.<br/><br/>' +
          '<i>En móvil puedes arrastrar las pestañas de lado a lado con el dedo.</i>',
        side: 'bottom',
        align: 'center',
      },
    },

    // 19. Acciones en cada fila/tarjeta de invitación
    {
      element: targetLista,
      popover: {
        title: '📲 Acciones Rápidas de Invitación',
        description:
          'Cada invitación cuenta con botones de acción rápida:<br/>' +
          '• <b style="color:#34d399">WhatsApp</b>: Abre WhatsApp con el mensaje personalizado y enlace listos para enviar.<br/>' +
          '• <b>Copiar</b>: Copia al portapapeles la URL privada con código.<br/>' +
          '• <b>Ver</b>: Abre la vista del invitado en una nueva pestaña.<br/>' +
          '• <b>Editar / Eliminar</b>: Modifica cupos o libera asientos si es necesario.',
        side: 'top',
        align: 'center',
      },
    },

    // 20. Botón de Guía para volver a ver el tutorial
    {
      element: '#tour-btn-guia',
      popover: {
        title: '💡 Botón de Guía Interactiva',
        description:
          '¡Y listo! Puedes volver a iniciar este recorrido paso a paso en cualquier momento haciendo clic en este botón de <b>Guía</b>.',
        side: 'bottom',
        align: 'end',
      },
    },
  ];

  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.85)',
    nextBtnText: 'Siguiente →',
    prevBtnText: '← Anterior',
    doneBtnText: '¡Entendido! 🎉',
    progressText: 'Paso {{current}} de {{total}}',
    steps,
    onDestroyed: () => {
      modalControls.closeAll?.();
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    },
  });

  driverObj.drive();
}
