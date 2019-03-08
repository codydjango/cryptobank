const sodium = require('sodium-native')

;(async () => {
    /**
     * Libsodium default hash is BLAKE2b
     *
     * These are useful bounds and defaults:
     * sodium.crypto_generichash_BYTES_MAX
     * sodium.crypto_generichash_BYTES for default
     * sodium.crypto_generichash_KEYBYTES_MIN
     *
     * const key = Buffer.alloc(sodium.crypto_generichash_KEYBYTES_MIN).fill('supersecretkey')
     * sodium.crypto_generichash(outputBuf, inputBuf, key)
    */

    const inputBuf = Buffer.from('Hello, World!')
    const outputBuf = Buffer.alloc(sodium.crypto_generichash_BYTES)

    sodium.crypto_generichash(outputBuf, inputBuf)

    console.log(outputBuf.toString('hex') == '511bc81dde11180838c562c82bb35f3223f46061ebde4a955c27b3f489cf1e03')
})()
