import { SlashCommandBuilder } from 'discord.js';

// Define the command structure for the Discord API
export const data = new SlashCommandBuilder()
    .setName('ahorro')
    .setDescription('Registra un aporte de oro a la cartera actual.')
    .addIntegerOption(option =>
        option.setName('cantidad')
            .setDescription('La cantidad de oro que vas a aportar')
            .setRequired(true)
    );

// Execute the command logic
export async function execute(interaction, db) {
    const userId = interaction.user.id;
    // Retrieve the amount entered by the user
    const cantidad = interaction.options.getInteger('cantidad');

    try {
        // Find the currently active wallet
        const activeWallet = await db.get("SELECT id FROM carteras WHERE estado = 'abierta'");

        if (!activeWallet) {
            // 'ephemeral: true' means only the user who typed the command will see this error
            return interaction.reply({ 
                content: 'No hay ninguna cartera abierta actualmente. Por favor, avisa a un administrador para usar /nueva.', 
                ephemeral: true 
            });
        }

        // Check if the user has already contributed to this specific wallet
        const existingAporte = await db.get(
            "SELECT id, cantidad FROM aportes WHERE user_id = ? AND cartera_id = ?",
            [userId, activeWallet.id]
        );

        if (existingAporte) {
            // Update existing contribution (add the new gold to the previous total)
            const newTotal = existingAporte.cantidad + cantidad;
            await db.run(
                "UPDATE aportes SET cantidad = ? WHERE id = ?",
                [newTotal, existingAporte.id]
            );
            
            await interaction.reply(`¡Aporte actualizado! Has sumado ${cantidad} de oro. Tu total en esta cartera es de **${newTotal}** de oro.`);
        } else {
            // Insert a brand new contribution record
            await db.run(
                "INSERT INTO aportes (user_id, cartera_id, cantidad) VALUES (?, ?, ?)",
                [userId, activeWallet.id, cantidad]
            );
            
            await interaction.reply(`¡Aporte registrado! Has depositado **${cantidad}** de oro a la cartera actual.`);
        }

    } catch (error) {
        console.error('Error executing /ahorro:', error);
        await interaction.reply({ 
            content: 'Uff, hubo un error técnico al registrar tu aporte. Inténtalo de nuevo más tarde.', 
            ephemeral: true 
        });
    }
}
