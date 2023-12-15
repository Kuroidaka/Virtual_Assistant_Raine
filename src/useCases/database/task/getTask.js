const chalk = require("chalk")

module.exports = (dependencies) => {
	const { DB } = dependencies;

	if (!DB) {
		throw new Error("DB should be exist in dependencies");
	}

	const execute = async ({ id }) => {
        
        const transaction = await DB.$transaction(async (prisma) => {
        try {
            let task
            if(id === "") {
                task = await prisma.task.findMany()
            }else {
                task = await prisma.task.findUnique({
                    where: {
                        id: id
                    },
                })
            }
            console.log( chalk.green("GET TASK:"), task);
            return task
    
        } catch (error) {
            console.log(error)
            throw error
        }
        })
    
        return transaction;
      }

	return { execute };
};