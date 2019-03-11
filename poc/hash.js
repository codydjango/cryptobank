const sodium = require('sodium-native')
const prompt = require('./prompt')
const runAsCli = (require.main.filename === module.filename)

/**
 * Function to hash a message
 *
 * Libsodium default hash is BLAKE2b
 *
 * These are useful bounds and defaults:
 * sodium.crypto_generichash_BYTES_MAX
 * sodium.crypto_generichash_BYTES for default
 * sodium.crypto_generichash_KEYBYTES_MIN
*/
function hash(message) {
    const inputBuf = Buffer.from(message)
    const outputBuf = Buffer.alloc(sodium.crypto_generichash_BYTES)

    sodium.crypto_generichash(outputBuf, inputBuf)

    return outputBuf.toString('hex')
}

if (runAsCli && (async () => {
    const message = await prompt('Message: ')
    console.log(hash(message))
})())

module.exports = hash
