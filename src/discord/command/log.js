const axios = require("axios");
const { sliceString } = require("../format/length");
const chalk = require("chalk");
const { EmbedBuilder } = require('discord.js');


module.exports = {
	data: {
		name: 'avatar',
		check: (interaction) => {
			let substringToCheck = "-avatar";
			if(interaction.content.toLowerCase().includes(substringToCheck.toLowerCase())) return true 
			return false
		}
	},
	async execute(interaction) {
		try {

			const user = interaction.mentions.users.first() || interaction.author;
			const url = user.displayAvatarURL({ dynamic: true, size: 1024 });

			const embed = new EmbedBuilder()
			.setImage(url)
			.setTitle(`**${user.globalName || user.username}'s Avatar**`)
			.setURL(url)
			interaction.channel.send({ embeds: [embed] });

		} catch (error) {
			console.log(error)
		}
	},
};