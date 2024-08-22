const { Client, Partials, Collection, GatewayIntentBits, Events } = require('discord.js');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const client = new Client(
    { intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ] ,
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
}
);

const { token } = require('./config.json');

const rolesMap = [
    ["1275693275142946826", 
        ["🟨", "Command"],
        ["🟥", "Operations"],
        ["🟦", "Sciences"],
        ["🩻", "Medical"]
    ],
    ["1275727908383490081",
        ["🎮", "Gaming"],
        ["🖖", "Trek"],
        ["🎨", "Art"]
    ]
];

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    try {
        const channel = client.channels.cache.get("1275568686144684094");
        
        for (const [messageId, ...emojiRolePairs] of rolesMap) {
            const message = await channel.messages.fetch(messageId);

            for (const [emoji] of emojiRolePairs) {
                try {
                    await message.react(emoji);
                } catch (error) {
                    console.error(`Error adding reaction ${emoji}:`, error);
                }
            }
        }
        
    } catch (error) {
        console.error('Error fetching message or adding reaction:', error);
    }
});



// HANDLE SLASH COMMANDS

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (interaction.isChatInputCommand()) {
		const command = client.commands.get(interaction.commandName);
		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	}
});

// DRAWBOX ROUTE

const drawbox = require('./routes/drawbox');
app.post('/submit', (req, res) => {
    drawbox.handleSubmit(req, res, client);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() && (interaction.customId !== 'verify' || interaction.customId !== 'delete')) return;
    console.log("PENIS")
    drawbox.handleButtonInteraction(interaction);
});   


// REACTION ROLES

const reactionrole = require('./routes/reactionrole.js');
client.on(Events.MessageReactionAdd, (reaction, user) => reactionrole.handleReactionEvent(reaction, user, 'add', rolesMap));
client.on(Events.MessageReactionRemove, (reaction, user) => reactionrole.handleReactionEvent(reaction, user, 'remove', rolesMap));


// LOGIN AND INIT SERVER

client.login(token);

// START SERVER ON PORT 3000 (important when submitting post req from drawbox code)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`); // NOTIFY WHEN PORT SUCCESFULLY STARTS
});
