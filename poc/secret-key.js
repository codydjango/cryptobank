// generate a secret key for symetric encryption
const sodium = require('sodium-native')
const runAsCli = (require.main.filename === module.filename)

function generate() {
    const secret = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES)

    sodium.randombytes_buf(secret)
    return secret.toString('hex')
}

function test() {
    const secret = generate()
    console.log(secret)
}

if (runAsCli) test()

module.exports = generate
