// bank.js
const jsonStream = require('duplex-json-stream')
const net = require('net')
const fs = require('fs')
const path = require('path')
const sodium = require('sodium-native')

const RESET = true
const tamperErr = new Error('tampered')

class Log {
    static get logPath() {
        return path.join(path.dirname(__dirname), '/log.json')
    }

    static loadLog(reset=false) {
        if (reset) return []
        try {
            return JSON.parse(fs.readFileSync(Log.logPath))
        } catch (err) {
            return []
        }
    }

    static saveLog(data) {
        fs.writeFileSync(Log.logPath, JSON.stringify(data, null, 2))
    }

    static hashToHex(stringData) {
        const inputBuf = Buffer.from(stringData)
        const outputBuf = Buffer.alloc(sodium.crypto_generichash_BYTES)

        sodium.crypto_generichash(outputBuf, inputBuf)

        return outputBuf.toString('hex')
    }

    static get genesisHash() {
        return Buffer.alloc(32).toString('hex')
    }

    static getBestHash(log) {
        return log.length ? log[log.length - 1].hash : Log.genesisHash
    }

    static validateEntry(prevHash, entry) {
        if (Log.hashToHex(prevHash + JSON.stringify(entry.value)) === entry.hash) {
            return entry.hash
        } else {
            throw tamperErr
        }
    }

    static validateLog(log) {
        log.reduce(Log.validateEntry, Log.genesisHash)

        return log
    }

    constructor() {
        try {
            this._log = Log.validateLog(Log.loadLog(RESET))
        } catch (err) {
            if (err === tamperErr) {
                console.log('Tampered log, exiting.')
                process.exit()
            } else {
                throw err
            }
        }

    }

    logMsg(msg) {
        this.add(msg)
        this.save()
    }

    add(msg) {
        this._log.push({
            value: msg,
            hash: Log.hashToHex(Log.getBestHash(this._log) + JSON.stringify(msg))
        })
    }

    save() {
        Log.saveLog(this.dump())
    }

    dump() {
        return this._log
    }
}

class Secure {
    static get keypairPath() {
        return path.join(path.dirname(__dirname), '/keypair.json')
    }

    static hasKeys() {
        return fs.existsSync(Secure.keypairPath)
    }

    static generateKeys() {
        const publicKeyBuf = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
        const secretKeyBuf = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)

        sodium.crypto_sign_keypair(publicKeyBuf, secretKeyBuf)

        const keys = {
            private: secretKeyBuf.toString('hex'),
            public: publicKeyBuf.toString('hex')
        }

        fs.writeFileSync(Secure.keypairPath, JSON.stringify(keys))

        return keys
    }

    static loadKeys() {
        try {
            return JSON.parse(fs.readFileSync(Secure.keypairPath))
        } catch (err) {
            return []
        }
    }

    constructor() {
        const { publicKey, privateKey } = (Secure.hasKeys()) ? Secure.loadKeys() : Secure.generateKeys()

        this._public = publicKey
        this._private = privateKey
    }

    get public() {
        return Buffer.from(this._public, 'hex')
    }

    get private() {
        return Buffer.from(this._private, 'hex')
    }
}

class Bank {
    static calculateBalanceFromLog(log) {
        return log.map(entry => entry.value).reduce((acc, current) => {
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

    constructor(log) {
        this._log = log
        this._balance = this.recalculateBalance(this._log)
    }

    recalculateBalance(log) {
        return Bank.calculateBalanceFromLog(log.dump())
    }

    getBalance(recalculate=false) {
        if (recalculate) {
            this._balance = this.recalculateBalance(this._log)
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

const keys = new Secure()
const log = new Log()
const bank = new Bank(log)

const server = net.createServer(socket => {
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
