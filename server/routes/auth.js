import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'boda_jwt_secret_super_seguro_2026';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Por favor ingresa usuario y contraseña.' });
    }

    const [rows] = await pool.query(
      'SELECT id, username, password_hash, nombre FROM administradores WHERE username = ?',
      [username.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const admin = rows[0];
    const passwordValid = await bcrypt.compare(password, admin.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, nombre: admin.nombre },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        nombre: admin.nombre,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, nombre, created_at FROM administradores WHERE id = ?',
      [req.admin.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado.' });
    }

    return res.json({ admin: rows[0] });
  } catch (error) {
    console.error('Error en /me:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    const [rows] = await pool.query(
      'SELECT password_hash FROM administradores WHERE id = ?',
      [req.admin.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const match = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!match) {
      return res.status(400).json({ error: 'La contraseña actual no es correcta.' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE administradores SET password_hash = ? WHERE id = ?', [
      newHash,
      req.admin.id,
    ]);

    return res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return res.status(500).json({ error: 'Error al cambiar contraseña.' });
  }
});

export default router;
