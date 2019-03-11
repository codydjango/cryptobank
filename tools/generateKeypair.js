const sodium = require('sodium-native')
const Cli = (require.main.filename === module.filename)

// Generate a keypair for asymmetric encryption.
function generateKeypair() {
    const publicKeyBuf = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
    const secretKeyBuf = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)

    sodium.crypto_sign_keypair(publicKeyBuf, secretKeyBuf)

    return {
        secret: secretKeyBuf.toString('hex'),
        public: publicKeyBuf.toString('hex')
    }
}

(Cli && (() => {
    const { secret, public } = generateKeypair()

    console.log(`SecretKey: ${ secret }`)
    console.log(`PublicKey: ${ public }`)
})())

module.exports = generateKeypair
