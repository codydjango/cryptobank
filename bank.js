// const jsonStream = require('duplex-json-stream')
const JsonSocket = require('json-socket')
const net = require('net')
const Log = require('./classes/Log')
const Bank = require('./classes/Bank')
const verify = require('./tools/verify')

const reset = true

const log = new Log(reset)
// const log = new SecureLog({ reset, keypairStore, secretStore })
const bank = new Bank(determineBalanceFromLog(log))

// Register methods to record
log.logify(bank, ['register', 'withdraw', 'deposit'])

// Bootstrap the server
net.createServer().on('connection', handleConnection).listen(3876)

// Handle the connection and upgrade the socket to JsonSocket
function handleConnection(socket) {
    socket = new JsonSocket(socket)
    socket.on('message', msg => handleMessage(socket, msg))
}

// Route the message passed through JsonSocket
function handleMessage(socket, msg) {
    // Validations
    const hasCustomerId = msg => msg.customerId !== undefined
    const hasValidSignature = ({ signature, ...msg }) => verify(signature, JSON.stringify(msg), msg.customerId)

    // Responses
    const pong = msg => socket.sendMessage({ msg: 'pong' })
    const reject = ({ customerId, cmd }, error) => socket.sendMessage({ customerId, cmd, error })
    const balance = ({ customerId, cmd }) => socket.sendMessage({ customerId, cmd, balance: bank.getBalance(customerId) })

    // Check validations
    if (!hasCustomerId(msg)) return reject('No customerId')
    if (!hasValidSignature(msg)) return reject('Signature is not valid')

    // Route message
    switch (msg.cmd) {
        case 'register':
            (bank.canRegister(msg)) ? bank.register(msg) : reject(msg, "Register request is invalid.")
            return balance(msg)
        case 'deposit':
            (bank.canDeposit(msg)) ? bank.deposit(msg) : reject(msg, "Deposit request is invalid.")
            return balance(msg)
        case 'withdraw':
            (bank.canWithdraw(msg)) ? bank.withdraw(msg) : reject(msg, "Withdrawal request is invalid.")
            return balance(msg)
        case 'balance':
            return balance(msg)
        case 'ping':
            return pong()
        default:
            return reject('not supported')
    }
}

// Helper method to determine the log from the previous balance
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
