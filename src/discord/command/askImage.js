const axios = require("axios");
const chalk = require("chalk");


module.exports = {
	data: {
		name: 'raine-image',
		check: (interaction) => {
			let substringToCheck = "-img";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())){
				console.log(chalk.red("raine-image"))
				return true 
			}

			return false
		}
	},
	async execute(interaction, user) {
		try {
			// console.log(`Channel ID: ${interaction.channel.id}`);
			const maxTokenEachScript = 2000 
			console.log(chalk.blue("API image"))
			console.log(chalk.blue("interaction.content", interaction))
	
			interaction.channel.sendTyping()

			const originURL = process.env.ORIGIN_URL || "http://localhost:8000"
			axios.post(`${originURL}/api/v1/chatgpt/image/ask`, {
				prompt: interaction.content,
				qty: 2,
				guildId: interaction.guildId
				
			})
			.then(res => {
				const newData = res.data.data
				console.log("newData", newData)
				if(newData) {
					interaction.channel.sendTyping()
					newData.map(image => {
						interaction.channel.send(image.url)
					})
				}
			})

		} catch (error) {
			console.log(error)
		}
	},
};