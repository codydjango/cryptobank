const sodium = require('sodium-native')
const Cli = (require.main.filename === module.filename)

// Generate a secret key for symetric encryption.
function generateSecret() {
    const secret = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES)

    sodium.randombytes_buf(secret)

    return secret.toString('hex')
}

(Cli && (() => {
    console.log(generateSecret())
})())

module.exports = generateSecret
