
const dependencies = require("../../config/dependencies")
const chalk = require("chalk");


module.exports = {
	data: {
		name: 'raine-clear',
		check: (interaction) => {
			let substringToCheck = "-rs";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())){
				console.log(chalk.red("raine-clear"))
				return true 
			}

			return false
		}
	},
	async execute(interaction, user) {
		try {
			const { useCases: { 
				redisUseCase: { clearConversation }
			} } = dependencies;
			
            const isSuccesed = clearConversation(dependencies).execute({prepareKey: interaction.channelId})
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