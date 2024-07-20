const net = require("net");
const fs = require("fs");
const path = require("path");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const req = data.toString();
    const reqLine = req.split("\n")[0];
    const reqPath = reqLine.split(" ")[1];

    // Extract route
    const route = `/${reqPath.split("/")[1]}`;

    // Define responses
    const okResponse =
      "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n200 OK";
    const notFoundResponse =
      "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n404 Not Found";

    switch (route) {
      case "/files": {
        const fileName = reqPath.split("/")[2];
        const directory = "C:/tmp";

        fs.readdir(directory, (err, files) => {
          if (err) {
            console.error("Error reading directory:", err);
            socket.write(notFoundResponse);
            socket.end();
            return;
          }

          const matchedFile = files.find((file) => file.startsWith(fileName));

          if (!matchedFile) {
            console.error("File not found");
            socket.write(notFoundResponse);
            socket.end();
            return;
          }

          const filePath = path.join(directory, matchedFile);

          fs.stat(filePath, (err, stats) => {
            if (err || stats.isDirectory()) {
              console.error("Error getting file stats:", err);
              socket.write(notFoundResponse);
              socket.end();
              return;
            }

            fs.readFile(filePath, (err, data) => {
              if (err) {
                console.error("Error reading file:", err);
                socket.write(notFoundResponse);
                socket.end();
                return;
              }

              const contentType = getMimeType(filePath);
              const responseHeader = `HTTP/1.1 200 OK\r\nContent-Type: ${contentType}\r\nContent-Length: ${stats.size}\r\n\r\n`;

              socket.write(responseHeader);
              socket.write(data);
              socket.end();
            });
          });
        });
        break;
      }
      case "/files": {
        const fileName = reqPath.split("/")[2];
        const filePath = path.join("tmp", fileName);

        fs.stat(filePath, (err, stats) => {
          if (err || stats.isDirectory()) {
            console.error("File not found");
            socket.write(notFoundResponse);
            socket.end();
            return;
          }

          // Read the file
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
        break;
      }
      default: {
        socket.write(notFoundResponse);
        socket.end(); // Ensure socket is closed for unmatched routes
        break;
      }
    }
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
    socket.destroy(); // Immediately close socket on error
  });

  socket.on("close", () => {
    console.log("Socket closed");
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server is listening on port 4221");
});
