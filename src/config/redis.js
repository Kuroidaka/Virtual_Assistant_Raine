const redis = require('redis');
const chalk = require('chalk');

const redisConfig = {
    host: process.env.REDIS_HOST || "127.0.0.1", // Redis server host
    // url: process.env.REDIS_URL,
    // url: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,       // Redis server port
  };

const redisClient = redis.createClient(redisConfig);

redisClient.connect().then(() => {
    console.log(chalk.red("Redis"),chalk.green("connected"));
})

redisClient.on("error", (error) => {
    console.error("Redis Error:", error);
});

module.exports = redisClient;