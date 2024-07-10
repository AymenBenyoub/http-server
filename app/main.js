const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.



const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });
});

server.listen(4221, "localhost");
