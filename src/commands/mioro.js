import { SlashCommandBuilder } from 'discord.js';

// Define the command structure
export const data = new SlashCommandBuilder()
    .setName('mioro')
    .setDescription('Muestra el total de oro que has aportado en la cartera activa actual.');

// Execute the command logic
export async function execute(interaction, db) {
    const userId = interaction.user.id;

    try {
        // Find the currently active wallet
        const activeWallet = await db.get("SELECT id, fecha_inicio FROM carteras WHERE estado = 'abierta'");

        if (!activeWallet) {
            return interaction.reply({ 
                content: 'No hay ninguna cartera abierta en este momento.', 
                ephemeral: true 
            });
        }

        // Fetch the specific user's contribution for this active wallet
        const aporte = await db.get(
            "SELECT cantidad FROM aportes WHERE user_id = ? AND cartera_id = ?",
            [userId, activeWallet.id]
        );

        // If the user hasn't contributed yet or the row doesn't exist
        if (!aporte || aporte.cantidad === 0) {
            return interaction.reply({
                content: `🪙 En el periodo actual (desde el ${activeWallet.fecha_inicio}), aún **no has registrado aportes** de oro.\nPara registrar uno, usa \`/ahorro\`.`,
                ephemeral: true // Visible only to the user who requested it
            });
        }

        // If the user has an active balance
        await interaction.reply({
            content: `🪙 **Tu Balance Personal**\nEn la cartera actual (activa desde el ${activeWallet.fecha_inicio}), has aportado un total de **${aporte.cantidad.toLocaleString()}** de oro.`,
            ephemeral: true // Keeps the query private so it doesn't spam the public channel
        });

    } catch (error) {
        console.error('Error executing /mioro:', error);
        await interaction.reply({ 
            content: 'Hubo un error al intentar consultar tu saldo de oro.', 
            ephemeral: true 
        });
    }
}
