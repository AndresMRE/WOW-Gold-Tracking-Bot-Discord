import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

// Define the command structure
export const data = new SlashCommandBuilder()
    .setName('resumen')
    .setDescription('Muestra un balance financiero global de todas las carteras cerradas.');

// Execute the command logic
export async function execute(interaction, db) {
    try {
        // Query to calculate total gold per closed wallet using a LEFT JOIN and GROUP BY
        const summary = await db.all(`
            SELECT c.id, c.fecha_inicio, c.fecha_fin, c.usd, TOTAL(a.cantidad) as total_oro
            FROM carteras c
            LEFT JOIN aportes a ON c.id = a.cartera_id
            WHERE c.estado = 'cerrada'
            GROUP BY c.id
            ORDER BY c.id DESC
        `);

        const embed = new EmbedBuilder()
            .setTitle('📊 Balance Histórico de la Guild')
            .setDescription('Resumen ejecutivo de recaudación de oro y conversión a Saldo Battle.net.')
            .setTimestamp();

        if (summary.length === 0) {
            embed.addFields({ name: 'Historial Vacío', value: 'Aún no existen carteras en el histórico cerrado.' });
        } else {
            let globalGold = 0;
            let globalUSD = 0;
            let bodyText = '';

            for (const row of summary) {
                globalGold += row.total_oro;
                globalUSD += row.usd;

                bodyText += `📁 **Cartera #${row.id}** (${row.fecha_inicio} al ${row.fecha_fin})\n`;
                bodyText += `• Oro Recaudado: **${row.total_oro.toLocaleString()}**\n`;
                bodyText += `• Saldo Bnet: **$${row.usd} USD**\n`;
                bodyText += `───────────────────\n`;
            }

            embed.addFields(
                { name: 'Periodos Concluidos', value: bodyText },
                { name: '📈 Totales Históricos acumulados', value: `🪙 Oro Total: **${globalGold.toLocaleString()}**\n💳 Saldo Bnet Total: **$${globalUSD} USD**` }
            );
        }

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        logger.error('Error executing /resumen:', error);
        await interaction.reply({ content: 'Error al generar el reporte de balance histórico.', ephemeral: true });
    }
}
