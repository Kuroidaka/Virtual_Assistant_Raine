const updateFuncIntoMsg = (dependencies) => {
    const { DB } = dependencies;

    if (!DB) {
        throw new Error("DB should be exist in dependencies");
    }

    const execute = async ({ messageId, functionData }) => {
        await DB.message.update({
            where: {
                id: messageId
            },
            data: {
                functionList: {
                    push: functionData
                }
            }
        });
    }

    return { execute };
};

module.exports = updateFuncIntoMsg;