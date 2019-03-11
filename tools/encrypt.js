const sodium = require('sodium-native')
const prompt = require('./prompt')
const runAsCli = (require.main.filename === module.filename)

// Encrypt a message using symmetric encryption.
function encrypt(secretKey, plaintext) {
    const nonce = Buffer.alloc(sodium.crypto_secretbox_NONCEBYTES)
    const cipher = Buffer.alloc(plaintext.length + sodium.crypto_secretbox_MACBYTES)

    sodium.randombytes_buf(nonce)
    sodium.crypto_secretbox_easy(cipher, plaintext, nonce, secretKey)

    return {
        cipher: cipher.toString('hex'),
        nonce: nonce.toString('hex')
    }
}

(runAsCli && (async () => {
    const secret = await prompt('SecretKey: ')
    const plaintext = await prompt('Message: ')

    const secretBuf = Buffer.alloc(sodium.crypto_secretbox_KEYBYTES, Buffer.from(secret, 'hex'))
    const plaintextBuf = Buffer.from(plaintext)

    const { cipher, nonce } = encrypt(secretBuf, plaintextBuf)

    console.log(`Cipher: ${ cipher }`)
    console.log(`Nonce: ${ nonce }`)
})())

module.exports = encrypt
