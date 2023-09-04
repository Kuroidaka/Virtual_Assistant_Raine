const redis = require('redis');
const { log } = require('../log/log.config');
const chalk = require('chalk');

const redisConfig = {
    // host: process.env.REDIS_HOST || "127.0.0.1", // Redis server host
    // host: "red-cjqvtmgjbais73f2lsjg", // Redis server host
    url: "rediss://red-cjqvtmgjbais73f2lsjg:3zzz1naiJi5b93s6mEnWgsED9d9QZo9a@singapore-redis.render.com:6379",
    // url: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,       // Redis server port
  };

const redisClient = redis.createClient(redisConfig);

redisClient.connect().then(() => {
    log(chalk.red("Redis"),chalk.green("connected"));
})

redisClient.on("error", (error) => {
    console.error("Redis Error:", error);
});

module.exports = redisClient;
