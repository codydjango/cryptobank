const sodium = require('sodium-native')
const prompt = require('./prompt')

;(async () => {
    const publicKey = await prompt('Public Key: ')
    const message = await prompt('Message: ')
    const signature = await prompt('Signature: ')

    const messageBuf = Buffer.from(message)
    const signatureBuf = Buffer.from(signature, 'hex')
    const publicKeyBuf = Buffer.from(publicKey, 'hex')
    const verified = sodium.crypto_sign_verify_detached(signatureBuf, messageBuf, publicKeyBuf)

    console.log(`verified ${ verified }`)
})()
