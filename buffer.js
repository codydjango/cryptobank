
;(async () => {
    // Creating buffers
    const b1 = Buffer.alloc(32) // Allocate empty 32 byte Buffer
    const b2 = Buffer.from('Hello, World!') // Allocate buffer and write 'Hello world'
    const b3 = Buffer.from('48656c6c6f20776f726c64', 'hex') // Decode string from `hex`
    const b4 = Buffer.alloc(32).fill('Hello') // Allocate 32 byte Buffer and repeat 'Hello'

    buf1 = Buffer.alloc(32).fill('hello')
    buf2 = Buffer.alloc(31).fill('hello')

    const bufEqual = buf1.equals(buf2) // Check whether buf1 and buf2 are equal byte by byte

    // Converting to printable strings
    const bufStringHex = b2.toString('hex') // Octets in as hexadecimal
    const bufStringBase64 = b2.toString('base64') // Octets as ascii safe string (base64)

    console.log(b1, b2, b3, b4, buf1, buf2, bufEqual, bufStringHex, bufStringBase64)

})()

;(async () => {
    try {
        const x = Buffer.alloc(13).fill('Hello, World!')
        console.log(x.toString())
        console.log(x.toString('hex'))
        console.log(x.toString('base64'))
    } catch (err) {
        console.log('err', err)
    }

    try {
        const x = Buffer.alloc(12).fill('Hello, World!')
        console.log(x.toString())
        console.log(x.toString('hex'))
        console.log(x.toString('base64'))
    } catch (err) {
        console.log('err', err)
    }

    try {
        const x = Buffer.alloc(11).fill('Hello, World!')
        console.log(x.toString())
        console.log(x.toString('hex'))
        console.log(x.toString('base64'))
    } catch (err) {
        console.log('err', err)
    }
})()
