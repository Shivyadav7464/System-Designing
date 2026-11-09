
const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://172.26.206.16:6379",
});

redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error.message);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  console.log("Redis connected successfully");
}

module.exports = { redisClient, connectRedis };
