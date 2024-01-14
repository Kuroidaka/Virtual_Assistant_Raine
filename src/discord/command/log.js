const axios = require('axios');

module.exports = {
	data: {
		name: 'ping',
		check: (interaction) => {
			let substringToCheck = "-ping";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())) return true 
			return false
		}
	},
	async execute(interaction) {
		try {

			// const originURL = process.env.ORIGIN_URL || `http://localhost:${process.env.SERVER_PORT}`
			// await axios.post(`${originURL}/api/v1/studyio/create`, {
			// 	data: {
			// 		conversationId: null,
			// 		from: "discord",
			// 		messages: {
			// 			text: interaction.content,
			// 			sender: "user",
			// 			senderID: interaction.author.id
			// 		},
			// 		maxToken: 150
			// 	}
				
			// })
            // .then(res => {
            //     if(res.statusText === "OK"){
            //         interaction.channel.send(res.data.data)
            //     }
            // })
            // .catch(error => {
            //     console.log(error.data)
            // })
			interaction.reply("pong")	  
			
		} catch (error) {
			console.log(error)
		}
	},
};