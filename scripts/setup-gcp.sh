#!/bin/bash
# Script de despliegue inicial para GCP

echo "🚀 Iniciando configuración en GCP..."

# Directorio base del proyecto
PROJECT_DIR="/home/andres60944362/WOW-Gold-Tracking-Bot-Discord"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: El directorio $PROJECT_DIR no existe. Verifica la ruta."
    exit 1
fi

cd $PROJECT_DIR

# 1. Instalar dependencias si no están instaladas
echo "📦 Instalando dependencias de Node.js..."
npm install

# 2. Copiar archivo de servicio a systemd
echo "⚙️ Configurando el servicio systemd..."
sudo cp $PROJECT_DIR/scripts/discord-bot.service /etc/systemd/system/

# 3. Recargar systemd para detectar el nuevo archivo
sudo systemctl daemon-reload

# 4. Habilitar el servicio para que inicie al arrancar el servidor
sudo systemctl enable discord-bot

# 5. Iniciar el servicio ahora
sudo systemctl start discord-bot

echo "✅ ¡Configuración completada con éxito!"
echo "Puedes ver el estado del bot con: sudo systemctl status discord-bot"
echo "Puedes ver los logs en vivo con: sudo journalctl -u discord-bot -f"
