const fs = require('fs')
const path = require('path')
const sodium = require('sodium-native')

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
            const publicBuf = Buffer.from(publicKey, 'hex')
            const privateBuf = Buffer.from(privateKey, 'hex')

            this._publicBuf = sodium.sodium_malloc(publicBuf.length)
            this._publicBuf.fill(publicBuf)

            this._privateBuf = sodium.sodium_malloc(privateBuf.length)
            this._privateBuf.fill(privateBuf)

            sodium.sodium_mprotect_noaccess(this._publicBuf)
            sodium.sodium_mprotect_noaccess(this._privateBuf)
        } else {
            throw new Error('no keys')
        }
    }

    get public() {
        sodium.sodium_mprotect_readonly(this._publicBuf)
        const hex = this._publicBuf.toString('hex')
        sodium.sodium_mprotect_noaccess(this._publicBuf)

        return hex
    }

    get private() {
        sodium.sodium_mprotect_readonly(this._privateBuf)
        const hex = this._privateBuf.toString('hex')
        sodium.sodium_mprotect_noaccess(this._privateBuf)

        return hex
    }
}

module.exports = new KeypairStore()
