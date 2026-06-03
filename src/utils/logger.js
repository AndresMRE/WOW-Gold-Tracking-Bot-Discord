import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Configuración de rotación diaria para errores
const errorTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '14d', // Mantener logs por 14 días
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    )
});

// Configuración de rotación diaria para todos los logs combinados
const combinedTransport = new winston.transports.DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    )
});

// Configuración para consola
const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] ${level}: ${message}`;
        })
    )
});

export const logger = winston.createLogger({
    level: 'info',
    transports: [
        errorTransport,
        combinedTransport,
        consoleTransport
    ],
    exitOnError: false
});
