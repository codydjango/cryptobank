const sodium = require('sodium-native')
const prompt = require('./prompt')
const runAsCli = (require.main.filename === module.filename)

// Decrypt a cipher using a known secret key and nonce.
function decrypt(cipher, secret, nonce) {
    const cipherBuf = Buffer.from(cipher, 'hex')
    const nonceBuf = Buffer.from(nonce, 'hex')
    const secretBuf = Buffer.from(secret, 'hex')
    const messageBuf = Buffer.alloc(cipher.length)

    const decrypted = sodium.crypto_secretbox_open_easy(messageBuf, cipherBuf, nonceBuf, secretBuf)

    if (!decrypted) throw new Error('could not decrypt')

    return messageBuf.toString()
}

(runAsCli && (async () => {
    const cipher = await prompt('Cipher: ')
    const secret = await prompt('SecretKey: ')
    const nonce = await prompt('Nonce: ')

    const plaintext = decrypt(cipher, secret, nonce)

    console.log(`Message: ${ plaintext }`)
})())

module.exports = decrypt
