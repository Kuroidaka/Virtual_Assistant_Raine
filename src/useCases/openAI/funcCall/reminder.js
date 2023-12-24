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
    this.list_job = {}
    this.funcSpec = {
      "name": "create_reminder",
      "description": "Remind user to do something after a period of time or at a specific time, if user do not provide what to do, then ask user to provide",
      "parameters": {
          "type": "object",
          "properties": {
              "task": {
                  "type": "string",
                  "description": "The task that user want to be reminded",
              },
              "time": {
                  "type": "string",
                  "description": `
                  - The specific time that user want to remind. 
                  - The specific time must be in english
                  - The specific time format is like 'Sat Nov 25 2023 00:08:02 GMT+0700 (Indochina Time)', when user want to be reminded at a specific time, please take the time in this format, the year time will be automatically set to ${new Date().getFullYear()}
                  - If user request to remind after a period of time, please convert the time in this format 'Sat Nov 25 2023 00:08:02 GMT+0700 (Indochina Time)' base on the {Current time}
                  `,
              },
              
              "repeat": {
                  "type": "boolean",
                  "description": "repeating the reminder or not",
              }
          },
          "required": ["task", "time"],
      }
    }
  }

  convertTime(time) {
    const minutesPattern = /\b(\d+)\s*(m|minutes|minute)\b/i;
    const hoursPattern = /\b(\d+)\s*(h|hours|hour)\b/i;
    const secondsPattern = /\b(\d+)\s*(s|seconds|second)\b/i;
    const daysPattern = /\b(\d+)\s*(d|days|day)\b/i;
    const monthsPattern = /\b(\d+)\s*(months|month|mo)\b/i;
    const tomorrowPattern = /^tomorrow:(\d{1,2})(?::(\d{2}))?$/
   
    if(secondsPattern.test(time)) {
        const seconds = `*/${time.match(secondsPattern)[1]} * * * * *`;
        return {
            time: seconds,
        };
    } else if(minutesPattern.test(time)) {
        const minutes = `*/${time.match(minutesPattern)[1]} * * * *`;
        return {
            time: minutes,
        };
    } else if(hoursPattern.test(time)) {
        const hours = `0 */${time.match(hoursPattern)[1]} * * *`;
        return {
            time: hours,
        };
    } else if(daysPattern.test(time)) {
        const days = `0 0 */${time.match(daysPattern)[1]} * *`;
        return {
            time: days,
        };
    } else if(monthsPattern.test(time)) {
      const months = `0 0 0 */${time.match(daysPattern)[1]} *`;
        return {
            time: months,
        };
    } else if(tomorrowPattern.test(time)) {
      const tomorrow = `0 ${time.match(tomorrowPattern)[2] ? time.match(tomorrowPattern)[2] : "0"} ${time.match(tomorrowPattern)[1]} */1 * *`;
      return {
            time: tomorrow,
        };
    }
    else {
        return {
            time: undefined,
            msg: 'This is not a measure of time'
        };
    }
  }

  async deleteJob(task) {
    if (this.list_job[task]) {
      this.list_job[task].cancel();
      delete this.list_job[task];
      console.log(`Job ${task} cancelled`);
    } else {
        console.log(chalk.red.bold(`Job ${task} not found`));
    }
  }

  async reminderOutput(task) { 
    const channelID = process.env.CHANNEL_CRON_ID

    const channel = this.discordClient.channels.cache.get(channelID);

    if (channel) {
      const detectTaskLang = detectLan(task)
      console.log("Language detect from task", detectTaskLang)
      // advance response reminder
      const instructions = RainePrompt()
      const completion = await this.openAi.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: "system", content: instructions.tools.task.reminder },
          { role: "user", content: `This is what user want to be reminded, please tell it to user: ${task}`},
        ],
        temperature: 1,
        max_tokens: 200,
      })

      const content = await completion.choices[0].message.content
      if(content) {
        const embed = new EmbedBuilder()
        // .setImage(url)
        .setTitle(`__Reminder:__`)
        .addFields(
          { name: 'Remind content', value: "```" + content + "```" },
        )
        .setTimestamp()
        channel.send({ embeds: [embed] });
      }

      }
      
  }

  async scheduleJobPromise (taskID, task, finalTime, repeat = false) {
    this.list_job[task] = schedule.scheduleJob(task, finalTime, async () => {
      try {
        console.log(chalk.green.bold("============= SET REMINDER ============="));
        this.reminderOutput(task)
        if(!repeat){
          schedule.cancelJob(task);
          // delete job from database
          const deleteTaskDB = this.deleteTaskDB(this.dependencies)
          await Promise.all([deleteTaskDB.execute({id: taskID}), this.deleteJob(task)])
        }
        console.log(chalk.green.bold("============= END SET REMINDER ============="));
      } catch (error) {
        throw new Error(error);
      }
  });
  };

  async createJob({task, time, repeat = false}) {
    const self = this;
    let finalTime
    const taskID = nanoid()
    const dataTask = {
        title: task,
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
      const [idInserted] = await Promise.all([createTask.execute(dataTask), this.scheduleJobPromise(taskID, task, finalTime, repeat)])
      console.log('Task ID Inserted:', idInserted);
      return ({status: 200, data: `Reminder set successful with ID: ${idInserted}`})
    } catch (error) {
      console.log(chalk.red.bold("[ERROR API]: ____REMINDER-SET-TIME___ "), error)
      return ({status: 500, error: `Reminder set failed. Error occur: ${error}`})
    }
  }

  async execute ({args, conversation}) {
    const { 
      task,
      time,
      repeat
    } = args

       
    if(!task) {
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
      const result = await this.createJob({task, time, repeat})
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

