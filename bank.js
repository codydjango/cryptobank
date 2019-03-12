const jsonStream = require('duplex-json-stream')
const net = require('net')
const Log = require('./classes/Log')
const Bank = require('./classes/Bank')

const reset = true

const log = new Log(reset)
const bank = new Bank(determineBalanceFromLog(log))

log.logify(bank, ['register', 'withdraw', 'deposit'])

net.createServer(socket => {
    socket = jsonStream(socket)
    socket.on('data', msg => handleMessage(socket, msg))
}).listen(3876)

function determineBalanceFromLog(log) {
    return log.toArray().map(entry => entry.value).reduce((acc, current) => {
        switch (current.cmd) {
            case 'register':
                acc[current.customerId] = 0
                return acc
            case 'deposit':
                acc[current.customerId] += current.amount
                return acc
            case 'withdraw':
                acc[current.customerId] -= current.amount
                return acc
            default:
                return acc
        }
    }, {})
}

function handleMessage(socket, msg) {
    if (msg.customerId === undefined) return reject('No customerId')

    const reject = msg => { socket.write({ error: msg }) }
    const balance = customerId => { socket.write({ balance: bank.getBalance(customerId) })}

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
}
