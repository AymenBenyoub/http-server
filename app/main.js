const net = require("net");
const fs = require("fs");
const path = require("path");

function getOption(optionName) {
  const index = process.argv.indexOf(optionName);
  if (index === -1 || index === process.argv.length - 1) {
    return null;
  }
  return process.argv[index + 1];
}

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString();

    const reqLine = req.split("\n")[0];
    const httpMethod = reqLine.split(" ")[0];
    const reqPath = reqLine.split(" ")[1];

    const route = `/${reqPath.split("/")[1]}`;

    const okResponse =
      "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n200 OK";
    const notFoundResponse =
      "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404 Not Found";

    switch (route) {
      case "/": {
        socket.write(okResponse);

        socket.end();
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
      case "/files": {
        if (httpMethod === "GET") {
          const fileName = reqPath.split("/")[2];

          const directory = getOption("--directory");
          const filePath = path.join(directory, fileName);
          console.log(filePath);
          fs.stat(filePath, (err, stats) => {
            if (err || stats.isDirectory()) {
              console.error("File not found");
              socket.write(notFoundResponse);
              socket.end();
              return;
            }

            // const data = fs.readFileSync(filePath);
            fs.readFile(filePath, (err, data) => {
              if (err) {
                console.error("Error reading file");
                socket.write(notFoundResponse);
              } else {
                const contentType = "application/octet-stream";
                const responseHeader = `HTTP/1.1 200 OK\r\nContent-Type: ${contentType}\r\nContent-Length: ${stats.size}\r\n\r\n`;

                socket.write(responseHeader);
                socket.write(data);
              }
              socket.end();
            });
          });
        } else if (httpMethod === "POST") {
          const fileName = reqPath.split("/")[2];
          const data = req.split("\r\n\r\n")[1];
          const directory = getOption("--directory");
          const filePath = path.join(directory, fileName);

          fs.writeFile(filePath, data, (err) => {
            if (err) throw err;
            console.log("File has been created and saved!");
            socket.write("HTTP/1.1 201 Created\r\n\r\n");
            socket.end();
          });
          break;
        }
      }
      default: {
        socket.write(notFoundResponse);
        socket.end();
        break;
      }
    }
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
    socket.destroy();
  });

  socket.on("close", () => {
    console.log("Socket closed");
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server is listening on port 4221");
});
