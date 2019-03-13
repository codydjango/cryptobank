// teller.js
const JsonSocket = require('json-socket')
const net = require('net')

const output = require('./tools/output')
const generateKeypair = require('./tools/generateKeypair')
const sign = require('./tools/sign')
const socket = new JsonSocket(new net.Socket())

const DEMONSTRATE_REPLAY = false
const PORT = 3876

const customer1 = generateKeypair()
const customer2 = generateKeypair()

let bestHash = ''

socket
    .connect(PORT)
    .on('ready', processQueue)
    .on('message', outputMessage)

function processQueue(requestQueue = [
    [customer1, { cmd: 'register'}],
    [customer1, { cmd: 'deposit', amount: 200 }],
    [customer2, { cmd: 'register'}],
    [customer1, { cmd: 'deposit', amount: 500 }],
    [customer1, { cmd: 'withdraw', amount: 11 }],
    [customer1, { cmd: 'withdraw', amount: 23 }],
    [customer1, { cmd: 'withdraw', amount: 3000 }],
    [customer1, { cmd: 'withdraw', amount: 10 }],
    [customer1, { cmd: 'withdraw', amount: 1000 }],
    [customer1, { cmd: 'deposit', amount: 231 }],
    [customer1, { cmd: 'balance' }],
    [customer1, { cmd: 'balance' }]
]) {
    // End when nothing left to process.
    if (requestQueue.length === 0) return socket.end()

    // Pop the most recent request and handle it. Recursively process the stack.
    processRequest(...requestQueue.shift())

    // I'm using a 500ms timeout to give enough time for the server to
    // respond with an updated best hash. This is to avoid the replay threat.
    // Using a timeout is kinda silly.
    setTimeout(() => processQueue(requestQueue), 500)
}

// Process a request from the queue and send it off to the bank using the
// socket connection. We're signing the requests and adding the most recent
// bestHash received most recently from the bank to protect against replay attacks.
function processRequest(customer, request) {
    if (bestHash) request.hash = bestHash
    request.customerId = customer.public
    request.signature = sign(JSON.stringify(request), customer.secret)

    if (DEMONSTRATE_REPLAY && request.cmd === 'deposit') {
        setTimeout(()=> {
            output(JSON.stringify(request, null, 2), 'pink')
            socket.sendMessage(request)
        }, 10)
    }

    output(JSON.stringify(request, null, 2))
    socket.sendMessage(request)
}

// Output the messages from the server. Red if it contains an error,
// or was rejected, otherwise green. Also outputting the update of the best hash.
function outputMessage(message) {
    output(JSON.stringify(message, null, 2), (message.error) ? 'red' : 'green')

    if (message.hash && (bestHash !== message.hash)) {
        output(`updating best hash: ${ message.hash }`)
        bestHash = message.hash
    }
}
