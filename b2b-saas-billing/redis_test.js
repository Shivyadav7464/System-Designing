
const { redisClient, connectRedis } = require("./src/config/redis");

async function testRedis() {
  try {
    await connectRedis();

    await redisClient.set("billflow:test", "Redis is working");

    const result = await redisClient.get("billflow:test");

    console.log("Redis test result:", result);
  } catch (error) {
    console.error("Redis test failed:", error.message);
  } finally {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
  }
}

testRedis();
