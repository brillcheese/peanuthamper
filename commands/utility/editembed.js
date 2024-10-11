const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit')
		.setDescription('Edits an existing embed')
		.addStringOption(option => 
            option.setName('messageid')
                .setDescription('The ID of the message containing the embed')
                .setRequired(true))
		.addStringOption(option => 
            option.setName('title')
                .setDescription('The new title of the embed')
                .setRequired(true))
		.addStringOption(option => 
            option.setName('description')
                .setDescription('The new description of the embed')
                .setRequired(true))
		.addStringOption(option => 
            option.setName('color')
                .setDescription('The new color of the embed (in hex format, e.g., #ffffff)')
                .setRequired(false)),
	async execute(interaction) {
        const allowedRoles = ['1275567159614898318']; 
		const hasRole = interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));

		if (!hasRole) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}
		const messageID = interaction.options.getString('messageid');
		const newTitle = interaction.options.getString('title');
		const newDescription = interaction.options.getString('description');
		let newColor = interaction.options.getString('color') || '#ffffff'; // Default color if not provided

		// Validate color input
		if (!/^#[0-9A-F]{6}$/i.test(newColor)) {
			newColor = '#ffffff'; // Set to white if invalid
		}

		// Fetch the message by its ID
		try {
			const message = await interaction.channel.messages.fetch(messageID);

			// Check if the message contains an embed
			if (!message.embeds || message.embeds.length === 0) {
				return interaction.reply({ content: 'Message does not contain an embed.', ephemeral: true });
			}

			// Create a new embed with the updated information
			const updatedEmbed = new EmbedBuilder()
				.setTitle(newTitle)
				.setDescription(newDescription)
				.setColor(newColor);

			// Edit the message with the new embed
			await message.edit({ embeds: [updatedEmbed] });

			// Send a confirmation message
			await interaction.reply({ content: 'Embed updated successfully!', ephemeral: true });
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'Could not find or edit the message. Make sure the message ID is correct.', ephemeral: true });
		}
	},
};
