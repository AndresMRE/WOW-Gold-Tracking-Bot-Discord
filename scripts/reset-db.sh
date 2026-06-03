#!/bin/bash
# Script para reiniciar la base de datos y el servidor

echo "⚠️  ADVERTENCIA: Vas a eliminar todos los registros de aportes y carteras de la base de datos."
read -p "¿Estás seguro de que quieres continuar? (s/N): " confirm

if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo "Operación cancelada."
    exit 0
fi

cd /home/andres60944362/WOW-Gold-Tracking-Bot-Discord

echo "🛑 Deteniendo el servicio..."
sudo systemctl stop discord-bot

echo "🗑️  Limpiando la base de datos..."
# Respaldamos la base de datos anterior por si acaso en lugar de borrarla de inmediato
if [ -f "guild_gold.db" ]; then
    mv guild_gold.db guild_gold.db.bak
    echo "Base de datos resguardada como guild_gold.db.bak"
else
    echo "No se encontró guild_gold.db"
fi

echo "♻️  Reiniciando el servicio..."
sudo systemctl start discord-bot

echo "✅ ¡Base de datos reiniciada y servidor iniciado con éxito!"
