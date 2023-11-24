const axios = require("axios");
const { sliceString } = require("../format/length");


module.exports = {
	data: {
		name: 'raine',
		check: (interaction) => {
			let substringToCheck = "hey raine";
			let botName = "raine"
			if(interaction.mentions?.users?.first()?.id === process.env.RAINE_ID 
			|| interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())
			|| interaction.content.toLowerCase().includes(botName.toLowerCase())) return true 

			return false
		}
	},
	async execute(interaction, user) {
		try {
			// console.log(`Channel ID: ${interaction.channel.id}`);
			const maxTokenEachScript = 2000 
			let substringToCheck = "hey raine";
			let botName = "raine"
			interaction.channel.sendTyping(10)

			if(interaction.mentions?.users?.first() && interaction.mentions?.users?.first()?.id !== process.env.RAINE_ID) {
				interaction.content = interaction.content.replace(`<@${interaction.mentions?.users?.first()?.id}>`, interaction.mentions?.users?.first()?.username)
			}
			interaction.content.toLowerCase().includes(botName.toLowerCase()) || interaction.content.toLowerCase().includes(substringToCheck.toLowerCase()) ? interaction.content = interaction.content.replace(botName, "") : interaction.content = interaction.content.replace(substringToCheck, "")

			await interaction.react("🔍").then(reaction => {
				const originURL = process.env.ORIGIN_URL || "http://localhost:8000"
				axios.post(`${originURL}/api/v1/chatgpt/ask`, {
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
				.catch(async err => {
					console.log(err)
					reaction.remove().catch(error => console.error('Failed to remove reactions: ', error));
					await interaction.react("☠️")
					interaction.channel.send("Error Occur", err)
				})

			})

		
		} catch (error) {
			console.log(error)
		}
	},
};