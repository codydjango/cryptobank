// teller.js
const jsonStream = require('duplex-json-stream')
const net = require('net')

const client = jsonStream(net.connect(3876))

console.log('Start Teller')

client.on('data', function (msg) {
    console.log('Teller received:', msg)
})

client.write({cmd: 'balance'})
client.write({cmd: 'deposit', amount: 123 })
client.write({cmd: 'withdraw', amount: 50 })
client.write({cmd: 'withdraw', amount: 50 })
client.write({cmd: 'deposit', amount: 30 })
client.write({cmd: 'withdraw', amount: 10 })

