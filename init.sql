-- Script de inicialización de Base de Datos para Boda Quevedo Valencia

CREATE DATABASE IF NOT EXISTS boda_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE boda_db;

-- Tabla de Administradores
CREATE TABLE IF NOT EXISTS administradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Configuración
CREATE TABLE IF NOT EXISTS configuracion (
    clave VARCHAR(50) PRIMARY KEY,
    valor VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Invitaciones
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

-- Configuración inicial por defecto (si no existe)
INSERT IGNORE INTO configuracion (clave, valor) VALUES 
('total_asientos_evento', '150'),
('nombre_evento', 'Boda Quevedo Valencia');
