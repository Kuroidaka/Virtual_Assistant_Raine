const axios = require('axios');
const geoip = require('geoip-lite');

module.exports = {
	data: {
		name: 'ping',
		check: (interaction) => {
			let substringToCheck = "ping";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())) return true 
			return false
		}
	},
	async execute(interaction) {
		try {

			interaction.reply("pong")	  
			
		} catch (error) {
			console.log(error)
		}
	},
};