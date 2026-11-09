const http = require("http");
const { createClient } = require("redis");

// Redis client create kar rahe hain
const redisClient = createClient({
  url: "redis://172.26.206.16:6379",
});

// Redis connection me error aaye to console me dikhao
redisClient.on("error", (error) => {
  console.log("Redis Error:", error);
});

// Server start hone se pehle Redis se connect karo
async function startServer() {
  await redisClient.connect();

  console.log("Server 1 connected to Redis");

  const server = http.createServer(async (req, res) => {

    // User login karega
    if (req.url === "/login") {

      // Session ab Server 1 ki local memory me nahi,
      // Redis me store hoga
      await redisClient.set("user:session", "Shivkumar");

      res.end("Login successful on Server 1");
      return;
    }

    // User profile check karega
    if (req.url === "/profile") {

      // Redis se session read kar rahe hain
      const user = await redisClient.get("user:session");

      if (user) {
        res.end(`Welcome ${user}`);
      } else {
        res.end("No session found");
      }

      return;
    }

    res.end("Route not found");
  });

  server.listen(3001, () => {
    console.log("Redis Server 1 running on port 3001");
  });
}

startServer();