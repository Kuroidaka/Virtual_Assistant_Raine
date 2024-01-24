const { nanoid } = require("nanoid");

const createMessage = (dependencies) => {
    const { DB } = dependencies;

    if (!DB) {
        throw new Error("DB should be exist in dependencies");
    }

    const execute = async ({ conversationId, text, sender, senderID, imageList, functionList="" }) => {
        const data = {
            text: text,
            sender: sender,
            senderID: senderID,
            functionList: functionList,
            conversation: {
                connect: {
                    id: conversationId
                }
            }
        };

        if (Array.isArray(imageList) && imageList.length > 0) {
            data.imgList = {
                create: imageList.map((imageUrl) => ({ 
                    id: imageUrl.id || nanoid(),
                    url: imageUrl.url
                }))
            };
        }

        const message = await DB.message.create({
            data: data,
            include: {
                imgList: true
            }
        });

        return message;
    }


    return { execute };
};
module.exports = createMessage;