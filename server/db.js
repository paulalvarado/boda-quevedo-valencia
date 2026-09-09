import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || (DB_HOST === 'db' ? '3306' : '3307'), 10);
const DB_USER = process.env.DB_USER || 'boda_user';
const DB_PASSWORD = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'boda_password_2026';
const DB_NAME = process.env.DB_NAME || 'boda_db';

export const pool = mysql.createPool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function initDb() {
  console.log(`[DB] Conectando a MySQL en ${DB_HOST}:${DB_PORT} (Base de datos: ${DB_NAME})...`);
  
  try {
    try {
      const rootConnection = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
      });

      await rootConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await rootConnection.end();
    } catch {
      // Si el usuario no tiene permisos globales de CREATE DATABASE, la base ya fue creada por Docker/init.sql
    }

    // Crear tablas requeridas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS administradores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion (
        clave VARCHAR(50) PRIMARY KEY,
        valor VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS invitaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token_id VARCHAR(64) NOT NULL UNIQUE,
        codigo_confirmacion VARCHAR(64) NOT NULL,
        nombre_familia VARCHAR(150) NOT NULL,
        numero_asientos INT NOT NULL DEFAULT 1,
        telefono VARCHAR(30) NOT NULL,
        estado ENUM('pendiente', 'enviada', 'confirmada', 'rechazada') NOT NULL DEFAULT 'pendiente',
        fecha_envio DATETIME NULL,
        fecha_confirmacion DATETIME NULL,
        notas TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_token (token_id),
        INDEX idx_estado (estado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Asegurar configuración por defecto
    await pool.query(`
      INSERT IGNORE INTO configuracion (clave, valor) VALUES 
      ('total_asientos_evento', '150'),
      ('nombre_evento', 'Boda Quevedo Valencia');
    `);

    // Asegurar administrador inicial
    const adminUser = process.env.ADMIN_DEFAULT_USER || 'admin';
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'boda2026';

    const [admins] = await pool.query('SELECT id FROM administradores LIMIT 1');
    if (admins.length === 0) {
      const hash = bcrypt.hashSync(adminPassword, 10);
      await pool.query(
        'INSERT INTO administradores (username, password_hash, nombre) VALUES (?, ?, ?)',
        [adminUser, hash, 'Administrador Boda']
      );
      console.log(`[DB] Administrador inicial creado con éxito: usuario '${adminUser}'`);
    }

    console.log('[DB] Base de datos inicializada y lista.');
  } catch (error) {
    console.error('[DB ERROR] Error al inicializar base de datos:', error.message);
    throw error;
  }
}
