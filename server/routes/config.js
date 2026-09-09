import { Router } from 'express';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/config
router.get('/', async (req, res) => {
  try {
    const [configs] = await pool.query('SELECT clave, valor FROM configuracion');
    const configMap = {};
    configs.forEach((item) => {
      configMap[item.clave] = item.valor;
    });

    const totalAsientosEvento = parseInt(configMap.total_asientos_evento || '150', 10);

    const [statsRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_invitaciones,
        COALESCE(SUM(numero_asientos), 0) AS asientos_asignados,
        COALESCE(SUM(CASE WHEN estado = 'confirmada' THEN numero_asientos ELSE 0 END), 0) AS asientos_confirmados,
        COALESCE(SUM(CASE WHEN estado = 'enviada' THEN 1 ELSE 0 END), 0) AS invitaciones_enviadas,
        COALESCE(SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END), 0) AS invitaciones_confirmadas,
        COALESCE(SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END), 0) AS invitaciones_pendientes
      FROM invitaciones;
    `);

    const stats = statsRows[0] || {
      total_invitaciones: 0,
      asientos_asignados: 0,
      asientos_confirmados: 0,
      invitaciones_enviadas: 0,
      invitaciones_confirmadas: 0,
      invitaciones_pendientes: 0,
    };

    const asientosAsignados = parseInt(stats.asientos_asignados, 10);
    const asientosConfirmados = parseInt(stats.asientos_confirmados, 10);
    const asientosDisponibles = Math.max(0, totalAsientosEvento - asientosAsignados);

    const defaultMensaje = '¡Hola {familia}! 💍✨ Nos hace una inmensa ilusión compartir con ustedes el día de nuestra boda. Tienen reservado(s) {asientos} espacio(s). Por favor vean todos los detalles y confirmen su asistencia en el siguiente enlace:\n\n{enlace}';

    if (!configMap.mensaje_whatsapp) {
      configMap.mensaje_whatsapp = defaultMensaje;
    }

    return res.json({
      config: configMap,
      metrics: {
        total_asientos_evento: totalAsientosEvento,
        asientos_asignados: asientosAsignados,
        asientos_confirmados: asientosConfirmados,
        asientos_disponibles: asientosDisponibles,
        total_invitaciones: parseInt(stats.total_invitaciones, 10),
        invitaciones_enviadas: parseInt(stats.invitaciones_enviadas, 10),
        invitaciones_confirmadas: parseInt(stats.invitaciones_confirmadas, 10),
        invitaciones_pendientes: parseInt(stats.invitaciones_pendientes, 10),
      },
    });
  } catch (error) {
    console.error('Error al obtener configuración y métricas:', error);
    return res.status(500).json({ error: 'Error al obtener métricas del evento.' });
  }
});

// PUT /api/config
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { total_asientos_evento, nombre_evento, mensaje_whatsapp } = req.body;

    if (total_asientos_evento !== undefined) {
      const asientosNum = parseInt(total_asientos_evento, 10);
      if (isNaN(asientosNum) || asientosNum < 1) {
        return res.status(400).json({ error: 'La capacidad de asientos debe ser un número mayor a 0.' });
      }

      await pool.query(
        'INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
        ['total_asientos_evento', String(asientosNum), String(asientosNum)]
      );
    }

    if (nombre_evento !== undefined) {
      await pool.query(
        'INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
        ['nombre_evento', String(nombre_evento), String(nombre_evento)]
      );
    }

    if (mensaje_whatsapp !== undefined) {
      const cleanMsg = String(mensaje_whatsapp).trim();
      if (!cleanMsg) {
        return res.status(400).json({ error: 'El mensaje de WhatsApp no puede estar vacío.' });
      }

      await pool.query(
        'INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
        ['mensaje_whatsapp', cleanMsg, cleanMsg]
      );
    }

    return res.json({ success: true, message: 'Configuración actualizada con éxito.' });
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    return res.status(500).json({ error: 'Error al actualizar configuración.' });
  }
});

export default router;
