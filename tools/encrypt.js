const sodium = require('sodium-native')
const prompt = require('./prompt')
const runAsCli = (require.main.filename === module.filename)

// Encrypt a message using symmetric encryption.
function encrypt(secret, plaintext) {
    const cipherBuf = Buffer.alloc(plaintext.length + sodium.crypto_secretbox_MACBYTES)
    const plaintextBuf = Buffer.from(plaintext)
    const nonceBuf = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)
    const secretBuf = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES, Buffer.from(secret, 'hex'))

    sodium.randombytes_buf(nonceBuf)
    sodium.crypto_secretbox_easy(cipherBuf, plaintextBuf, nonceBuf, secretBuf)

    return {
        cipher: cipherBuf.toString('hex'),
        nonce: nonceBuf.toString('hex')
    }
}

(runAsCli && (async () => {
    const secret = await prompt('SecretKey: ')
    const message = await prompt('Message: ')

    const { cipher, nonce } = encrypt(secret, message)

    console.log(`Cipher: ${ cipher }`)
    console.log(`Nonce: ${ nonce }`)
})())

module.exports = encrypt
