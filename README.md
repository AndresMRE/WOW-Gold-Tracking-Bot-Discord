# WoW Guild Gold Tracker Bot

A Discord bot built with Node.js (ES Modules) and SQLite designed to manage, track, and audit gold contributions for World of Warcraft guilds. It supports flexible tracking periods (wallets) and monitors conversions into Battle.net balance (USD).

## Architecture Overview

The project follows a layered architecture pattern to separate concerns and ensure scalability:

* `src/index.js`: The main entry point. Initializes the database, loads command collection, and handles real-time Discord interaction events.
* `src/data/db.js`: Data Access Layer. Handles SQLite database configuration, table initialization, and schema migrations.
* `src/commands/`: Presentation and Business Logic Layer. Each file inside this directory represents a standalone modular slash command.

---

## Prerequisites

Ensure you have the following installed on your environment:

* Node.js (LTS version 20.x or higher recommended)
* npm (Node Package Manager)

---

## Installation and Setup

1. Clone or navigate to your project directory.
2. Initialize and install the required dependencies:

```bash
npm install

```

3. Create a `.env` file in the root directory of the project to store sensitive application configurations.

---

## Environment Variables Configuration

The application relies on a `.env` file for authentication and scope settings. Create a file named `.env` in the root directory and add the following keys:

```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_application_id_here
GUILD_ID=your_target_discord_server_id_here

```

### How to obtain these values:

* **DISCORD_TOKEN**: Found in the Discord Developer Portal under your Application > Bot > Reset Token.
* **CLIENT_ID**: Found in the Discord Developer Portal under your Application > General Information > Application ID.
* **GUILD_ID**: Right-click your Discord server icon with Developer Mode enabled in your Discord client settings, and select Copy Server ID.

> **Warning:** Never commit the `.env` file or expose your `DISCORD_TOKEN` to public repositories.

---

## Deployment and Execution

### 1. Register Slash Commands

Before running the bot for the first time, or whenever you modify/add commands, you must deploy the command definitions to the Discord API:

```bash
node src/deploy-commands.js

```

### 2. Launch the Bot

To start the application and connect the bot to your server, execute:

```bash
node src/index.js

```

---

## Adding New Commands

To extend the bot's functionality, create a new `.js` file inside the `src/commands/` directory. Each command file must export two specific elements using ES Modules syntax:

1. `data`: A `SlashCommandBuilder` instance defining the command name, description, and arguments.
2. `execute`: An asynchronous function containing the business logic.

### Example Template (`src/commands/example.js`):

```javascript
import { SlashCommandBuilder } from 'discord.js';

// Command definition for the Discord API UI
export const data = new SlashCommandBuilder()
    .setName('example')
    .setDescription('This is an example command description')
    .addStringOption(option =>
        option.setName('input')
            .setDescription('An optional text parameter')
            .setRequired(false)
    );

// Command execution handler
export async function execute(interaction, db) {
    const userInput = interaction.options.getString('input') || 'No input provided';
    
    // Your business logic or DB queries go here
    
    await interaction.reply({ 
        content: `Command executed successfully. User input: ${userInput}`, 
        ephemeral: true 
    });
}

```

After creating a new command file, always remember to re-run `node src/deploy-commands.js` to register it with Discord.

---

## Important System Notes

* **Database File**: The application automatically initializes an SQLite database file named `guild_gold.db` in the root folder upon the first successful execution. Backup this file periodically to protect historical audit data.
* **Discord Gateway Intents**: This bot requires specific privileged intents. Ensure that **Server Members Intent** and **Message Content Intent** are enabled under the Bot tab in your Discord Developer Portal.
* **Process Management**: For production environments, it is highly recommended to run this application using a process manager such as `pm2` to ensure automatic restarts in case of system crashes or unexpected downtime.


---
# in GOC

- run bot
```bash
nohup node ./src/index.js &
```

- watch logs

```bash
cat nohup.out
```

- shutdown bot 
```bahs
ps aux | grep node
kill -9 12345
```

- clean history error 
```bash
rm nohup.out
```

