const axios = require("axios");
const { log } = require("../../../config/log/log.config");
const chalk = require("chalk");
const weatherService = require("../../functionList/weather.func");


module.exports = {
	data: {
		name: 'raine-weather2',
		check: (interaction) => {
			let substringToCheck = "-weat2";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())){
				log(chalk.red("raine-weather2"))
				return true 
			}

			return false
		}
	},
	async execute(interaction, user) {
		try {
			// console.log(`Channel ID: ${interaction.channel.id}`);
			const maxTokenEachScript = 2000 
			log(chalk.blue("API weather2"))
			log(chalk.blue("interaction.content", interaction))
	
			interaction.channel.sendTyping()

			const originURL = process.env.ORIGIN_URL || "http://localhost:8000"
			axios.post(`${originURL}/api/v1/chatgpt/ask-for-func`, {
				data: interaction,
				maxTokenEachScript: maxTokenEachScript,
				curUser: user,
			})
			.then(res => {
				console.log(res.data.data.length)
				const newData = sliceString(res.data.data, maxTokenEachScript)
				newData.map(msg => {
					interaction.channel.send(msg)
				})
			})
			.catch(err => {
				console.log(err)
				interaction.channel.send("Error Occur")
			})

		} catch (error) {
			console.log(error)
		}
	},
};