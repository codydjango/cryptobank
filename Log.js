const fs = require('fs')
const path = require('path')
const keyStore = require('./keyStore')
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
        return keyStore.hash(stringData)
    }

    static get genesisHash() {
        return Buffer.alloc(32).toString('hex')
    }

    static getBestHash(log) {
        return log.length ? log[log.length - 1].hash : Log.genesisHash
    }

    static validateEntry(prevHash, entry) {
        const hasCorrectHash = (Log.hashToHex(prevHash + JSON.stringify(entry.value)) === entry.hash)
        const hasValidSignature = keyStore.verify(entry.hash, entry.signature)

        if (hasCorrectHash() && hasValidSignature()) {
            return entry.hash
        } else {
            throw tamperErr
        }
    }

    static validateLog(log) {
        log.reduce(Log.validateEntry, Log.genesisHash)

        return log
    }

    constructor({ reset }) {
        try {
            this._log = Log.validateLog(Log.loadLog(reset))
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
        const hash = Log.hashToHex(Log.getBestHash(this._log) + JSON.stringify(msg))
        const signature = keyStore.sign(hash)

        this._log.push({
            value: msg,
            hash,
            signature
        })
    }

    save() {
        Log.saveLog(this.toArray())
    }

    toArray() {
        return this._log
    }
}

module.exports = Log
