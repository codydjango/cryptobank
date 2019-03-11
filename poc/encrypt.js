const sodium = require('sodium-native')
const prompt = require('./prompt')
const runAsCli = (require.main.filename === module.filename)

function encrypt(secretKey, message) {
    const nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)
    const cipher = Buffer.alloc(message.length + sodium.crypto_secretbox_MACBYTES)

    sodium.randombytes_buf(nonce)
    sodium.crypto_secretbox_easy(cipher, message, nonce, secretKey)

    return { cipher: cipher.toString('hex'), nonce: nonce.toString('hex') }
}

async function cli() {
    const secret = await prompt('secret: ')
    const message = await prompt('message: ')

    const secretBuf = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES, Buffer.from(secret, 'hex'))
    const messageBuf = Buffer.from(message)

    const { cipher, nonce } = encrypt(secretBuf, messageBuf)

    console.log(`cipher: ${ cipher }`)
    console.log(`nonce: ${ nonce }`)
}

if (runAsCli) cli()

module.exports = encrypt
