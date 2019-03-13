const fs = require('fs')
const path = require('path')

const keypairStore = require('../singletons/keypairStore')
const secretStore = require('../singletons/secretStore')
const generateHash = require('../tools/generateHash')
const sign = require('../tools/sign')
const verify = require('../tools/verify')
const decrypt = require('../tools/decrypt')
const encrypt = require('../tools/encrypt')

const noLogErr = new Error('no log')
const tamperedErr = new Error('tampered')

class Log {
    static get path() {
        return path.join(path.dirname(require.main.filename), '/.data')
    }

    static load(reset=false) {
        if (reset) return []

        if (!fs.existsSync(Log.path)) throw noLogErr

        const [cipher, nonce] = fs.readFileSync(Log.path, 'utf8').split(':')
        return JSON.parse(decrypt(secretStore.secret, cipher, nonce))
    }

    static save(data) {
        const { cipher, nonce } = encrypt(secretStore.secret, JSON.stringify(data))

        fs.writeFileSync(Log.path, `${ cipher }:${ nonce }`)
    }

    static get genesisHash() {
        return Buffer.alloc(32).toString('hex')
    }

    static getBestHash(log) {
        return log.length ? log[log.length - 1].hash : Log.genesisHash
    }

    static validate(log) {
        log.reduce((prevHash, entry) => {
            const hasCorrectHash = (generateHash(prevHash + JSON.stringify(entry.value)) === entry.hash)
            const hasValidSignature = verify(entry.signature, entry.hash, keypairStore.public)

            if (!(hasCorrectHash && hasValidSignature)) throw tamperedErr

            return entry.hash
        }, Log.genesisHash)

        return log
    }

    static logify(fn, log) {
        return function(...args) {
            log.record(...args)
            return fn(...args)
        }
    }

    // Look for a log on file, attempt to read it, attempt to decrypt it,
    // attempt to validate the transactions, and finally, return the parsed array.
    // If the log is not found, return an empty array. If the log fails decryption or
    // verification, catch the "tamperedErr" and stop the process.
    constructor(reset=false) {
        try {
            this._log = Log.validate(Log.load(reset))
        } catch (err) {
            if (err === tamperedErr) {
                console.log('Tampered log, exiting.')
                process.exit()
            } else if (err === noLogErr) {
                // there is no log file, it will be created on the first save.
                this._log = []
            } else {
                throw err
            }
        }
    }

    get bestHash() {
        return Log.getBestHash(this._log)
    }

    logify(obj, methods) {
        methods.forEach(method => {
            obj[method] = Log.logify(obj[method], this)
        })
    }

    record(msg) {
        this.add(msg)
        Log.save(this.toArray())
    }

    add(msg) {
        const hash = generateHash(this.bestHash + JSON.stringify(msg))
        const signature = sign(hash, keypairStore.private)

        this._log.push({
            value: msg,
            hash,
            signature
        })
    }

    isValid() {
        let valid

        try {
            Log.validate(this.toArray())
            valid = true
        } catch (err) {
            valid = false
        }

        return valid
    }

    toArray() {
        return this._log
    }
}

module.exports = Log
