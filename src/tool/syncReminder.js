const schedule = require('node-schedule');
const cronSchedule = require("../useCases/openAI/agent/reminder/cron_schedule")

module.exports = (dependencies) => {

    const { 
        useCases: {
            DBUseCase: {
                taskDB: {
                    getTask
                }
            }
        }
     } = dependencies

    const syncData = async () => {

        
        const getTaskReminder = getTask(dependencies)
        const tasks = await getTaskReminder.execute({ id: "", hours: 1000 })


        if(tasks.length > 0) {
            const promise = []
            tasks.forEach(task => {
                const { id, title, time, repeat, interval } = task
                const cronJob = cronSchedule(dependencies)

                promise.push(cronJob.execute({
                    taskID: id,
                    remindPrompt: title,
                    finalTime: time,
                    repeat: repeat,
                    reminderInterval: interval
                }))
            })

            await Promise.all(promise)
        }
        console.log("JOBS: ", Object.keys(schedule.scheduledJobs))
    }

    const execute = async () => {
        await syncData()
        schedule.scheduleJob("sync-remind", "0 * * * *", async () => {
            syncData()
        })
    }

    return { execute }
}