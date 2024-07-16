const net = require("net");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString();
    const reqLine = req.split("\n")[0];
    const reqPath = reqLine.split(" ")[1];

    if (reqPath === "/") {
      const okResponse = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n200 OK";
      socket.write(okResponse);
    } else if (reqPath.startsWith("/echo/")) {
      
      const string = reqPath.split("/")[2];
      
      const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${string.length}\r\n\r\n${string}`
      socket.write(response);
    } else {
      const notFoundResponse = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404 Not Found";
      socket.write(notFoundResponse);
    }
    socket.end();
  });

  socket.on("close", () => {
    console.log("Socket closed");
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server is listening on port 4221");
});
