const net = require('net')

const server = net.createServer();

const sockets = [];

const scrambler = (plainText) => {
    console.log(plainText.toUpperCase());
}

server.on('connection', (socket) => {
    console.log('new connection');

    sockets.push(socket);

    socket.on('data', (data) => {
        console.log('Received message: ', data.toString());
        sockets.forEach((otherSocket) => {
            const stringData = data.toString();
            scrambler(stringData);
            if (otherSocket !== socket) {
                otherSocket.write(data);
            }
        });
    });

    socket.on('close', () => {
        console.log('connection closed');
        const index = sockets.indexOf(socket);
        sockets.splice(index, 1);
    });
});

server.on('error', (err) => {
    console.log('Server error', err.message);
});

server.on('close', () => {
    console.log('Server closed');
});

server.listen(4001);