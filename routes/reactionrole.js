async function handleReactionEvent(reaction, user, action, rolesMap) {
    if (reaction.partial) {
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }

    console.log(`Emoji un/reacted with: ${reaction.emoji.name || reaction.emoji.id}`);
    const reactedmsgID = reaction.message.id;

    const [_, ...emojiRolePairs] = rolesMap.find(([msgId]) => msgId === reactedmsgID) || [];
    const emojiRoleMap = new Map(emojiRolePairs);

    const roleName = emojiRoleMap.get(reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name);

    if (roleName) {
        const member = reaction.message.guild.members.cache.get(user.id);
        const role = reaction.message.guild.roles.cache.find(r => r.name === roleName);
        if (member && role) {
            if (action === 'add') {
                await member.roles.add(role);
                console.log(`Added role: ${role.name} to user: ${user.tag}`);
            } else if (action === 'remove') {
                await member.roles.remove(role);
                console.log(`Removed role: ${role.name} from user: ${user.tag}`);
            }
        } else {
            console.log('Member or role not found');
        }
    }
};

module.exports = {
    handleReactionEvent,
};