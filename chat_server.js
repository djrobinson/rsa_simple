const net = require('net')

const server = net.createServer();

const sockets = [];
//Test//
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
        console.log('Random Relative Test', random);
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
        console.log('Random', random);
    }
    if (isPrime(random)) {
        return random;
    }
}

const inverseModulus = (a, b) => {
    const x = [];
    const y = [];
    console.log('X & Y', x, y);
    const quotient = a / b;
    const remainder = a % b;
    let reassignA = a;
    let reassignB = b;

    x[0] = 0;
    y[0] = 1;
    x[1] = 1;
    y[1] = quotient * -1;

    for (let i = 2; (b % (a%b)) !== 0; i++) {
        reassignA = reassignB;
        reassignB = remainder;
        console.log('X & Y', x, y);
        x[i % 3] = (quotient * -1 * x[(i - 1) % 3]) + x[(i - 2) % 3];
        y[i % 3] = (quotient * -1 * y[(i - 1) % 3]) + y[(i - 2) % 3];
    }
    console.log('X & Y', x, y);

    return x[(i - 1) % 3];
}


const scrambler = (plainText) => {
    console.log(plainText.toUpperCase());
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

    const inverseMod = inverseModulus(11, 840);

    console.log('Inverse Mod Test:', inverseMod);


    // Find a d (Will require extra calc: http://www.pagedon.com/extended-euclidean-algorithm-in-c/my_programming/

}

scrambler('Howdy!');

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