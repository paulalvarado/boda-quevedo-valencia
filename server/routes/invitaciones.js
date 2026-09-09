import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function generarSlug(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 30);
}

function generarCodigoConfirmacion() {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

function generarTokenId(nombreFamilia) {
  const slug = generarSlug(nombreFamilia) || 'invitado';
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `${slug}-${randomSuffix}`;
}

function limpiarTelefono(telefono) {
  return (telefono || '').replace(/\D/g, '');
}

// ─────────────────────────────────────────────────────────────
// RUTAS PÚBLICAS (Para los invitados)
// ─────────────────────────────────────────────────────────────

// GET /api/invitaciones/public/:token
// Retorna la información de la invitación para la vista del invitado
router.get('/public/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (token === 'preview-latest') {
      const [latest] = await pool.query(
        `SELECT id, token_id, nombre_familia, numero_asientos, estado, fecha_confirmacion
         FROM invitaciones 
         ORDER BY id DESC LIMIT 1`
      );
      if (latest.length > 0) {
        return res.json({ invitacion: latest[0] });
      }
    }

    const [rows] = await pool.query(
      `SELECT id, token_id, nombre_familia, numero_asientos, estado, fecha_confirmacion
       FROM invitaciones 
       WHERE token_id = ? OR codigo_confirmacion = ?`,
      [token.trim(), token.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invitación no encontrada.' });
    }

    return res.json({ invitacion: rows[0] });
  } catch (error) {
    console.error('Error al consultar invitación pública:', error);
    return res.status(500).json({ error: 'Error al consultar la invitación.' });
  }
});

// POST /api/invitaciones/public/:token/confirmar
// Confirma la asistencia del invitado.
// EXIGE el código de confirmación enviado por el administrador en la URL.
// Si no viene o no coincide, debe mostrar exactamente:
// "No se puede confirmar si la invitación no fue enviada por el administrador" (sin mencionar la palabra código).
router.post('/public/:token/confirmar', async (req, res) => {
  try {
    const { token } = req.params;
    const { codigo } = req.body;

    const [rows] = await pool.query(
      `SELECT id, token_id, codigo_confirmacion, nombre_familia, numero_asientos, estado 
       FROM invitaciones 
       WHERE token_id = ?`,
      [token.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invitación no encontrada.' });
    }

    const invitacion = rows[0];

    // Validación estricta del código de confirmación
    if (!codigo || typeof codigo !== 'string' || codigo.trim() !== invitacion.codigo_confirmacion) {
      return res.status(400).json({
        error: 'No se puede confirmar si la invitación no fue enviada por el administrador',
      });
    }

    // Si ya estaba confirmada, retornamos éxito amigable
    if (invitacion.estado === 'confirmada') {
      return res.json({
        success: true,
        alreadyConfirmed: true,
        message: `La asistencia de la ${invitacion.nombre_familia} con ${invitacion.numero_asientos} asiento(s) ya se encuentra confirmada.`,
        invitacion,
      });
    }

    // Actualizar a confirmada
    await pool.query(
      `UPDATE invitaciones 
       SET estado = 'confirmada', fecha_confirmacion = NOW() 
       WHERE id = ?`,
      [invitacion.id]
    );

    const [updatedRows] = await pool.query(
      `SELECT id, token_id, nombre_familia, numero_asientos, estado, fecha_confirmacion 
       FROM invitaciones 
       WHERE id = ?`,
      [invitacion.id]
    );

    return res.json({
      success: true,
      message: `¡Asistencia confirmada con éxito! Los esperamos con mucho cariño.`,
      invitacion: updatedRows[0],
    });
  } catch (error) {
    console.error('Error al confirmar asistencia:', error);
    return res.status(500).json({ error: 'Error al procesar la confirmación.' });
  }
});

// ─────────────────────────────────────────────────────────────
// RUTAS DE ADMINISTRADOR (Protegidas por JWT)
// ─────────────────────────────────────────────────────────────

// GET /api/invitaciones
// Lista todas las invitaciones con opción de búsqueda y filtro de estado
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, estado } = req.query;

    let query = `
      SELECT id, token_id, codigo_confirmacion, nombre_familia, numero_asientos, telefono, 
             estado, fecha_envio, fecha_confirmacion, notas, created_at, updated_at
      FROM invitaciones
      WHERE 1=1
    `;
    const params = [];

    if (search && search.trim() !== '') {
      query += ` AND (nombre_familia LIKE ? OR telefono LIKE ?)`;
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam);
    }

    if (estado && estado !== 'todas') {
      query += ` AND estado = ?`;
      params.push(estado.trim());
    }

    query += ` ORDER BY id DESC`;

    const [rows] = await pool.query(query, params);
    return res.json({ invitaciones: rows });
  } catch (error) {
    console.error('Error al listar invitaciones:', error);
    return res.status(500).json({ error: 'Error al obtener invitaciones.' });
  }
});

