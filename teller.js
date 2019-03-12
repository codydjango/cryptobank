// teller.js
const JsonSocket = require('json-socket')
const net = require('net')

const output = require('./tools/output')
const generateKeypair = require('./tools/generateKeypair')
const sign = require('./tools/sign')
const socket = new JsonSocket(new net.Socket())

const DEMONSTRATE_REPLAY = false

let bestHash = ''

socket
    .on('message', message => {
        output(JSON.stringify(message, null, 2), (message.error) ? 'red' : 'green')

        if (message.hash && (bestHash !== message.hash)) {
            output(`updating hash: ${ message.hash }`)
            bestHash = message.hash
        }
    })
    .connect(3876)


const customer1 = generateKeypair()
const customer2 = generateKeypair()

const requestQueue = [
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
]

function processRequest(customer, request) {
    if (bestHash) request.hash = bestHash
    request.customerId = customer.public
    request.signature = sign(JSON.stringify(request), customer.secret)

    if (DEMONSTRATE_REPLAY && request.cmd === 'deposit') {
        setTimeout(()=> {
            output(JSON.stringify(request, null, 2), 'pink')
            socket.sendMessage(request)
        }, 10)

        setTimeout(()=> {
            output(JSON.stringify(request, null, 2), 'pink')
            socket.sendMessage(request)
        }, 20)

        setTimeout(()=> {
            output(JSON.stringify(request, null, 2), 'pink')
            socket.sendMessage(request)
        }, 30)
    }

    output(JSON.stringify(request, null, 2))
    socket.sendMessage(request)
}

// I'm just using a 500ms timeout to give enough time for the server to respond with
// an updated best hash. This is to avoid the replay threat. Using a timeout if kinda silly
// but if we really wanted to take the trasactional nature seriously we
// probably wouldn't be using sockets, either... I mean unless we were really looking
// to blow this out...
(function process(requestQueue) {
    processRequest(...requestQueue.shift())
    if (requestQueue.length > 0) {
        setTimeout(() => process(requestQueue), 500)
    } else {
        socket.end()
    }
})(requestQueue)
