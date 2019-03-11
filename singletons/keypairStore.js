const fs = require('fs')
const path = require('path')

const generateKeypair = require('../tools/generateKeypair')

class KeypairStore {
    static get path() {
        return path.join(path.dirname(require.main.filename), '/.keypair')
    }

    static isEmpty() {
        return !fs.existsSync(KeypairStore.path)
    }

    static generate() {
        const { 'public': publicKey, 'secret': secretKey } = generateKeypair()

        const keyPair = {
            private: secretKey,
            public: publicKey
        }

        fs.writeFileSync(KeypairStore.path, JSON.stringify(keyPair))

        return keyPair
    }

    static load() {
        return JSON.parse(fs.readFileSync(KeypairStore.path, 'utf8'))
    }

    constructor() {
        const { 'public': publicKey,
            'private': privateKey } = KeypairStore.isEmpty() ? KeypairStore.generate() : KeypairStore.load()

        if (publicKey && privateKey) {
            this._public = publicKey
            this._private = privateKey
        } else {
            throw new Error('no keys')
        }
    }

    get public() {
        return this._public
    }

    get secret() {
        return this._private
    }
}

module.exports = new KeypairStore()
