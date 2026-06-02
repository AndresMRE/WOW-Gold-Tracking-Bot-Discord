import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Define the command structure
export const data = new SlashCommandBuilder()
    .setName('ayuda')
    .setDescription('Muestra la lista de comandos disponibles y cómo usarlos.');

// Execute the command logic
export async function execute(interaction, db) {
    // Build an elegant embed with the documentation of all commands categorized by scope
    const embed = new EmbedBuilder()
        .setTitle('📖 Guía de Comandos - Tesorero de la Guild')
        .setDescription('Aquí tienes la lista completa de comandos disponibles para gestionar el control de oro y USD de la comunidad.')
        .setColor('#0099ff')
        .addFields(
            { 
                name: '👤 Comandos para Miembros', 
                value: 
                    '**`/ahorro [cantidad]`**\nRegistra o suma una cantidad de oro a tu aporte dentro de la cartera activa.\n\n' +
                    '**`/restar [cantidad]`**\nCorrige un error descontando una cantidad de oro de tu aporte actual.\n\n' +
                    '**`/mioro`**\nMuestra tu saldo personal acumulado en la cartera actual de forma privada.\n\n' +
                    '**`/cartera`**\nMuestra el estado actual de la cartera activa y el ranking de aportes público de la guild.'
            },
            { 
                name: '🛡️ Comandos de Administración', 
                value: 
                    '**`/listacarteras`**\nMuestra un menú desplegable interactivo para revisar los aportes de cualquier periodo pasado.\n\n' +
                    '**`/cerrarcartera [usd]`**\nCierra el ciclo actual, registra el saldo opcional (USD) y abre un nuevo periodo automáticamente.\n\n' +
                    '**`/resumen`**\nMuestra un balance macro histórico de todas las carteras cerradas con sus respectivos totales de oro y USD generados.'
            }
        )
        .setFooter({ text: 'Usa los comandos escribiendo la barra diagonal (/) en el chat.' })
        .setTimestamp();

    // Reply to the user privately (ephemeral) to avoid cluttering the public channel
    await interaction.reply({ embeds: [embed], ephemeral: true });
}
