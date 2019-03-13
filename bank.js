// bank.js

const JsonSocket = require('json-socket')
const net = require('net')
const Log = require('./classes/Log')
const Bank = require('./classes/Bank')
const verify = require('./tools/verify')

// constants
const RESET = process.env.RESET || false
const SUPPORTED_COMMANDS = ['register', 'withdraw', 'balance', 'deposit']
const PORT = 3876

// instantiate classes
const log = new Log(RESET)
const bank = new Bank(determineBalancesFromLog(log))

// Register methods to record in log
log.logify(bank, ['register', 'withdraw', 'deposit'])

// Bootstrap server
net.createServer().on('connection', handleConnection).listen(PORT)

// Handle the connection and upgrade the socket to JsonSocket
function handleConnection(socket) {
    socket = new JsonSocket(socket)
    socket.on('message', msg => handleMessage(socket, msg))
}

// Handle the message coming through the JsonSocket
function handleMessage(socket, msg) {

    // Declare validations
    const hasCustomerId = ({ customerId }) => customerId !== undefined
    const hasValidSignature = ({ signature, ...msg }) => verify(signature, JSON.stringify(msg), msg.customerId)
    const hasValidCommand = ({ cmd }) => (SUPPORTED_COMMANDS.indexOf(cmd) !== -1)
    const hasValidBestHash = ({ hash }) => (hash === log.bestHash)

    // Default reject handler
    const reject = ({ customerId, cmd }, error) => {
        socket.sendMessage({
            customerId,
            cmd,
            error
        })
    }

    // Check validations
    if (!hasCustomerId(msg)) return reject(msg, 'No customerId')
    if (!hasValidSignature(msg)) return reject(msg, 'Signature is not valid')
    if (!hasValidCommand(msg)) return reject(msg, 'Command not supported')

    // Routing of valid command
    switch (msg.cmd) {
        case 'register':
            if (!bank.canRegister(msg)) return reject(msg, "Register request is invalid.")

            bank.register(msg)
            socket.sendMessage({
                customerId: msg.customerId,
                cmd: msg.cmd,
                balance: bank.getBalance(msg.customerId),
                hash: log.bestHash
            })
            break
        case 'deposit':
            if (!hasValidBestHash(msg)) return reject(msg, "Replay request")
            if (!bank.canDeposit(msg)) return reject(msg, "Deposit request is invalid.")

            bank.deposit(msg)
            socket.sendMessage({
                customerId: msg.customerId,
                cmd: msg.cmd,
                balance: bank.getBalance(msg.customerId),
                hash: log.bestHash
            })
            break
        case 'withdraw':
            if (!hasValidBestHash(msg)) return reject(msg, "Replay request")
            if (!bank.canWithdraw(msg)) return reject(msg, "Withdrawal request is invalid.")

            bank.withdraw(msg)
            socket.sendMessage({
                customerId: msg.customerId,
                cmd: msg.cmd,
                balance: bank.getBalance(msg.customerId),
                hash: log.bestHash
            })
            break
        case 'balance':
            socket.sendMessage({
                customerId: msg.customerId,
                cmd: msg.cmd,
                balance: bank.getBalance(msg.customerId),
                hash: log.bestHash
            })
            break
        default:
            break
    }
}

// Helper method to determine the bank balances from the log.
function determineBalancesFromLog(log) {
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
