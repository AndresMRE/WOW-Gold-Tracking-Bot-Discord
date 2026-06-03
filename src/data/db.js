import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { logger } from '../utils/logger.js';

// Initialize and export the database connection
export async function initDB() {
    const db = await open({
        filename: './guild_gold.db',
        driver: sqlite3.Database
    });

    // Habilitar Foreign Keys (necesario en SQLite)
    await db.exec('PRAGMA foreign_keys = ON;');

    // Create the 'carteras' table with the new 'usd' column
    await db.exec(`
        CREATE TABLE IF NOT EXISTS carteras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha_inicio TEXT,
            fecha_fin TEXT,
            estado TEXT,
            usd REAL DEFAULT 0.0
        );
    `);

    // Migration helper: Try to add the 'usd' column in case the database file already exists
    try {
        await db.exec("ALTER TABLE carteras ADD COLUMN usd REAL DEFAULT 0.0;");
    } catch (error) {
        // If the column already exists, SQLite throws an error which we can safely ignore
    }

    // Create the 'aportes' table
    await db.exec(`
        CREATE TABLE IF NOT EXISTS aportes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            cartera_id INTEGER,
            cantidad INTEGER,
            FOREIGN KEY (cartera_id) REFERENCES carteras(id)
        );
    `);

    // Check if there is an active wallet; if not, create the initial one
    const activeWallet = await db.get("SELECT * FROM carteras WHERE estado = 'abierta'");
    
    if (!activeWallet) {
        const today = new Date().toISOString().split('T')[0]; 
        await db.run(
            "INSERT INTO carteras (fecha_inicio, estado) VALUES (?, ?)", 
            [today, 'abierta']
        );
        logger.info('¡Base de datos inicializada y primera cartera creada!');
    }

    return db;
}
