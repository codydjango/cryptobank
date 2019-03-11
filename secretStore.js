const fs = require('fs')
const path = require('path')

const generateSecret = require('./tools/generateSecret')

class SecretStore {
    static get path() {
        return path.join(path.dirname(__dirname), '/.secret')
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
        this._secret = SecretStore.isEmpty() ? SecretStore.generate() : SecretStore.load()
    }

    get secret() {
        return this._secret
    }
}

module.exports = new SecretStore()
