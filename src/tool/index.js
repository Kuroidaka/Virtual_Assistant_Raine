const syncReminderTool = require("./syncReminder")

module.exports = (dependencies) => {
    const syncReminder = syncReminderTool(dependencies)
    syncReminder.execute()
}