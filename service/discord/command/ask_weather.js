const axios = require("axios");
const { log } = require("../../../config/log/log.config");
const chalk = require("chalk");
const weatherService = require("../../functionList/weather.func");


module.exports = {
	data: {
		name: 'raine-weather',
		check: (interaction) => {
			let substringToCheck = "-weat";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())){
				log(chalk.red("raine-weather"))
				return true 
			}

			return false
		}
	},
	async execute(interaction, user) {
		try {
			// console.log(`Channel ID: ${interaction.channel.id}`);
			const maxTokenEachScript = 2000 
			log(chalk.blue("API weather"))
			log(chalk.blue("interaction.content", interaction))
	
			interaction.channel.sendTyping()

			await weatherService.getByLocation("Ho Chi Minh", "vi")
			.then(res => {
				const newData = res.data
				if(newData) {
					interaction.channel.sendTyping()
					interaction.channel.send(JSON.stringify(newData))
				}
			})

		} catch (error) {
			console.log(error)
		}
	},
};