// POST /api/invitaciones
// Crea una nueva invitación para una familia
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { nombre_familia, numero_asientos, telefono, notas } = req.body;

    if (!nombre_familia || !nombre_familia.trim()) {
      return res.status(400).json({ error: 'El nombre de la familia es obligatorio.' });
    }

    const asientos = parseInt(numero_asientos, 10);
    if (isNaN(asientos) || asientos < 1) {
      return res.status(400).json({ error: 'El número de asientos debe ser mayor o igual a 1.' });
    }

    if (!telefono || !telefono.trim()) {
      return res.status(400).json({ error: 'El número de teléfono es obligatorio.' });
    }

    const tokenId = generarTokenId(nombre_familia);
    const codigoConfirmacion = generarCodigoConfirmacion();

    const [result] = await pool.query(
      `INSERT INTO invitaciones 
       (token_id, codigo_confirmacion, nombre_familia, numero_asientos, telefono, estado, notas) 
       VALUES (?, ?, ?, ?, ?, 'pendiente', ?)`,
      [
        tokenId,
        codigoConfirmacion,
        nombre_familia.trim(),
        asientos,
        telefono.trim(),
        notas ? notas.trim() : null,
      ]
    );

    const [createdRows] = await pool.query(
      `SELECT * FROM invitaciones WHERE id = ?`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: 'Invitación creada correctamente.',
      invitacion: createdRows[0],
    });
  } catch (error) {
    console.error('Error al crear invitación:', error);
    return res.status(500).json({ error: 'Error al crear la invitación.' });
  }
});

// PUT /api/invitaciones/:id
// Edita los datos de una invitación existente
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_familia, numero_asientos, telefono, estado, notas } = req.body;

    const [existing] = await pool.query('SELECT id FROM invitaciones WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Invitación no encontrada.' });
    }

    const updates = [];
    const params = [];

    if (nombre_familia !== undefined) {
      if (!nombre_familia.trim()) {
        return res.status(400).json({ error: 'El nombre de la familia no puede estar vacío.' });
      }
      updates.push('nombre_familia = ?');
      params.push(nombre_familia.trim());
    }

    if (numero_asientos !== undefined) {
      const asientos = parseInt(numero_asientos, 10);
      if (isNaN(asientos) || asientos < 1) {
        return res.status(400).json({ error: 'El número de asientos debe ser mayor o igual a 1.' });
      }
      updates.push('numero_asientos = ?');
      params.push(asientos);
    }

    if (telefono !== undefined) {
      updates.push('telefono = ?');
      params.push(telefono.trim());
    }

    if (estado !== undefined) {
      const validEstados = ['pendiente', 'enviada', 'confirmada', 'rechazada'];
      if (!validEstados.includes(estado)) {
        return res.status(400).json({ error: 'Estado de invitación no válido.' });
      }
      updates.push('estado = ?');
      params.push(estado);
      if (estado === 'confirmada') {
        updates.push('fecha_confirmacion = COALESCE(fecha_confirmacion, NOW())');
      }
    }

    if (notas !== undefined) {
      updates.push('notas = ?');
      params.push(notas ? notas.trim() : null);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No se enviaron datos para actualizar.' });
    }

    params.push(id);
    await pool.query(`UPDATE invitaciones SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await pool.query('SELECT * FROM invitaciones WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Invitación actualizada.',
      invitacion: updated[0],
    });
  } catch (error) {
    console.error('Error al actualizar invitación:', error);
    return res.status(500).json({ error: 'Error al actualizar invitación.' });
  }
});

// DELETE /api/invitaciones/:id
// Elimina una invitación
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query('SELECT id FROM invitaciones WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Invitación no encontrada.' });
    }

    await pool.query('DELETE FROM invitaciones WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Invitación eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar invitación:', error);
    return res.status(500).json({ error: 'Error al eliminar la invitación.' });
  }
});

// POST /api/invitaciones/:id/enviar
// Marca como enviada, actualiza fecha_envio y genera URL con código y link a WhatsApp
router.post('/:id/enviar', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { baseUrl } = req.body; // URL base opcional enviada desde el frontend

    const [rows] = await pool.query('SELECT * FROM invitaciones WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Invitación no encontrada.' });
    }

    const invitacion = rows[0];

    // Actualizar estado a 'enviada' si estaba en 'pendiente'
    if (invitacion.estado === 'pendiente') {
      await pool.query(
        `UPDATE invitaciones SET estado = 'enviada', fecha_envio = NOW() WHERE id = ?`,
        [id]
      );
      invitacion.estado = 'enviada';
    }

    // Determinar la URL base
    const host = baseUrl || req.headers.origin || `http://${req.headers.host}`;
    const urlInvitacion = `${host}/?inv=${invitacion.token_id}&codigo=${invitacion.codigo_confirmacion}`;

    // Mensaje de WhatsApp (usando api.whatsapp.com para preservar codificación UTF-8 de emojis sin el redirect corruptor de wa.me)
    const textoMensaje = `¡Hola ${invitacion.nombre_familia}! 💍✨ Nos hace una inmensa ilusión compartir con ustedes el día de nuestra boda. Tienen reservado(s) ${invitacion.numero_asientos} espacio(s). Por favor vean todos los detalles y confirmen su asistencia en el siguiente enlace:\n\n${urlInvitacion}`;

    const cleanPhone = limpiarTelefono(invitacion.telefono);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(textoMensaje)}`;

    return res.json({
      success: true,
      urlInvitacion,
      whatsappUrl,
      textoMensaje,
      invitacion,
    });
  } catch (error) {
    console.error('Error al procesar envío de invitación:', error);
    return res.status(500).json({ error: 'Error al enviar invitación.' });
  }
});

export default router;
