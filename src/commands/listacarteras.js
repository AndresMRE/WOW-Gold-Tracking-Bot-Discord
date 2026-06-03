import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { logger } from '../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('listacarteras')
    .setDescription('Muestra un menú seleccionable con el historial de todas las carteras.');

export async function execute(interaction, db) {
    try {
        const carteras = await db.all("SELECT * FROM carteras ORDER BY id DESC LIMIT 25");

        if (carteras.length === 0) {
            return interaction.reply({ content: 'No se encontraron registros de carteras.', ephemeral: true });
        }

        const options = carteras.map(cartera => {
            const labelStatus = cartera.estado === 'abierta' ? '🟢 ACTIVA' : '🔴 CERRADA';
            const dateRange = cartera.fecha_fin ? `${cartera.fecha_inicio} al ${cartera.fecha_fin}` : `${cartera.fecha_inicio} - Presente`;
            
            // If the wallet is closed and has USD balance, append it to the description row
            const usdText = (cartera.estado === 'cerrada' && cartera.usd > 0) ? ` | 💳 $${cartera.usd} USD` : '';

            return {
                label: `Cartera #${cartera.id} (${labelStatus})`,
                description: `Periodo: ${dateRange}${usdText}`,
                value: cartera.id.toString(),
            };
        });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_cartera_history')
            .setPlaceholder('Selecciona una cartera para ver sus aportes...')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({
            content: '🗂️ **Historial de Periodos de los carrys **\nSelecciona una de las siguientes carteras del menú desplegable para auditar los aportes de esa fecha:',
            components: [row]
        });

    } catch (error) {
        logger.error('Error executing /listacarteras:', error);
        await interaction.reply({ content: 'Error al procesar la lista de carteras.', ephemeral: true });
    }
}
