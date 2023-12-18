const redis = require('redis');
const chalk = require('chalk');

const redisConfig = {
    // port: process.env.REDIS_PORT || 6379,
    url: 'redis://redis:6379' ,
};

const redisClient = redis.createClient(redisConfig);

redisClient.connect().then(() => {
    console.log(chalk.red("Redis"),chalk.green("connected"));
})

redisClient.on("error", (error) => {
    console.error("Redis Error:", error);
});

module.exports = redisClient;
