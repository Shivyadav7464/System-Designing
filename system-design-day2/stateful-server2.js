const http = require("http");
const { createClient } = require("redis");

// Redis client create kar rahe hain
const redisClient = createClient({
  url: "redis://172.26.206.16:6379",
});

// Redis connection error
redisClient.on("error", (error) => {
  console.log("Redis Error:", error);
});

// Server start hone se pehle Redis se connect karo
async function startServer() {
  await redisClient.connect();

  console.log("Server 2 connected to Redis");

  const server = http.createServer(async (req, res) => {

    // Profile request
    if (req.url === "/profile") {

      // Server 2 bhi same Redis se session read karega
      const user = await redisClient.get("user:session");

      if (user) {
        res.end(`Welcome ${user} from Server 2`);
      } else {
        res.end("No session found");
      }

      return;
    }

    res.end("Route not found");
  });

  server.listen(3002, () => {
    console.log("Redis Server 2 running on port 3002");
  });
}

startServer();