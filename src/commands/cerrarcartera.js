import { SlashCommandBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

// Define the command structure
export const data = new SlashCommandBuilder()
    .setName('cerrarcartera')
    .setDescription('Cierra el periodo actual, registra el monto en (USD) generado y abre una nueva cartera.')
    .addNumberOption(option =>
        option.setName('usd')
            .setDescription('Cantidad de USD generado en este periodo (ej: 35 o 0)')
            .setRequired(false)
    );

// Execute the command logic
export async function execute(interaction, db) {
    try {
        const today = new Date().toISOString().split('T')[0];
        // If no USD value is specified, default to 0
        const usdGenerated = interaction.options.getNumber('usd') || 0;

        const activeWallet = await db.get("SELECT id, fecha_inicio FROM carteras WHERE estado = 'abierta'");

        if (activeWallet) {
            // Close current wallet and save both end date and Battle.net USD balance
            await db.run(
                "UPDATE carteras SET estado = 'cerrada', fecha_fin = ?, usd = ? WHERE id = ?",
                [today, usdGenerated, activeWallet.id]
            );
        }

        // Open the next wallet period seamlessly
        await db.run(
            "INSERT INTO carteras (fecha_inicio, estado) VALUES (?, ?)",
            [today, 'abierta']
        );

        let responseText = '';
        if (activeWallet) {
            responseText = `📥 **Cartera #${activeWallet.id} Cerrada** (Periodo: ${activeWallet.fecha_inicio} al ${today}).\n`;
            if (usdGenerated > 0) {
                responseText += `💳 Saldo (USD) acumulado y liquidado: **$${usdGenerated} USD**.\n`;
            }
            responseText += `✨ ¡Se ha abierto automáticamente una **nueva cartera** para el siguiente periodo hoy (${today})!`;
        } else {
            responseText = `✨ ¡Se ha abierto una nueva cartera para el periodo actual (${today})!`;
        }

        await interaction.reply(responseText);

    } catch (error) {
        logger.error('Error executing /cerrarcartera:', error);
        await interaction.reply({ content: 'Hubo un error al intentar procesar el cierre de la cartera.', ephemeral: true });
    }
}
