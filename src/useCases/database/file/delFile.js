const chalk = require("chalk");

module.exports = (dependencies) => {
    const { DB } = dependencies;

    if (!DB) {
        throw new Error("DB should be exist in dependencies");
    }

    const execute = async ({ name }) => {
        if (!name) {
            throw new Error("id or id should be provided");
        }

        const transaction = await DB.$transaction(async (prisma) => {
            try {
                // Check if the file exists
                const existingFile = await prisma.file.findUnique({
                    where: { name: name }
                });

                // If the file doesn't exist, log a message and return
                if (!existingFile) {
                    console.log(chalk.yellow(`File with name ${name} does not exist from DB.`));
                    return;
                }

                // If the file exists, delete it
                const file = await prisma.file.delete({
                    where: { name: name }
                })

                console.log(chalk.blue("DELETE file:"), file);
                return file.id;
    
            } catch (error) {
                console.log(error)
                throw error
            }
        })
    
        return transaction;
    }

    return { execute };
};