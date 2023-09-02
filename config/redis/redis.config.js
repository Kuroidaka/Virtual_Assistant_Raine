const redis = require('redis');

const redisConfig = {
    host: "127.0.0.1", // Redis server host
    port: process.env.REDIS_PORT,       // Redis server port
  };

const redisClient = redis.createClient(redisConfig);

redisClient.connect().then(() => {
    console.log("Redis connected");
})

redisClient.on("error", (error) => {
    console.error("Redis Error:", error);
});

module.exports = redisClient;