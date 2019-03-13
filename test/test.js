const assert = require('assert');
const encrypt = require('../tools/encrypt')
const decrypt = require('../tools/decrypt')
const generateSecret = require('../tools/generateSecret')

const Log = require('../classes/Log')

describe('encrypt and decrypt', () => {
    it('should not alter data', () => {
        const data = [{"value":{"cmd":"deposit","amount":200},"hash":"10a78ae74e06dbab39fa4ac75a57c9eb9cbbe6415488d6a3c2e7aec69709e734","signature":"53f6ebc226cd0e9b45d94f8dfac4b6d354362103018e4f2a6a0c8dd573e5a6868d0a6fa4d1003a51f7927085d0ac76b9ad48e6970ea88954125754559d1e200c"},{"value":{"cmd":"withdraw","amount":123},"hash":"e874bb4039ba8aa004a61b436820841d74f29c9c705abd80d4ccd12b5d0ee6f5","signature":"a102e07b4decbc1a3d6688097b1a74ec8e2c16a60f49f4c78cf846f844b7f0976234998dfdb639bb7d73af27fa7717f2ad36b134fda4c472925d8013c2f8b907"},{"value":{"cmd":"withdraw","amount":50},"hash":"94580dcb2ace090f661e80c97914ea243639ac6ad904ca01840b150ce2380cb2","signature":"2a43002540ed7c02a9ad37b1bb20eb21c8b89b40c0063c36a2c71a86c3867962fb1790e4a2f2a724de9d11bbfedfcaeb064d74b6b4e0e993cd23b0ef8c077d03"},{"value":{"cmd":"deposit","amount":30},"hash":"3538c8b8fd13165766ad8491567204899f6ef8758257ea35c46967dd6f2cbc4b","signature":"707587c4601c9b0141c1d62f9995f2a0e03edaff1fda4655dd34f3fe181ebdabd3b67a57108cff19d372e8e806878c9509b5481ee3a3c1d68f3b7b3514cb1e0d"},{"value":{"cmd":"withdraw","amount":10},"hash":"be1d1c3c9606fee9c4b1778f4d7808c1add339d72ab676b09e17ac681192e6f6","signature":"415bb6a6637a7852ea20353f7b3f8b1f8a8dc82f1516d1d53e8008ee2721bd48f1cd58e8ca5a2d6b50b81cced8f9f605036782db3a4bd99acdf422b78c43170f"}]
        const secret = generateSecret()
        const { cipher, nonce } = encrypt(secret, JSON.stringify(data))
        const data2 = JSON.parse(decrypt(secret, cipher, nonce))

        const d1 = JSON.stringify(data)
        const d2 = JSON.stringify(data2)

        assert.equal(d1, d2)
    })
})

describe('log', () => {
    const log = new Log(true)

    it('genesis works', () => {
        assert.equal(log.bestHash, Log.genesisHash)
    })

    it('toArray is an array', () => {
        assert.equal(Array.isArray(log.toArray()), true)
    })

    it('addition works', () => {
        log.add({foo: "bar"})

        len1 = log._log.length
        log.add({foo: "bar"})
        assert.equal(len1 + 1, log._log.length)
    })

    it('validation works', () => {
        assert.equal(log.isValid(), true)
    })

    it('validation fails upon hash tamper', () => {
        log._log[1].hash = 'tamper with hash'
        assert.equal(log.isValid(), false)
    })
})



