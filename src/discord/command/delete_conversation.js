const axios = require('axios');

module.exports = {
	data: {
		name: 'delete_conversation',
		check: (interaction) => {
			let substringToCheck = "-del_con";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())) return true 
			return false
		}
	},
	async execute(interaction) {
		try {

			const originURL = process.env.ORIGIN_URL || `http://localhost:${process.env.SERVER_PORT}`
			await axios.post(`${originURL}/api/v1/conversation/delete`, {
				data: {
					conversationId: "82d46cfd-2a00-4a73-9353-8b3397d9c333",
					from: "discord"
				}
				
			})
            .then(res => {
                if(res.statusText === "OK"){
                    interaction.channel.send(res.data.data)
                }
            })
            .catch(error => {
                console.log(error.data)
            })
			// interaction.reply("pong")	  
			
		} catch (error) {
			console.log(error)
		}
	},
};