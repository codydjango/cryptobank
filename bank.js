// bank.js
const jsonStream = require('duplex-json-stream')
const net = require('net')
const log = []
const fs = require('fs')

let balance = 200

function reduceLogs() {
    console.log('reduceLogs')
    return log.reduce((acc, current) => {
        if (Number.isInteger(acc)) {
            acc = acc.amount
        }

        switch (current.cmd) {
            case 'deposit':
                acc + current.amount
                break
            case 'withdraw':
                acc - current.amount
                break
        }

        return acc
    }, 0)
}

function getBalance(recalculate=false) {
    console.log('getBalance', balance)
    if (recalculate) {
        balance = reduceLogs()
    }

    return balance
}

function writeToLog(msg) {
    log.push(msg)
}

function handleDeposit(msg) {
    balance += msg.amount
    writeToLog(msg)
}

function handleWithdrawal(msg) {
    balance -= msg.amount
    writeToLog(msg)
}

function canWithdraw(amount) {
    return (getBalance() >= amount)
}

function canDeposit(amount) {
    return (amount >= 0)
}

const server = net.createServer(socket => {
    socket = jsonStream(socket)
    socket.on('data', function (msg) {
        console.log('Bank received:', msg)
        // socket.write can be used to send a reply

        const nope = () => {socket.write({ err: 'nope' })}

        switch (msg.cmd) {
            case 'deposit':
                (canDeposit(msg.amount)) ? handleDeposit(msg) : nope()
            case 'withdraw':
                (canWithdraw(msg.amount)) ? handleWithdrawal(msg) : nope()
            case 'balance':
            default:
                socket.write({
                    cmd: 'balance',
                    balance: getBalance() })
        }
    })
})


// const log = [
//     {cmd: 'deposit', amount: 130},
//     {cmd: 'deposit', amount: 0},
//     {cmd: 'deposit', amount: 120}
// ]

// const v = log.reduce((acc, current) => {
//     if (isNaN(acc)) {
//         acc = acc.amount
//     }
//     return acc + current.amount
// })

// You job now is to expand the teller.js and bank.js with the deposit command,
// that is stored in a transaction log and updates the bank state (ie. it's balance).
// When the bank gets a deposit command, it should reply with the current balance
// like this: {cmd: 'balance', balance: someNumber}. A good idea is to make teller.js a very simple CLI tool, reading commands and arguments from process.argv.

server.listen(3876)
