const sodium = require('sodium-native')
const prompt = require('./prompt')
const runAsCli = (require.main.filename === module.filename)

// Encrypt a message using symmetric encryption.
function encrypt(secret, message) {
    const cipherBuf = Buffer.alloc(message.length + sodium.crypto_secretbox_MACBYTES)
    const messageBuf = Buffer.from(message)
    const nonceBuf = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)
    const secretBuf = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES, Buffer.from(secret, 'hex'))

    sodium.randombytes_buf(nonceBuf)
    sodium.crypto_secretbox_easy(cipherBuf, messageBuf, nonceBuf, secretBuf)

    return {
        cipher: cipherBuf.toString('hex'),
        nonce: nonceBuf.toString('hex')
    }
}

(runAsCli && (async () => {
    const secret = await prompt('SecretKey: ')
    const message = await prompt('Message: ')

    console.log(secret, message)

    const { cipher, nonce } = encrypt(secret, message)

    console.log(`Cipher: ${ cipher }`)
    console.log(`Nonce: ${ nonce }`)
})())

module.exports = encrypt
