const fs = require("fs");
const url = require("url");
const path = require("path");
const http = require("http");
const typesJson = require("servor/types.json");

// Modified version of servor

const isLite = !!process.argv[2];

const mime = Object.entries(typesJson).reduce(
  (all, [type, exts]) =>
    Object.assign(all, ...exts.map(ext => ({ [ext]: type }))),
  {}
);

const PORTS = require("../ports.json");

const root = isLite ? "distlite" : "dist";
const fallback = process.argv[3] || "index.html";
const port = process.argv[4] || (isLite ? PORTS.uilite : PORTS.client);
const cwd = process.cwd();

const sendError = (res, resource, status) => {
  res.writeHead(status);
  res.end();
  console.log(" \x1b[41m", status, "\x1b[0m", `${resource}`);
};

const sendFile = (res, resource, status, file, ext) => {
  res.writeHead(status, {
    "Content-Type": mime[ext] || "application/octet-stream",
    "Access-Control-Allow-Origin": "*"
  });
  res.write(file, "binary");
  res.end();
  console.log(" \x1b[42m", status, "\x1b[0m", `${resource}`);
};

const sendMessage = (res, channel, data) => {
  res.write(`event: ${channel}\nid: 0\ndata: ${data}\n`);
  res.write("\n\n");
};

const isRouteRequest = uri =>
  uri
    .split("/")
    .pop()
    .indexOf(".") === -1
    ? true
    : false;

http
  .createServer((request, res) => {
    // Open the event stream for live reload
    res.writeHead(200, {
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*"
    });
    // Send an initial ack event to stop request pending
    sendMessage(res, "connected", "awaiting change");
    // Send a ping event every minute to prevent console errors
    setInterval(sendMessage, 60000, res, "ping", "still waiting");
    // Watch the target directory for changes and trigger reload
    fs.watch(path.join(cwd, root), { recursive: true }, () =>
      sendMessage(res, "message", "reloading page")
    );
  })
  .listen(5000);

http
  .createServer((req, res) => {
    const pathname = url.parse(req.url).pathname;
    const isRoute = isRouteRequest(pathname);
    //const status = isRoute && pathname !== "/" ? 301 : 200;
    const status = isRoute && pathname !== "/" ? 200 : 200;
    const resource = isRoute ? `/${fallback}` : decodeURI(pathname);
    const uri = path.join(cwd, root, resource);
    const ext = uri.replace(/^.*[\.\/\\]/, "").toLowerCase();
    // Check if files exists at the location
    fs.stat(uri, (err, stat) => {
      if (err) return sendError(res, resource, 404);
      // Respond with the contents of the file
      fs.readFile(uri, "binary", (err, file) => {
        if (err) return sendError(res, resource, 500);
        sendFile(res, resource, status, file, ext);
      });
    });
  })
  .listen(parseInt(port, 10));

console.log(`\n 🗂  Serving files from ./${root} on http://localhost:${port}`);
console.log(` 🖥  Using ${fallback} as the fallback for route requests`);

/* const page = `http://localhost:${require("../ports.json").bus}`;
require("child_process").exec(`chromium-browser --start-fullscreen ${page}`); */
