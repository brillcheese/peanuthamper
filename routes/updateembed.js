const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const channelId = '1275223613259251804'; // Your channel ID
const baseUrl = 'https://brillcheese.com/';

async function updateEmbeds(client) {
    const channel = await client.channels.fetch(channelId);
    let messages = [];
    let lastId;

    // Fetch all messages in the channel
    while (true) {
        const fetchedMessages = await channel.messages.fetch({ limit: 100, before: lastId });
        if (fetchedMessages.size === 0) break;
        messages = messages.concat(Array.from(fetchedMessages.values()));
        lastId = fetchedMessages.last().id;
    }

    for (const message of messages) {
        if (message.embeds.length > 0) {
            const embed = message.embeds[0];
            if (embed.image) {
                const fileUrl = embed.image.url;
                
                if (fileUrl.includes('_unv')) {
                    const filePath = path.resolve(__dirname, '../..', 'public', fileUrl.replace(baseUrl, ''));
                    const newFilePath = filePath.replace('_unv', '');

                    if (fs.existsSync(newFilePath)) {
                        // File verified, update image
                        const newFileUrl = fileUrl.replace('_unv', '');
                        const updatedEmbed = new EmbedBuilder(embed)
                            .setImage(newFileUrl)
                            .setColor('#00FF00'); // Mark as verified (green)

                        await message.edit({ embeds: [updatedEmbed] });
                        console.log(`Updated embed to verified for message ID: ${message.id}`);
                    } else {
                        // File deleted, update to show deleted image
                        const updatedEmbed = new EmbedBuilder(embed)
                            .setImage('https://brillcheese.com/images/drawbox/deletedimage.png')
                            .setColor('#FF0000'); // Mark as deleted (red)

                        await message.edit({ embeds: [updatedEmbed] });
                        console.log(`Updated embed to deleted for message ID: ${message.id}`);
                    }
                }
            }
        }
    }

    console.log('All embeds updated.');
}

module.exports = { updateEmbeds };
