const net = require("net");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString();

    const reqLine = req.split("\n")[0];
    const reqPath = reqLine.split(" ")[1];

    const route = `/${reqPath.split("/")[1]}`;

    switch (route) {
      case "/": {
        const okResponse =
          "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n200 OK";
        socket.write(okResponse);
        break;
      }
      case "/echo": {
        const string = reqPath.split("/")[2];
        const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${string.length}\r\n\r\n${string}`;
        socket.write(response);
        break;
      }
      case "/user-agent": {
        const userAgentHeader = req
          .split("\n")
          .find((line) => line.toLowerCase().startsWith("user-agent:"));
        const userAgent = userAgentHeader
          ? userAgentHeader.split(":")[1].trim()
          : "User-Agent header not found";

        const response = `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        socket.write(response);
        break;
      }
      default: {
        const notFoundResponse =
          "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404 Not Found";
        socket.write(notFoundResponse);
        break;
      }
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
