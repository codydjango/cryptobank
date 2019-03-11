const sodium = require('sodium-native')
const prompt = require('./prompt')
const runAsCli = (require.main.filename === module.filename)

function decrypt(cipher, secret, nonce) {
    const cipherBuf = Buffer.from(cipher, 'hex')
    const nonceBuf = Buffer.from(nonce, 'hex')
    const secretBuf = Buffer.from(secret, 'hex')
    const messageBuf = Buffer.alloc(cipher.length)

    const decrypted = sodium.crypto_secretbox_open_easy(messageBuf, cipherBuf, nonceBuf, secretBuf)

    if (!decrypted) throw new Error('could not decrypt')

    return messageBuf.toString()
}

async function test() {
    const cipher = await prompt('cipher: ')
    const secret = await prompt('secret: ')
    const nonce = await prompt('nonce: ')

    const message = decrypt(cipher, secret, nonce)

    console.log(message)
}

if (runAsCli) test()

module.exports = decrypt
