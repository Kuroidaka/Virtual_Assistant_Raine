const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');
const chalk = require("chalk")
const eventHandler = require('./eventHandler')

module.exports = (dependencies) => {

    const { discordClient } = dependencies

     // BOT
     const TOKEN = process.env.DISCORD_BOT_TOKEN;
     discordClient.commands = new Collection();

     const commandsPath = path.join(__dirname, './command');
     const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

     for (const file of commandFiles) {
         const filePath = path.join(commandsPath, file);
         const command = require(filePath);
         // Set a new item in the Collection with the key as the command name and the value as the exported module
         if ('data' in command && 'execute' in command) {
             discordClient.commands.set(command.data.name, command);
         } else {
             console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
         }
     }

     discordClient.on("ready", () => {
        console.log(`✨ ${discordClient.user.tag} is ${chalk.green("online")}! ✨ `);
     });

     discordClient.on('messageCreate', async interaction => {

         if (interaction.author.bot || !interaction.guild) return;
         let command

         eventHandler.detectUserSendFile(dependencies).execute({interaction})

         discordClient.commands.each((cmd) => {
             if(cmd.data.check(interaction)) {
                 command = discordClient.commands.get(cmd.data.name);
             }
         })
         
         if (!command) {
             console.error(`No command matching ${interaction.commandName} was found.`);
             return;
         }

         try {

             const { guildId } = interaction
         
             const guild = discordClient.guilds.cache.get(guildId);
             const member = guild.members.cache.get(interaction.author.id);
             const user = member.user;

             await command.execute(interaction, user);
         } catch (error) {
             console.error(error);
             if (interaction.replied || interaction.deferred) {
                 await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
             } else {
                 await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
             }
         }
     });

     // Login to Discord with the bot's token
     discordClient.login(TOKEN);

}