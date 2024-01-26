const calculateFutureTime = (time, intervalInMinutes) => {
    // Convert the initial time and current time to minutes
    let initialTimeInMinutes = time.getHours() * 60 + time.getMinutes();
    let currentTimeInMinutes = new Date().getHours() * 60 + new Date().getMinutes();

    // Calculate how many intervals have passed since the initial time
    let intervalsPassed = Math.floor((currentTimeInMinutes - initialTimeInMinutes) / intervalInMinutes);

    // Calculate the next reminder time in minutes
    let nextReminderTimeInMinutes = (intervalsPassed + 1) * intervalInMinutes + initialTimeInMinutes;

    // Create a new Date object for the next reminder time
    let nextReminderTime = new Date();
    nextReminderTime.setHours(Math.floor(nextReminderTimeInMinutes / 60));
    nextReminderTime.setMinutes(nextReminderTimeInMinutes % 60);

    // Ensure the next reminder time is in the future
    if (nextReminderTime <= new Date()) {
        nextReminderTimeInMinutes += intervalInMinutes;
        nextReminderTime.setHours(Math.floor(nextReminderTimeInMinutes / 60));
        nextReminderTime.setMinutes(nextReminderTimeInMinutes % 60);
    }

    return nextReminderTime;
}

module.export = calculateFutureTime