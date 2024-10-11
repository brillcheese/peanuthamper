const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('embed')
		.setDescription('Creates a custom embed')
		.addStringOption(option => 
            option.setName('title')
                .setDescription('The title of the embed')
                .setRequired(true))
		.addStringOption(option => 
            option.setName('description')
                .setDescription('The description of the embed')
                .setRequired(true))
		.addStringOption(option => 
            option.setName('color')
                .setDescription('The color of the embed (in hex format, e.g., #ffffff)')
                .setRequired(false)),
	async execute(interaction) {
		const allowedRoles = ['1275567159614898318']; 
		const hasRole = interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));

		if (!hasRole) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}
		// Get the values from the options
		const title = interaction.options.getString('title');
		const description = interaction.options.getString('description');
		let color = interaction.options.getString('color') || '#ffffff'; // Default color if not provided

		// Validate color input
		if (!/^#[0-9A-F]{6}$/i.test(color)) {
			color = '#ffffff'; // Set to white if invalid
		}

		// Create the embed
		const embed = new EmbedBuilder()
			.setTitle(title)
			.setDescription(description)
			.setColor(color);

		// Send the embed in the channel
		await interaction.reply({ content: 'created!', ephemeral: true });
		await interaction.channel.send({ embeds: [embed] });
	},
};
