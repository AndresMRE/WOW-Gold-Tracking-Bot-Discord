import { Client, Collection, GatewayIntentBits } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { initDB } from './data/db.js';
import { logger } from './utils/logger.js';

// Global error handlers to prevent silent crashes
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Replicate __dirname functionality in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

// Initialize Discord Client
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ] 
});

// Setup a dynamic collection to hold command handlers
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Read and map each command handler into the client instance
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = await import(`file://${filePath}`);
    
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// Event triggered when the bot is ready and online
client.once('ready', () => {
    logger.info(`¡Bot encendido y listo! Conectado como ${client.user.tag}`);
});

// Listener for interaction events (Slash Commands)
client.on('interactionCreate', async interaction => {
    // LAYER 1: Handle Slash Commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, db);
        } catch (error) {
            logger.error(`Error executing command ${interaction.commandName}:`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Hubo un error interno al procesar este comando.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Hubo un error interno al procesar este comando.', ephemeral: true });
            }
        }
        return;
    }

    // LAYER 2: Handle Interactive Select Menus
    if (interaction.isStringSelectMenu()) {
        // Identify our menu component via custom ID
        if (interaction.customId === 'select_cartera_history') {
            try {
                // Convert the string ID from Discord into a clean Number for SQLite
                const selectedWalletId = Number(interaction.values[0]);

                // Query using flat arguments (no brackets), matching the sqlite wrapper specification
                const cartera = await db.get("SELECT * FROM carteras WHERE id = ?", selectedWalletId);
                
                // Safety check: If the wallet wasn't found for any reason, abort gracefully
                if (!cartera) {
                    await interaction.reply({ 
                        content: 'No se pudo encontrar la cartera seleccionada en la base de datos.', 
                        ephemeral: true 
                    });
                    return;
                }

                const aportes = await db.all(
                    "SELECT user_id, cantidad FROM aportes WHERE cartera_id = ? ORDER BY cantidad DESC",
                    selectedWalletId
                );

                const statusEmoji = cartera.estado === 'abierta' ? '🟢' : '🔴';
                const dateText = cartera.fecha_fin ? `${cartera.fecha_inicio} al ${cartera.fecha_fin}` : `${cartera.fecha_inicio} - Presente`;

                let responseText = `📋 **Detalles de Cartera #${cartera.id}** (${statusEmoji} *${cartera.estado.toUpperCase()}*)\n`;
                responseText += `🗓️ **Periodo:** ${dateText}\n\n`;

                if (aportes.length === 0) {
                    responseText += '*No se registraron aportes en este periodo.*';
                } else {
                    let totalGold = 0;
                    responseText += `**Aportes de los Miembros:**\n`;
                    for (const aporte of aportes) {
                        totalGold += aporte.cantidad;
                        responseText += `• <@${aporte.user_id}> aportó **${aporte.cantidad.toLocaleString()}** de oro\n`;
                    }
                    responseText += `\n🪙 **Total recaudado:** **${totalGold.toLocaleString()}** de oro`;
                }

                // Update the original interaction message seamlessly
                await interaction.update({
                    content: responseText,
                    components: interaction.message.components
                });

            } catch (error) {
                logger.error('Error handling select menu interaction:', error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Hubo un problema al cargar los detalles de la cartera seleccionada.', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Hubo un problema al cargar los detalles de la cartera seleccionada.', ephemeral: true });
                }
            }
        }
    }
});

// Initialize DB and then authenticate with Discord API
initDB().then((database) => {
    db = database;
    client.login(process.env.DISCORD_TOKEN).catch(err => {
        logger.error('Failed to login to Discord API:', err);
    });
}).catch((error) => {
    logger.error('Database initialization failed:', error);
});
