const sodium = require('sodium-native')
const prompt = require('./prompt')
const runAsCli = (require.main.filename === module.filename)

/**
 * Generate a hash for a string.
 *
 * Libsodium default hash is BLAKE2b
 *
 * These are useful bounds and defaults:
 * sodium.crypto_generichash_BYTES_MAX
 * sodium.crypto_generichash_BYTES for default
 * sodium.crypto_generichash_KEYBYTES_MIN
*/
function generateHash(message) {
    const inputBuf = Buffer.from(message)
    const outputBuf = Buffer.alloc(sodium.crypto_generichash_BYTES)

    sodium.crypto_generichash(outputBuf, inputBuf)

    return outputBuf.toString('hex')
}

(runAsCli && (async () => {
    const message = await prompt('Message: ')
    console.log(generateHash(message))
})())

module.exports = generateHash
