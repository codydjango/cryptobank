const sodium = require('sodium-native')
const runAsCli = (require.main.filename === module.filename)

// generate a secret key for symetric encryption
function randomSecret() {
    const secret = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES)

    sodium.randombytes_buf(secret)

    return secret.toString('hex')
}

if (runAsCli) {
    console.log(randomSecret())
}

module.exports = randomSecret
