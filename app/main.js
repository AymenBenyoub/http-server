const net = require("net");
const fs = require("fs");
const path = require("path");

const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const reqLine = data.toString().split("\n")[0];
    
    const reqPath = reqLine.split(" ")[1];

    const filePath = path.join(__dirname, reqPath);
    console.log(reqLine+"\n"+reqPath+"\n"+filePath);
    fs.stat(filePath, (err, stat) => {
      if (err) {
        const response = "HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n";
        socket.write(response);
        socket.end();
      } else {
        const response = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n";
        socket.write(response);
        socket.end();
      }
    });
  });

  socket.on("close", () => {
    socket.end();
    console.log("Socket closed");
  });
});

server.listen(4221, "localhost", () => {
  console.log("Server is listening on port 4221");
});
