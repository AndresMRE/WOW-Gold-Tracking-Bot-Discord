# Instrucciones para Desarrolladores (Despliegue en GCP)

Esta guía explica cómo configurar, desplegar y actualizar el bot de Discord en la máquina virtual (VM) de Google Cloud.

## 1. Requisitos Previos en la VM
- **Node.js** v18 o superior.
- **Git** instalado.
- Cuenta en Google Cloud con acceso SSH a la VM (usuario `andres60944362`).

## 2. Instalación por Primera Vez (Setup)
Cuando clonas el proyecto por primera vez en la ruta `/home/andres60944362/WOW-Gold-Tracking-Bot-Discord`, debes ejecutar el script de configuración inicial.

```bash
# Dar permisos de ejecución al script
chmod +x scripts/setup-gcp.sh

# Ejecutar el script (usando bash o npm)
npm run deploy:setup
```

**¿Qué hace este script?**
1. Instala las dependencias (`npm install`).
2. Copia el archivo `discord-bot.service` a `/etc/systemd/system/`.
3. Recarga `systemd` para que reconozca el nuevo servicio.
4. Habilita el servicio para que inicie automáticamente cuando se encienda el servidor.
5. Inicia el bot en segundo plano.

## 3. Actualizar el Bot (Updates)
Cuando subas nuevos cambios al repositorio (por ejemplo, a GitHub) y quieras actualizar el bot que está corriendo en la VM, **no necesitas reiniciar el servidor manualmente**. Solo corre el siguiente script:

```bash
# Estando dentro de la carpeta del proyecto:
npm run deploy:update
```

**¿Qué hace este script?**
1. Descarga los últimos cambios (`git pull`).
2. Instala nuevas dependencias si las hubiera (`npm install`).
3. Refresca los comandos Slash en Discord (`npm run command-update`).
4. Reinicia el servicio en segundo plano para aplicar el nuevo código de forma limpia (`sudo systemctl restart discord-bot`).

## 4. Reiniciar la Base de Datos
Si deseas borrar el historial por completo y comenzar desde cero, puedes utilizar el comando de reinicio. Este script detendrá el bot, guardará un respaldo de la base de datos actual (como `guild_gold.db.bak`) y reiniciará el servidor para que se cree una base de datos nueva en blanco.

```bash
# Estando dentro de la carpeta del proyecto:
npm run deploy:reset-db
```

## 5. Revisión de Logs
Gracias a la integración con `winston`, el bot ahora guarda sus registros de manera organizada y con rotación diaria.

- **Logs del Bot en tiempo real (Systemd):**
  Si necesitas ver si el bot está vivo o si arrojó algún error nativo:
  ```bash
  sudo journalctl -u discord-bot -f
  ```
- **Archivos de Logs (Winston):**
  Los registros de la aplicación se guardan en la carpeta `/logs` dentro del proyecto.
  ```bash
  cd logs/
  tail -f combined-YYYY-MM-DD.log  # (Reemplazar con la fecha actual)
  ```

## 6. Notas Importantes
- **Variables de Entorno (`.env`):** Asegúrate de que el archivo `.env` exista en la raíz del proyecto en producción con `DISCORD_TOKEN`, `CLIENT_ID`, y `GUILD_ID` válidos. Este archivo NO se sube a Git.
- **Rutas:** Todos los scripts asumen que el proyecto vive en `/home/andres60944362/WOW-Gold-Tracking-Bot-Discord`. Si se mueve la carpeta, los archivos `setup-gcp.sh`, `update.sh`, `reset-db.sh` y `discord-bot.service` deben ser editados para reflejar la nueva ruta absoluta.
