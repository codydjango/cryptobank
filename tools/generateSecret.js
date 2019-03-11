const sodium = require('sodium-native')
const runAsCli = (require.main.filename === module.filename)

// Generate a secret key for symetric encryption.
function generateSecret() {
    const secret = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES)

    sodium.randombytes_buf(secret)

    return secret.toString('hex')
}

(runAsCli && (() => {
    console.log(generateSecret())
})())

module.exports = generateSecret
