// teller.js
const JsonSocket = require('json-socket')
const net = require('net')

const generateKeypair = require('./tools/generateKeypair')
const sign = require('./tools/sign')
const socket = new JsonSocket(new net.Socket())

socket
    .on('message', m => console.log('response', JSON.stringify(m, null, 2)))
    .connect(3876)

const customer1 = generateKeypair()
const customer2 = generateKeypair()

const requestQueue = [
    [customer1, { cmd: 'ping' }],
    [customer1, { cmd: 'register'}],
    [customer1, { cmd: 'deposit', amount: 200 }],
    [customer2, { cmd: 'register'}],
    [customer1, { cmd: 'deposit', amount: 123 }],
    [customer1, { cmd: 'withdraw', amount: 11 }],
    [customer1, { cmd: 'withdraw', amount: 23 }],
    [customer1, { cmd: 'withdraw', amount: 3000 }],
    [customer1, { cmd: 'withdraw', amount: 10 }],
    [customer1, { cmd: 'withdraw', amount: 1000 }],
    [customer1, { cmd: 'deposit', amount: 231 }],
    [customer1, { cmd: 'balance' }],
    [customer1, { cmd: 'balance' }]
]

function processRequest(customer, msg) {
    msg.customerId = customer.public
    msg.signature = sign(JSON.stringify(msg), customer.secret)
    socket.sendMessage(msg)
}

(function process(requestQueue) {
    processRequest(...requestQueue.shift())
    if (requestQueue.length > 0) process(requestQueue)
})(requestQueue)
