const sodium = require('sodium-native')
const prompt = require('./prompt')
const runAsCli = (require.main.filename === module.filename)

function verify(signature, message, public) {
    const messageBuf = Buffer.from(message)
    const signatureBuf = Buffer.from(signature, 'hex')
    const publicBuf = Buffer.from(public, 'hex')

    return sodium.crypto_sign_verify_detached(signatureBuf, messageBuf, publicBuf)
}

async function test() {
    const signature = await prompt('Signature: ')
    const message = await prompt('Message: ')
    const public = await prompt('Public Key: ')
    const verified = verify(signature, message, public)

    console.log(`verified ${ verified }`)
}

if (runAsCli) test()

module.exports = verify
