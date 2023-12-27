const { EmbedBuilder } = require('discord.js');

module.exports = (dependencies) => {

  const {
    discordClient
  } = dependencies

  const execute = async ({reminderPrompt}) => {
    const channelID = process.env.CHANNEL_CRON_ID

    const channel = discordClient.channels.cache.get(channelID);

    if (!channel || !reminderPrompt) {
      return;
    }
    
    const embed = new EmbedBuilder()
      .setTitle('__Reminder:__')
      .addFields({ name: 'Remind content', value: `\`\`\`${reminderPrompt}\`\`\`` })
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
  return { execute }
}
  