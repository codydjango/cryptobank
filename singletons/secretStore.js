const fs = require('fs')
const path = require('path')
const sodium = require('sodium-native')

const generateSecret = require('../tools/generateSecret')

class SecretStore {
    static get path() {
        return path.join(path.dirname(require.main.filename), '/.secret')
    }

    static isEmpty() {
        return !fs.existsSync(SecretStore.path)
    }

    static generate() {
        const secret = generateSecret()

        fs.writeFileSync(SecretStore.path, secret)

        return secret
    }

    static load() {
        return fs.readFileSync(SecretStore.path, 'utf8')
    }

    constructor() {
        const secretBuf = Buffer.from(SecretStore.isEmpty() ? SecretStore.generate() : SecretStore.load())

        this._secretBuf = sodium.sodium_malloc(secretBuf.length)
        this._secretBuf.fill(secretBuf)

        sodium.sodium_mprotect_noaccess(this._secretBuf)
    }

    get secret() {
        sodium.sodium_mprotect_readonly(this._secretBuf)
        const hex = this._secretBuf.toString('hex')
        sodium.sodium_mprotect_noaccess(this._secretBuf)

        return hex
    }
}

module.exports = new SecretStore()
