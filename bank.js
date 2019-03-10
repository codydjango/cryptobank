const jsonStream = require('duplex-json-stream')
const net = require('net')
const Log = require('./Log')

class Bank {
    static calculateBalanceFromLog(log) {
        return log.toArray().map(entry => entry.value).reduce((acc, current) => {
                switch (current.cmd) {
                    case 'deposit':
                        acc += current.amount
                        break
                    case 'withdraw':
                        acc -= current.amount
                        break
                }

                return acc
            }, 0)
    }

    constructor({ log }) {
        this._log = log
        this._balance = Bank.calculateBalanceFromLog(this._log)
    }

    getBalance(recalculate=false) {
        if (recalculate) {
            this._balance = Bank.calculateBalanceFromLog(this._log)
        }

        return this._balance
    }

    logMsg(msg) {
        this._log.logMsg(msg)
    }

    deposit(msg) {
        this._balance += msg.amount
        this.logMsg(msg)
    }

    withdraw(msg) {
        this._balance -= msg.amount
        this.logMsg(msg)
    }

    canWithdraw(amount) {
        return (this.getBalance() >= amount)
    }

    canDeposit(amount) {
        return (amount >= 0)
    }
}


const server = net.createServer(socket => {
    const log = new Log({ reset: true })
    const bank = new Bank({ log })

    socket = jsonStream(socket)

    const reject = msg => { socket.write({ err: msg }) }

    socket.on('data', function (msg) {
        console.log('Bank received:', msg)

        switch (msg.cmd) {
            case 'deposit':
                (bank.canDeposit(msg.amount)) ? bank.deposit(msg) : reject("Deposit request is invalid.")
                break
            case 'withdraw':
                (bank.canWithdraw(msg.amount)) ? bank.withdraw(msg) : reject("Withdrawal request is invalid.")
                break
            case 'balance':
                break
            default:
                break
        }

        socket.write({
            cmd: 'balance',
            balance: bank.getBalance() })
    })
})

server.listen(3876)
