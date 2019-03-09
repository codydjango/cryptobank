const sodium = require('sodium-native')
const prompt = require('./prompt')


;(async () => {
    const publicKeyBuf = Buffer.alloc(sodium.crypto_sign_PUBLICKEYBYTES)
    const secretKeyBuf = Buffer.alloc(sodium.crypto_sign_SECRETKEYBYTES)
    const signatureBuf = Buffer.alloc(sodium.crypto_sign_BYTES)

    sodium.crypto_sign_keypair(publicKeyBuf, secretKeyBuf)

    const message = (await prompt('Message: ')).trim()
    const messageBuf = Buffer.from(message)

    sodium.crypto_sign_detached(signatureBuf, messageBuf, secretKeyBuf)

    console.log(`Signed message: ${ message }`, message.length)
    console.log(`Public Key: ${ publicKeyBuf.toString('hex') }`, publicKeyBuf.toString('hex').length)
    console.log(`Signature: ${ signatureBuf.toString('hex') }`, signatureBuf.toString('hex').length)
})()
