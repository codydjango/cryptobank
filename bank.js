const jsonStream = require('duplex-json-stream')
const net = require('net')
const Log = require('./classes/Log')
const Bank = require('./classes/Bank')

const log = new Log({ reset: false })
const bank = new Bank({ log })

const server = net.createServer(socket => {
    socket = jsonStream(socket)

    const reject = msg => { socket.write({ error: msg }) }
    const balance = customerId => { socket.write({ balance: bank.getBalance(customerId) })}

    socket.on('data', function (msg) {
        if (msg.customerId === undefined) return reject('No customerId')

        switch (msg.cmd) {
            case 'register':
                (bank.canRegister(msg)) ? bank.register(msg) : reject("Register request is invalid.")
                return balance(msg.customerId)
            case 'deposit':
                (bank.canDeposit(msg)) ? bank.deposit(msg) : reject("Deposit request is invalid.")
                return balance(msg.customerId)
            case 'withdraw':
                (bank.canWithdraw(msg)) ? bank.withdraw(msg) : reject("Withdrawal request is invalid.")
                return balance(msg.customerId)
            case 'balance':
                return balance(msg.customerId)
            default:
                return reject('not supported')
        }
    })
})

server.listen(3876)
