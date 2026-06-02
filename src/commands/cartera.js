import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Define the command structure
export const data = new SlashCommandBuilder()
    .setName('cartera')
    .setDescription('Muestra el estado de los aportes en la cartera activa actual.');

// Execute the command logic
export async function execute(interaction, db) {
    try {
        // Get the active wallet details
        const activeWallet = await db.get("SELECT * FROM carteras WHERE estado = 'abierta'");

        if (!activeWallet) {
            return interaction.reply({ content: 'No hay ninguna cartera abierta en este momento.', ephemeral: true });
        }

        // Fetch all contributions linked to this active wallet
        const aportes = await db.all(
            "SELECT user_id, cantidad FROM aportes WHERE cartera_id = ? ORDER BY cantidad DESC",
            [activeWallet.id]
        );

        // Build a styled Embed representation
        const embed = new EmbedBuilder()
            .setTitle(`💰 Estado de la Cartera Actual`)
            .setDescription(`Periodo activo desde el **${activeWallet.fecha_inicio}**`)
            .setTimestamp();

        if (aportes.length === 0) {
            embed.addFields({ name: 'Aportes', value: 'Aún no se han registrado aportes en este periodo.' });
        } else {
            let totalGold = 0;
            let listText = '';

            // Format each contribution line item using Discord user tags <@id>
            for (const aporte of aportes) {
                totalGold += aporte.cantidad;
                listText += `• <@${aporte.user_id}>: **${aporte.cantidad.toLocaleString()}** de oro\n`;
            }

            embed.addFields(
                { name: 'Depósitos del Periodo', value: listText },
                { name: 'Total Acumulado', value: `🪙 **${totalGold.toLocaleString()}** de oro` }
            );
        }

        await interaction.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error executing /cartera:', error);
        await interaction.reply({ content: 'Error al recuperar los datos de la cartera.', ephemeral: true });
    }
}
