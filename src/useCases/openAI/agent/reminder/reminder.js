const createJob = require("./create_job")

module.exports = class reminderFunc {
  constructor(dependencies) {
    this.dependencies = dependencies
    this.funcSpec = {
      name: "create_reminder",
      description: "Useful for setup reminder for user, please follow the { Reminder's instruction } to setup reminder",
      parameters: {
          type: "object",
          properties: {
              remindPrompt: {
                  type: "string",
                  description: "The task that AI will remind the user about. This will be based on the user's prompt, and will be enhanced to provide a more engaging reminder and will attached with some icon relate to the task. For example, if the user says 'remind me to drink water...', the 'remindPrompt' could be 'Just a friendly reminder, it's time to drink some water. Stay hydrated!'"
              },
              time: {
                  type: "string",
                  description: `
                  - if user want to remind repeatedly please use the CURRENT TIME ${new Date()} 
                  - The specific time that user want to remind. 
                  - Must be GMT+0700 (Indochina Time) base on current GMT+0700 (Indochina Time): ${new Date()}, example 'Sat Nov 25 2023 00:08:02 GMT+0700 (Indochina Time)'
                  - If user request to remind after a period of time, please convert into GMT+0700 (Indochina Time): base on the current time: : ${new Date()} example 'Sat Nov 25 2023 00:08:02 GMT+0700 (Indochina Time)
                  `
              },
              cronTime: {
                  type: "string",
                  description: `
                  - time can in cron format, example: for every 5 minutes: */5 * * * *, when user want to remind every number of minutes, 
                  - Only use this when user want to be reminded repeatedly
                  `
              },
              reminderInterval: {
                  type: "string",
                  description: "The interval that user want to remind. Should be only in minutes. Example: '5' means remind every 5 minutes"
              },
              repeat: {
                  type: "boolean",
                  description: "repeating the reminder or not",
                  default: false
              }
          },
          required: ["task", "time"]
      }
      
    }
  }
  
  async execute ({args}) {
    const { 
      remindPrompt,
      time,
      repeat,
      reminderInterval=0,
      cronTime
    } = args
       
    let contentReturn = ""
    
    if(!remindPrompt) {
      contentReturn =  "user must provide what to do"
    } else if(!time) {
      contentReturn = "user must provide time"
    } else {
      const result = await createJob(this.dependencies).execute({remindPrompt, time, repeat, reminderInterval, cronTime})
      if(result?.status === 500) {
        contentReturn = `Error occur while trying to setup reminder, let user know about this bug in create_reminder function: ${result.error}`
        throw new Error(result.error)
      }
      else {
        contentReturn = result.data
      }
    }
    return { content: contentReturn }
  }
}

