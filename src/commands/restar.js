import { SlashCommandBuilder } from 'discord.js';

// Define the command structure
export const data = new SlashCommandBuilder()
    .setName('restar')
    .setDescription('Resta o quita una cantidad de oro de tu aporte en la cartera actual.')
    .addIntegerOption(option =>
        option.setName('cantidad')
            .setDescription('La cantidad de oro que deseas descontar')
            .setRequired(true)
    );

// Execute the command logic
export async function execute(interaction, db) {
    const userId = interaction.user.id;
    const cantidadARestar = interaction.options.getInteger('cantidad');

    if (cantidadARestar <= 0) {
        return interaction.reply({ content: 'La cantidad a restar debe ser mayor a 0.', ephemeral: true });
    }

    try {
        const activeWallet = await db.get("SELECT id FROM carteras WHERE estado = 'abierta'");

        if (!activeWallet) {
            return interaction.reply({ content: 'No hay ninguna cartera abierta actualmente.', ephemeral: true });
        }

        // Check if the user actually has contributions in this wallet
        const existingAporte = await db.get(
            "SELECT id, cantidad FROM aportes WHERE user_id = ? AND cartera_id = ?",
            [userId, activeWallet.id]
        );

        if (!existingAporte || existingAporte.cantidad === 0) {
            return interaction.reply({ content: 'No tienes ningún oro registrado en la cartera actual para poder restar.', ephemeral: true });
        }

        if (cantidadARestar > existingAporte.cantidad) {
            return interaction.reply({
                content: `No puedes restar **${cantidadARestar.toLocaleString()}** de oro porque tu saldo actual en esta cartera es de **${existingAporte.cantidad.toLocaleString()}** de oro.`,
                ephemeral: true
            });
        }

        const newTotal = existingAporte.cantidad - cantidadARestar;

        // Update the database record with the new balance
        await db.run(
            "UPDATE aportes SET cantidad = ? WHERE id = ?",
            [newTotal, existingAporte.id]
        );

        await interaction.reply(`📉 ¡Corrección realizada! Has restado ${cantidadARestar.toLocaleString()} de oro. Tu total actualizado en esta cartera es de **${newTotal.toLocaleString()}** de oro.`);

    } catch (error) {
        console.error('Error executing /restar:', error);
        await interaction.reply({ content: 'Hubo un error al procesar la corrección.', ephemeral: true });
    }
}
