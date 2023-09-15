const axios = require("axios");
const { sliceString } = require("../format/length");
const { log } = require("../../../config/log/log.config");
const chalk = require("chalk");


module.exports = {
	data: {
		name: 'translate',
		check: (interaction) => {
			let substringToCheck = "-trans";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())) return true 
			return false
		}
	},
	async execute(interaction, user) {
		try {
			// console.log(`Channel ID: ${interaction.channel.id}`);
			const maxTokenEachScript = 2000 
			interaction.channel.sendTyping()

            interaction.content = interaction.content.replace("-trans", "")

			const originURL = process.env.ORIGIN_URL || "http://localhost:8000"
			axios.post(`${originURL}/api/v1/chatgpt/trans`, {
				prompt: interaction.content,
				maxTokenEachScript: maxTokenEachScript,
			})
			.then(res => {
                log(chalk.green("translate result:"), res.data)
                interaction.channel.send(res.data.data)
			})    
		
		} catch (error) {
			console.log(error)
		}
	},
};