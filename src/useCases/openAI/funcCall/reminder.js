const chalk = require("chalk")
const { nanoid } = require('nanoid');
const schedule = require('node-schedule');
const { EmbedBuilder } = require('discord.js');

const { detectLan } = require("../../../utils")
const RainePrompt = require("../../../assets/Raine_prompt_system.js")

module.exports = class reminderFunc {
  constructor(dependencies) {
    const {
      useCases: {
        DBUseCase: {
          taskDB: { addTask, deleteTask }
        },
      },
      discordClient,
      openAi
      
    } = dependencies
    this.dependencies = dependencies
    this.openAi = openAi
    this.discordClient = discordClient
    this.addTaskDB = addTask
    this.deleteTaskDB = deleteTask
    this.funcSpec = {
      "name": "create_reminder",
      "description": "Useful for setup reminder for user, please follow the { Reminder's instruction } to setup reminder",
      "parameters": {
          "type": "object",
          "properties": {
              "remindPrompt": {
                  "type": "string",
                  "description": "The task that AI will remind the user about. This will be based on the user's prompt, and will be enhanced to provide a more engaging reminder and will attached with some icon relate to the task. For example, if the user says 'remind me to drink water...', the 'remindPrompt' could be 'Just a friendly reminder, it's time to drink some water. Stay hydrated!'"
              },
              "time": {
                  "type": "string",
                  "description": `
                  - The specific time that user want to remind. 
                  - The specific time must be in english
                  - The specific time format is like 'Sat Nov 25 2023 00:08:02 GMT+0700 (Indochina Time)', when user want to be reminded at a specific time, please take the time in this format, the year time will be automatically set to ${new Date().getFullYear()}
                  - If user request to remind after a period of time, please convert the time in this format 'Sat Nov 25 2023 00:08:02 GMT+0700 (Indochina Time)' base on the {Current time}
                  `
              },
              
              "repeat": {
                  "type": "boolean",
                  "description": "repeating the reminder or not"
              }
          },
          "required": ["task", "time"]
      }
    }
  }

  async deleteJob(taskID) {
    if (schedule.scheduledJobs[taskID]) {
      const deleteTaskDB = this.deleteTaskDB(this.dependencies)
      await Promise.all(
        [
          deleteTaskDB.execute({id: taskID}),  //Delete task from database
          schedule.scheduledJobs[taskID].cancel() // Delete task from cron job
        ]
      )
      console.log(`Job ${taskID} cancelled`);
    } else {
        console.log(chalk.red.bold(`Job ${task} not found`));
    }
  }

  async reminderOutput(reminderPrompt) { 
    const channelID = process.env.CHANNEL_CRON_ID

    const channel = this.discordClient.channels.cache.get(channelID);

    if (channel && reminderPrompt) {
        const embed = new EmbedBuilder()
          .setTitle(`__Reminder:__`)
          .addFields(
            { name: 'Remind content', value: "```" + reminderPrompt + "```" },
          )
          .setTimestamp()
          // .setImage(url)

        channel.send({ embeds: [embed] });
      }
  }

  async scheduleJobPromise (taskID, reminderPrompt, finalTime, repeat = false) {
    console.log("Object.keys(schedule.scheduledJobs)", Object.keys(schedule.scheduledJobs))
    if(Object.keys(schedule.scheduledJobs).indexOf(taskID) === -1) {
      schedule.scheduleJob(taskID, finalTime, async () => {
        try {
          console.log(chalk.green.bold("============= SET REMINDER ============="));
          this.reminderOutput(reminderPrompt)
          if(!repeat){
            await this.deleteJob(taskID)
          }
          console.log(chalk.green.bold("============= END SET REMINDER ============="));
        } catch (error) {
          throw new Error(error);
        }
      });
    }
  };

  async createJob({remindPrompt, time, repeat = false}) {
    let finalTime
    const taskID = nanoid()
    const dataTask = {
        title: remindPrompt,
        repeat: repeat,
        id: taskID
    }

    // process time
    console.log(chalk.green.bold("Cron is ready: "), time);
    if(!isNaN(Date.parse(time))) {
      finalTime = new Date(time)
      dataTask.time = finalTime
    }

    console.log("Cron time: ", chalk.green.bold(finalTime))
  
    // setup cron job
    try {

      // promise all to insert task into database and setup cron job
      const createTask = this.addTaskDB(this.dependencies)

      const [idInserted] = await Promise.all([createTask.execute(dataTask), this.scheduleJobPromise(taskID, remindPrompt, finalTime, repeat)])
      console.log('Task ID Inserted:', idInserted);
      return ({status: 200, data: `Reminder set successful with ID: ${idInserted}`})
    } catch (error) {
      console.log(chalk.red.bold("[ERROR API]: ____REMINDER-SET-TIME___ "), error)
      return ({status: 500, error: `Reminder set failed. Error occur: ${error}`})
    }
  }
  

  async execute ({args, conversation}) {
    const { 
      remindPrompt,
      time,
      repeat
    } = args

       
    if(!remindPrompt) {
      conversation.push({
        role: "user",
        content: "user must provide what to do"
      })
    } else if(!time) {
      conversation.push({
        role: "user",
        content: "user must provide time"
      })
    } else {
      const result = await this.createJob({remindPrompt, time, repeat})
      if(result?.status === 500) {
        conversation.push({
          role: "assistant",
          content: `Error occur while trying to setup reminder, let user know about this bug in create_reminder function: ${result.error}`
        })
      }
      else {
        conversation.push({
          role: "assistant",
          content: result.data
        })
      }
    }
    return conversation
  }
}

