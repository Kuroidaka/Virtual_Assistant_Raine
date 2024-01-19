const fs = require('fs')
const path = require('path')
const { AttachmentBuilder, EmbedBuilder } = require('discord.js')

module.exports = (dependencies) => {
  const { discordClient } = dependencies

  const execute = async ({ directoryPath }) => {
    try {
      // console.log(`Logged in as ${discordClient.user.tag}!`);

      // specify the guild and channel ID
      const guildId = process.env.GUILD_ID
      const channelId = process.env.CHANNEL_IMG_ID

      // get the guild
      const guild = discordClient.guilds.cache.get(guildId)

      if (!guild) return console.log('Unable to find the guild.')

      // get the channel
      const channel = guild.channels.cache.get(channelId)

      if (!channel) return console.log('Unable to find the channel.')

      // read all files in the directory
      let files = fs.readdirSync(directoryPath)

      // Define a new function
      function sendAttachment(file) {
        const filePath = path.join(directoryPath, file)
        const attachment = new AttachmentBuilder(filePath)

        const Embed = new EmbedBuilder().setTitle('Some title')
        // .setImage('attachment://discordjs.png');

        return channel
          .send({ embeds: [Embed], files: [attachment] })
          .then((message) => {
            // console.log(message.attachments.first().url); // log the URL of the attachment
            return message.attachments.first().url
          })
          .catch((err) => {
            console.error(err)
            throw err
          })
      }

      // Use map() to create an array of promises
      let promiseArray = files.map(sendAttachment)

      const imageList = await Promise.all(promiseArray)
        .then((results) => {
          return results
        })
        .catch((err) => {
          console.error(err)
        })
      // console.log(imageList)
      return imageList
      
    } catch (error) {
      console.log(error)
      return error
    }
  }

  return { execute }
}
