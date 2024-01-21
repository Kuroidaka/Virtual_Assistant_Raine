const createJob = require("./create_job")

module.exports = class reminderFunc {
  constructor(dependencies) {
    this.dependencies = dependencies
    this.funcSpec = {
      type: "function",
      function: {
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
                    - The specific time that user want to remind. 
                    - Must be GMT+0700 (Indochina Time) base on current GMT+0700 (Indochina Time): ${new Date()}, example 'Sat Nov 25 2023 00:08:02 GMT+0700 (Indochina Time)'
                    - If user request to remind after a period of time, please convert into GMT+0700 (Indochina Time): base on the current time: : ${new Date()} example 'Sat Nov 25 2023 00:08:02 GMT+0700 (Indochina Time)
                    `
                },
                repeat: {
                    type: "boolean",
                    description: "repeating the reminder or not"
                }
            },
            required: ["task", "time"]
        }
      }
    }
  }
  
  async execute ({args}) {
    const { 
      remindPrompt,
      time,
      repeat
    } = args
       
    let contentReturn = ""
    
    if(!remindPrompt) {
      contentReturn =  "user must provide what to do"
    } else if(!time) {
      contentReturn = "user must provide time"
    } else {
      const result = await createJob(this.dependencies).execute({remindPrompt, time, repeat})
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

