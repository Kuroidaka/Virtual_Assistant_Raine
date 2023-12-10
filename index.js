require("dotenv").config();
const express = require("express")
const cors = require("cors")
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const morgan = require('morgan')
const axios = require("axios")
const DB = require("./config/database/config.js")

const app = express()
const route = require("./api/v1/route/index");
const chalk = require("chalk");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors()) 
app.use(cookieParser())
app.use(morgan('dev'))
app.use(express.json())

route(app)

const port = process.env.SERVER_PORT || 8000; 


app.listen(port, () => {
    log("Server :", chalk.blue(port), chalk.green("connected"));
})


// BOT

// const { Events, Collection } = require('discord.js');
const { client, Collection, Events } = require("./config/discord/bot.config") 
const { log } = require("./config/log/log.config");
// const sendCronMessage = require("./service/cron/vocab.js");


const TOKEN = process.env.DISCORD_BOT_TOKEN;


const fs = require('node:fs');
const path = require('node:path');

client.commands = new Collection();

const commandsPath = path.join(__dirname, './service/discord/command');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on("ready", () => {
    // if (!interaction.isChatInputCommand()) return;
    log(`✨ ${client.user.tag} is ${chalk.green("online")}! ✨ `);
    // const channelCron = interaction.channels.cache.get(process.env.CHANNEL_CRON_ID);

});

client.on('messageCreate', async interaction => {

	if (interaction.author.bot || !interaction.guild) return;
	let command

	// console.log(client.commands.get("raine").data.check(interaction))
	client.commands.each((cmd) => {
		if(cmd.data.check(interaction)) {
			command = client.commands.get(cmd.data.name);
		}
	})
	
	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {

		const { guildId } = interaction
	
		const guild = client.guilds.cache.get(guildId);
		const member = guild.members.cache.get(interaction.author.id);
		const user = member.user;

		await command.execute(interaction, user);
		// setTimeout(() => {
		// 	interaction.channel.sendTyping()
		// 	interaction.channel.send("Let's me think...")
		// }, 5000)

		// setTimeout(() => {
		// 	interaction.channel.sendTyping()
		// 	interaction.channel.send("a bit more...")
		// }, 10000)

	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// client.once('ready', async (message) => {
   
//     sendCronMessage(message, channelCron)
// });

 
// client.on('messageCreate', async message => {
//     log(chalk.cyan("catch event"))
//     if (message.author.bot || !message.guild) return;
  
   

// });

// Login to Discord with the bot's token
client.login(TOKEN);










