const fs = require('fs')
const path = require('path')

const keypairStore = require('./keypairStore')
const secretStore = require('./secretStore')
const generateHash = require('./tools/generateHash')
const sign = require('./tools/sign')
const verify = require('./tools/verify')
const decrypt = require('./tools/decrypt')
const encrypt = require('./tools/encrypt')

const noLogErr = new Error('no log')
const tamperErr = new Error('tampered')

class Log {
    static get path() {
        return path.join(path.dirname(__dirname), '/.data')
    }

    static load(reset=false) {
        if (reset) return []

        if (!fs.existsSync(Log.path)) throw noLogErr

        const [cipher, nonce] = fs.readFileSync(Log.path, 'utf8').split(':')
        return JSON.parse(decrypt(secretStore.secret, cipher, nonce))
    }

    static save(data) {
        const json = JSON.stringify(data)
        const { cipher, nonce } = encrypt(secretStore.secret, json)

        fs.writeFileSync(Log.path, `${ cipher }:${ nonce }`)
    }

    static get genesisHash() {
        return Buffer.alloc(32).toString('hex')
    }

    static getBestHash(log) {
        return log.length ? log[log.length - 1].hash : Log.genesisHash
    }

    static validate(log) {
        const validateEntry = (prevHash, entry) => {
            const hasCorrectHash = (generateHash(prevHash + JSON.stringify(entry.value)) === entry.hash)
            const hasValidSignature = verify(entry.signature, entry.hash, keypairStore.public)

            if (hasCorrectHash && hasValidSignature) {
                return entry.hash
            } else {
                throw tamperErr
            }
        }

        log.reduce(validateEntry, Log.genesisHash)

        return log
    }

    constructor({ reset }) {
        try {
            this._log = Log.validate(Log.load(reset))
        } catch (err) {
            if (err === tamperErr) {
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

    logMsg(msg) {
        this.add(msg)
        Log.save(this.toArray())
    }

    add(msg) {
        const hash = generateHash(Log.getBestHash(this._log) + JSON.stringify(msg))
        const signature = sign(hash, keypairStore.secret)

        this._log.push({
            value: msg,
            hash,
            signature
        })
    }

    toArray() {
        return this._log
    }
}

module.exports = Log
