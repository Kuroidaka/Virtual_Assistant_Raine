const axios = require("axios");
const { log } = require("../../../config/log/log.config");
const chalk = require("chalk");


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

			const originURL = process.env.ORIGIN_URL || "http://localhost:8000"
			
			axios({
				method: 'post',
				url: `${originURL}/api/v1/weather/get_current`,
				params: {
					q: "Ho Chi Minh",
					lang: "vi",
				},
				headers: {
				'Content-Type': 'application/json'
				}
			})
			.then(res => {
				const newData = res.data
				if(newData) {
					interaction.channel.sendTyping()
					interaction.channel.send(JSON.stringify(newData.data))
				}
			})

		} catch (error) {
			console.log(error)
		}
	},
};