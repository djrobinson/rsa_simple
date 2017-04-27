const net = require('net')

const server = net.createServer();

const sockets = [];

//*********** Private/Public Key Setup ****************//

const scrambler = (plainText) => {
    console.log(plainText.toUpperCase());
    // Create 2 Prime Numbers


    // Calculate n

    // Calculate t


    // Choose Prime Number e


    // Find a d (Will require extra calc: http://www.pagedon.com/extended-euclidean-algorithm-in-c/my_programming/

    )
}

const encrypt = (data) => {
    // C = Me mod n
}

const decrypt = (data) => {
    //  M = Cd mod n
}

//*****************************************************//

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