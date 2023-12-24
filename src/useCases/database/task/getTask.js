const chalk = require("chalk")

module.exports = (dependencies) => {
	const { DB } = dependencies;

	if (!DB) {
		throw new Error("DB should be exist in dependencies");
	}

    const execute = async ({ id, hours }) => {
        try {
            let task;
            if (id === "") {
                let query = {};

                if (hours) {
                    const UTCTime = new Date(Date.now() + 60 * 60 * Number(hours)).toISOString()
                    const UTCNow = new Date().toISOString()
                    query = {
                        where: {
                            AND: [
                                {
                                    time: {
                                        lt: UTCTime // adding 1 hour to current time
                                    }
                                },
                                {
                                    time: {
                                      gt: UTCNow // current time
                                    }
                                }
                            ]
                        }
                    }
                }
    
                task = await DB.task.findMany(query);
            } else {
                task = await DB.task.findUnique({
                    where: {
                        id: id
                    },
                });
            }
            console.log(chalk.green("GET TASK:"), task);
            return task;
    
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

	return { execute };
};

