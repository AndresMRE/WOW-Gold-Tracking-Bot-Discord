#!/bin/bash
# Script para actualizar el bot

echo "🔄 Actualizando el bot..."
cd /home/andres60944362/WOW-Gold-Tracking-Bot-Discord

# Bajar últimos cambios
git pull

# Instalar nuevas dependencias si las hubiera
npm install

# Actualizar comandos slash
npm run command-update

# Reiniciar el servicio
echo "♻️ Reiniciando el servicio..."
sudo systemctl restart discord-bot

echo "✅ ¡Actualización completada!"
