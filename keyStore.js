const fs = require('fs')
const path = require('path')
const sodium = require('sodium-native')

class KeyStore {
    static get keypairPath() {
        return path.join(path.dirname(__dirname), '/keypair.json')
    }

    static hasKeys() {
        return fs.existsSync(KeyStore.keypairPath)
    }

    static generateKeys() {
        console.log('generateKeys')
        const publicKeyBuf = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
        const secretKeyBuf = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)

        sodium.crypto_sign_keypair(publicKeyBuf, secretKeyBuf)

        const keys = {
            private: secretKeyBuf.toString('hex'),
            public: publicKeyBuf.toString('hex')
        }

        fs.writeFileSync(KeyStore.keypairPath, JSON.stringify(keys))

        return keys
    }

    static loadKeys() {
        return JSON.parse(fs.readFileSync(KeyStore.keypairPath))
    }

    constructor() {
        const { 'public': publicKey,
            'private': privateKey } = KeyStore.hasKeys() ? KeyStore.loadKeys() : KeyStore.generateKeys()

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

    get publicBuf() {
        return Buffer.from(this._public, 'hex')
    }

    get secretBuf() {
        console.log(this._private)
        return Buffer.from(this._private, 'hex')
    }

    sign(message) {
        const signatureBuf = Buffer.alloc(sodium.crypto_sign_BYTES)
        const messageBuf = Buffer.from(message)

        sodium.crypto_sign_detached(signatureBuf, messageBuf, this.secretBuf)

        return signatureBuf.toString('hex')
    }

    verify(message, signature) {
        const messageBuf = Buffer.from(message)
        const signatureBuf = Buffer.from(signature, 'hex')
        const verified = sodium.crypto_sign_verify_detached(signatureBuf, messageBuf, this.publicBuf)

        return verified
    }

    hash(stringData) {
        const inputBuf = Buffer.from(stringData)
        const outputBuf = Buffer.alloc(sodium.crypto_generichash_BYTES)

        sodium.crypto_generichash(outputBuf, inputBuf)

        return outputBuf.toString('hex')
    }
}

module.exports = new KeyStore()
