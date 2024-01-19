const { nanoid } = require("nanoid");

const createMessage = (dependencies) => {
    const { DB } = dependencies;

    if (!DB) {
        throw new Error("DB should be exist in dependencies");
    }

    const execute = async ({ conversationId, text, sender, senderID, imageList }) => {
        const data = {
            text: text,
            sender: sender,
            senderID: senderID,
            conversation: {
                connect: {
                    id: conversationId
                }
            }
        };

        if (Array.isArray(imageList) && imageList.length > 0) {
            data.imgList = {
                create: imageList.map((imageUrl) => ({ 
                    id: nanoid(),
                    url: imageUrl 
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