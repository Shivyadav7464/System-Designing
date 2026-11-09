
const http = require("http");

const servers = [
    { host: "localhost", port: 3001 },
    { host: "localhost", port: 3002 }
];

let currentServer = 0;

const balancer = http.createServer((req, res) => {
    const target = servers[currentServer];

    // Round Robin: agali request doosre server ko milegi.
    currentServer = (currentServer + 1) % servers.length;

    const options = {
        hostname: target.host,
        port: target.port,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            host: `${target.host}:${target.port}`
        }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on("error", (error) => {
        console.error(`Backend ${target.port} error:`, error.message);

        if (!res.headersSent) {
            res.writeHead(502, { "Content-Type": "application/json" });
        }

        res.end(JSON.stringify({
            success: false,
            message: "Backend server unavailable"
        }));
    });

    req.pipe(proxyReq);
});

balancer.listen(3000, () => {
    console.log("Load balancer running at http://localhost:3000");
});



// Code ka important concept:
// - http.createServer() — incoming HTTP requests receive karta hai.
// - currentServer — decide karta hai ki request kis backend ko bhejni hai.
// - % servers.length — index ko 0 aur 1 ke beech rotate karta hai.
// - http.request() — selected backend ko request forward karta hai.
// - proxyRes.pipe(res) — backend ka response client ko bhejta hai.