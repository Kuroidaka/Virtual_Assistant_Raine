const schedule = require('node-schedule');
const reminderClass = require("../useCases/openAI/funcCall/reminder")

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

        const reminderFunc = new reminderClass(dependencies)

        if(tasks.length > 0) {
            const promise = []
            tasks.forEach(task => {
                const { id, title, time, repeat } = task
                promise.push(reminderFunc.scheduleJobPromise(id, title, time, repeat))
            })

            await Promise.all(promise)
        }
    }

    const execute = async () => {
        await syncData()
        schedule.scheduleJob("sync-remind", "0 * * * * *", async () => {
            syncData()
        })
    }

    return { execute }
}