const { nanoid } = require("nanoid");
const chalk = require("chalk")


module.exports = (dependencies) => {
	const { DB } = dependencies;

	if (!DB) {
		throw new Error("DB should be exist in dependencies");
	}

	const execute = async ({ 
        id=nanoid() ,
        name,
        path,
        extension,
        size,
        url
    }) => {

        const fileData = {
            id,
            name,
            path,
            extension,
            size,
            url
        }

        const transaction = await DB.$transaction(async (prisma) => {
        try {
            const file = await prisma.file.create({
                data: fileData
            })
            console.log( chalk.blue("ADD file:"), file);
            return file.id
    
        } catch (error) {
            console.log(error)
            return {
                msg: error,
                isError: true
            }
        }
        })
    
        return transaction;
      }

	return { execute };
};