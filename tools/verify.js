const sodium = require('sodium-native')
const prompt = require('./prompt')
const Cli = (require.main.filename === module.filename)

// Verify a signature is valid given a known message and public key.
function verify(signature, message, public) {
    if (typeof message !== 'string') throw new Error('Verify \'message\' argument must be of type: string')
    const messageBuf = Buffer.from(message)
    const signatureBuf = Buffer.from(signature, 'hex')
    const publicBuf = Buffer.from(public, 'hex')

    return sodium.crypto_sign_verify_detached(signatureBuf, messageBuf, publicBuf)
}

(Cli && (async () => {
    const signature = await prompt('Signature: ')
    const message = await prompt('Message: ')
    const public = await prompt('PublicKey: ')
    const verified = verify(signature, message, public)

    console.log(`Verified: ${ verified }`)
})())

module.exports = verify
