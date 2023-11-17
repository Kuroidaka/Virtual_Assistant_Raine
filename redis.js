const redisClient = require('./config/redis/redis.config');
const { numTokensFromString } = require ("./utils/index");



const myArray = [
    { "role": "system", "content": "As Raine, a personal virtual assistant..." },
    { "role": "system", "content": "suppose you aredaw a er" }
];
const myArray2 = [
    { "role": "user", "content": "As Raine, a personal virtual assistantdawdaw..." },
    { "role": "assistant", "content": "suppose you are a edaw daw rdawdaw" }
];

// Using async/await with a for loop to ensure all items are added before reading
const addItems = async (item, key) => {
    try {
        let initIndex = 0
        const count = await countItems(key)
        console.log("count", count)
        if(count) initIndex = count - 1

        let index = 0
        console.log(index, index + initIndex, item)
        await redisClient.zAdd(key, { score: index + initIndex , value: `${Date.now()}|${JSON.stringify(item)}` });
        
    } catch (error) {
        console.error('Error adding items to Redis:', error);
    }
};

const getItems = async (key) => {
    try {
        const results = await redisClient.zRange(key, 0, -1);
        results.forEach(result => {
            console.log( JSON.parse(result.substring(14,result.length)));
        });
    } catch (error) {
        console.error('Error retrieving items from Redis:', error);
    }
};

const countItems = async (key) => {
    try {
        const minScore = '-inf';
        const maxScore = '+inf';

        const data = await redisClient.zCount(key, minScore, maxScore);
        return data
    } catch (err) {
        console.log(err)
    }
}

// Execute the functions
addItems(myArray2[0], "mySortedSet").then(() => getItems("mySortedSet"))

// console.log(numTokensFromString("hello world I'm Cảnh"))
