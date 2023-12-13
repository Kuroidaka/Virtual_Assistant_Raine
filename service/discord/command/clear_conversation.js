const axios = require("axios");
const { log } = require("../../../config/log/log.config");
const chalk = require("chalk");
const redisService = require("../../redis/redis.service");


module.exports = {
	data: {
		name: 'raine-clear',
		check: (interaction) => {
			let substringToCheck = "-rs";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())){
				log(chalk.red("raine-clear"))
				return true 
			}

			return false
		}
	},
	async execute(interaction, user) {
		try {
				
			interaction.channel.sendTyping()

            const isSuccesed = redisService.clearConversation(interaction.channelId)
            if(isSuccesed) {
                await interaction.react("☑️")
            }
            else {
                await interaction.react("☠️")
                interaction.channel.send("Error Occur", err)
            }

		} catch (error) {
			console.log(error)
            await interaction.react("☠️")
            interaction.channel.send("Error Occur", err)

		}
	},
};