const redis = require('redis');

const client = redis.createClient(process.env.REDIS_PORT);

module.exports = client;