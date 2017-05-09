const net = require('net')
const math = require('mathjs');
const http = require('http');
const fs = require('fs');


math.config({
    number: 'BigNumber',
    precision: 64
})

const server = net.createServer();

const sockets = [];

//*********** Private/Public Key Setup ****************//
const isPrime = (number) => {
    for ( var i = 2; i < number; i++ ) {
        if ( number % i === 0 ) {
            return false;
        }
    }
    return true;
}

const generateRelativePrime = (relator, max) => {
    let random = 1;
    while (relator % random === 0) {
        random = generateRandomPrime(max);
    }
    if (relator % random !== 0) {
        return random;
    }
}

const generateRandomPrime = (max) => {
    // Start w/ a non-prime
    let random = 4;
    while (!isPrime(random)) {
        random = Math.floor(Math.random() * max);
    }
    if (isPrime(random)) {
        return random;
    }
}

const checkZero = (a, b) => {
    const bMod = math.mod(a, b);
    const modulus = math.mod(b, bMod);
    return modulus.toString();
}

const inverseModulus = (a, b) => {
    const x = [];
    const y = [];
    let quotient = math.divide(a, b);
    let remainder = math.mod(a, b);


    x[0] = 0;
    y[0] = 1;
    x[1] = 1;
    y[1] = quotient * -1;
    let i = 2

    for (; checkZero(a, b) !== '0'; i++) {
        const checker = math.mod(b, math.mod(a, b));
        a = b;
        b = remainder;
        quotient = math.floor(math.divide(a, b));
        remainder = math.mod(a, b);
        x[math.mod(i, 3)] = (quotient * -1 * x[(i - 1) % 3]) + x[(i - 2) % 3];
        y[math.mod(i, 3)] = (quotient * -1 * y[(i - 1) % 3]) + y[(i - 2) % 3];
    }

    return x[(i - 1) % 3];
}




const getKeys = () => {
    // Create 2 Prime Numbers

    const p = generateRandomPrime(1000);
    const q = generateRandomPrime(1000);
    const isMore = Math.max(p, q);
    // Calculate n
    const n = p * q;

    // Calculate t
    const t = (p - 1) * (q - 1);

    // Choose Prime Number e
    const e = generateRelativePrime(t, isMore);

    console.log('P, Q, N, T, E:', p, q, n, t, e);

    const d = inverseModulus(e, t);

    return {
        'n': n,
        'e': e,
        'd': d
    }

}


getKeys();

const encrypt = (data) => {
    // C = Me mod n
}

const decrypt = (data) => {
    //  M = Cd mod n
}


//****************** Simple TCP **********************//

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

//****************** Simple HTTP **********************//

const handler = (req, res) => {
    fs.readFile(__dirname + '/chat_client.html',
        (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        }
    )
}

const httpd = http.createServer(handler);
httpd.listen(4000);
const io = require('socket.io').listen(httpd);

const loggedInUsers = {};


io.sockets.on('connection', (socket) => {
    let numOfUsers = 0;
    socket.on('login', (username) => {
        numOfUsers++;
        const keys = getKeys();
        loggedInUsers[username] = {
            keys: keys,
            username
        };
        console.log('heyoooo', loggedInUsers);
        socket.emit('serverMessage','New user logged in as: '+ username+ ' at Socket '+ socket.id)
        socket.broadcast.emit('serverMessage','You have logged in as: '+ username+ ' at Socket '+ socket.id)
    });
    socket.on('users', () => {
        socket.emit('serverMessage', 'Logged in users: ' + loggedInUsers);
        socket.broadcast.emit('serverMessage', 'Logged in users: ' + JSON.stringify(loggedInUsers));
    });
    socket.on('create keys', () => {
        const keys = getKeys();
        socket.emit('serverMessage', 'Your Public Key: ' + keys.d + ' and your Private Key (keep secret): ' + keys.n );
    });
    socket.on('private', (username) => {
        console.log('Private message', loggedInUsers[username].keys.n);
    });
    socket.on('clientMessage', (content) => {
        console.log('Incoming message', content);
        const userName = loggedInUsers[username || socket.id];
        socket.emit('serverMessage', userName + ' said: ' + content);
        socket.broadcast.emit('serverMessage', userName + ' said: ' + content);

    })


})



//*****************************************************//

server.listen(4001);