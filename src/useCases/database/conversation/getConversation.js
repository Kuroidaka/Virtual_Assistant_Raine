const getConversations = (dependencies) => {
    const { DB } = dependencies;

    if (!DB) {
        throw new Error("DB should be exist in dependencies");
    }

    const execute = async ({ from, id }) => {
        const conversations = await DB.conversation.findMany({
            where: { from: from, id: id },
            orderBy: {
                lastMessageAt: 'desc',
            },
            include: { 
                messages: {
                    orderBy: {
                      createdAt: 'asc',
                    },
                    include: {
                        imgList: true
                    }
                } 
            }
        });
        
        return conversations;
    }

    return { execute };
};
module.exports = getConversations;