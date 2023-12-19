const redis = require('redis');
const chalk = require('chalk');

let redisConfig = {}

if(process.env.NODE_ENV === "production") {
    redisConfig.url = 'redis://redis:6379' //docker
} else {
    redisConfig.port = process.env.REDIS_PORT || 6379 //local
}

const redisClient = redis.createClient(redisConfig);

redisClient.connect().then(() => {
    console.log(chalk.red("Redis"),chalk.green("connected"));
})

redisClient.on("error", (error) => {
    console.error("Redis Error:", error);
});

module.exports = redisClient;
