const chalk = require("chalk")

module.exports = (dependencies) => {
	const { DB } = dependencies;

	if (!DB) {
		throw new Error("DB should be exist in dependencies");
	}

	const execute = async({ id }) => {
        const transaction = await DB.$transaction(async (prisma) => {
        try {
            const task = await prisma.task.findUnique({
                where: { id: id },
            });

            if (task) {
                await prisma.task.delete({
                    where: {
                        id: id
                    },
                })
                console.log( chalk.red("DELETED TASK:"), task);
            }
        } catch (error) {
            console.log(error)
            throw error
        }
        })

        return transaction;
    }

	return { execute };
};