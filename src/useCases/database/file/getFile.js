const chalk = require("chalk");

module.exports = (dependencies) => {
    const { DB } = dependencies;

    if (!DB) {
        throw new Error("DB should be exist in dependencies");
    }

    const execute = async () => {
        const transaction = await DB.$transaction(async (prisma) => {
            try {
                const files = await prisma.file.findMany()
                console.log(chalk.blue("GET all files:"), files);
                return files;
    
            } catch (error) {
                console.log(error)
                throw error
            }
        })
    
        return transaction;
    }

    return { execute };
};