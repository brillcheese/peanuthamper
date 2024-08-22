const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const secretToken = '671328';
const channelId = '1275223613259251804'; 
const baseUrl = 'https://brillcheese.com/';

function handleButtonInteraction(interaction) {
    console.log("interaction logged PENIS")
    if (!interaction.member.roles.cache.some(r => r.name === 'Fleet Admiral')){
        const file = new AttachmentBuilder('http://brillcheese.com/images/nuhuh.webp');
        
        interaction.reply({ content: 'You do not have hte necessary roles required to verify/delete drawbox submissions.',files: [file], ephemeral: true });
    } else {

    const fileUrl = interaction.message.embeds[0].image.url;
    const filePath = path.resolve(__dirname, '../..', 'public', fileUrl.replace(baseUrl, ''));

    if (interaction.customId === 'verify') {
        const newFilePath = filePath.replace('_unv', '');
        fs.renameSync(filePath, newFilePath); 
        interaction.reply({ content: 'Image verified!', ephemeral: true });

        interaction.message.edit({
            embeds: [new EmbedBuilder()
                .setTitle('A new drawing has been submitted :3')
                .setImage(fileUrl)
                .setColor('#00FF00')
            ],
            components: []
        });
        
    } else if (interaction.customId === 'delete') {
        fs.unlinkSync(filePath); 
        interaction.reply({ content: 'Image deleted.', ephemeral: true });
        interaction.message.edit({
            embeds: [new EmbedBuilder()
                .setTitle('A new drawing has been submitted :3')
                .setImage(fileUrl)
                .setColor('#FF0000')
            ],
            components: []
        });
    }
}
}
function handleSubmit(req, res, client) {
    console.log(req.body);
    const { filePath, token } = req.body;
    const trufilePath = path.resolve(__dirname, '../..', 'public', filePath.substring(10));
    const fileUrl = `${baseUrl}${filePath.substring(10)}`;

    console.log(trufilePath)

    if (token !== secretToken) {
        return res.status(403).json({ success: false, message: 'Unauthorized request.' });
    }

    if (!fs.existsSync(trufilePath)) {
        console.error('File does not exist:', trufilePath);
        return res.status(400).json({ success: false, message: 'Invalid file path.' });
    }

    const embed = new EmbedBuilder()
        .setTitle('A new drawing has been submitted :3')
        .setImage(fileUrl)
        .setColor('#0099ff')
        .addFields(
            { name: 'Options', value: 'Verify or delete image from server, thanks!' }
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('verify')
                .setLabel('Verify')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('delete')
                .setLabel('Delete')
                .setStyle(ButtonStyle.Danger),
        );

    client.channels.cache.get(channelId).send({
        embeds: [embed],
        components: [row],
    });

    console.log("Image sent to Discord");
    res.json({ success: true, message: 'Image link sent to Discord.' });
}

module.exports = {
    handleButtonInteraction,
    handleSubmit,
};
