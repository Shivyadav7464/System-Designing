const http = require("http");

// Hamare 2 backend servers
const servers = [
  { hostname: "127.0.0.1", port: 3001 },
  { hostname: "127.0.0.1", port: 3002 },
];

// Next request kis server se start karni hai
let currentServer = 0;
// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------
// Ye function check karega ki server alive hai ya nahi.
// Response 200 → Server healthy
// Error/timeout → Server unhealthy
function isServerHealthy(server) {
  return new Promise((resolve) => {

    const request = http.request(
      {
        hostname: server.hostname,
        port: server.port,

        // Server ko test karne ke liye request
        path: "/hello",
        method: "GET",

        // 1 second ke andar response nahi mila
        // to server ko unhealthy maan lenge
        timeout: 1000,
      },

      (response) => {

        // 200 response mila → Server healthy
        resolve(response.statusCode === 200);
      }
    );

    // Server se connection nahi hua
    request.on("error", () => {
      resolve(false);
    });


    // Server ne time par response nahi diya
    request.on("timeout", () => {
      request.destroy();
      resolve(false);
    });

    // Health check request send karo
    request.end();
  });
}
// --------------------------------------------------
// LOAD BALANCER
// --------------------------------------------------

const loadBalancer = http.createServer(async (req, res) => {

  let selectedServer = null;

  // Sabhi servers ko check karenge
  // ki kaunsa server healthy hai
  for (let i = 0; i < servers.length; i++) {

    // Round Robin order maintain karne ke liye
    const server =
      servers[(currentServer + i) % servers.length];

    // Server health check
    const healthy = await isServerHealthy(server);

    // Agar server healthy hai
    if (healthy) {

      // Isi server ko request bhejenge
      selectedServer = server;

      // Next request ke liye next server se start karenge
      currentServer =
        (servers.indexOf(server) + 1) % servers.length;
      break;
    }

    // Agar unhealthy hai to loop
    // automatically next server check karega
  }

  // --------------------------------------------------
  // AGAR KOI SERVER HEALTHY NAHI HAI
  // --------------------------------------------------

  if (!selectedServer) {

    // 503 = Service Unavailable
    res.writeHead(503);

    res.end("All servers are unavailable");

    return;
  }

  // Console me dikhao request kis server ko mili
  console.log(
    `Request ${req.url} -> Server ${selectedServer.port}`
  );

  // --------------------------------------------------
  // REQUEST KO BACKEND SERVER PAR FORWARD KARNA
  // --------------------------------------------------

  const proxyRequest = http.request(
    {
      hostname: selectedServer.hostname,
      port: selectedServer.port,

      // Same URL backend server ko bhejna
      path: req.url,

      // Same HTTP method use karna
      method: req.method,

      // Request headers bhi forward karna
      headers: req.headers,
    },

    (serverResponse) => {

      // Backend ka status aur headers
      // user ko wapas bhejo
      res.writeHead(
        serverResponse.statusCode,
        serverResponse.headers
      );

      // Backend ka response user ko forward karo
      serverResponse.pipe(res);
    }
  );

  // Backend server se connection fail hua
  proxyRequest.on("error", () => {

    res.writeHead(502);

    res.end("Server unavailable");
  });


  // User ki request backend server ko bhejo
  req.pipe(proxyRequest);
});

// --------------------------------------------------
// START LOAD BALANCER
// --------------------------------------------------

loadBalancer.listen(3000, "127.0.0.1", () => {

  console.log(
    "Load Balancer running on http://127.0.0.1:3000"
  );
});