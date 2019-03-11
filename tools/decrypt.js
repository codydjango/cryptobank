const sodium = require('sodium-native')
const prompt = require('./prompt')
const Cli = (require.main.filename === module.filename)

// Decrypt a cipher using a known secret key and nonce.
function decrypt(secret, cipher, nonce) {
    const secretBuf = Buffer.from(secret, 'hex')
    const cipherBuf = Buffer.from(cipher, 'hex')
    const nonceBuf = Buffer.from(nonce, 'hex')
    const messageBuf = Buffer.alloc(cipher.length - sodium.crypto_secretbox_MACBYTES)

    const decrypted = sodium.crypto_secretbox_open_easy(messageBuf, cipherBuf, nonceBuf, secretBuf)

    if (!decrypted) throw new Error('could not decrypt')

    return messageBuf.toString('utf8').replace(/\0/g, '')
}

(Cli && (async () => {
    const secret = await prompt('SecretKey: ')
    const cipher = await prompt('Cipher: ')
    const nonce = await prompt('Nonce: ')

    const plaintext = decrypt(secret, cipher, nonce)

    console.log(`Message: ${ plaintext }`)
})())

module.exports = decrypt
