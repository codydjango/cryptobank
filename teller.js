// teller.js
const jsonStream = require('duplex-json-stream')
const net = require('net')

const client = jsonStream(net.connect(3876))

console.log('Start Teller')

client.on('data', function (msg) {
    console.log('Teller received:', msg)
})

const customer1 = 'first'
const customer2 = 'second'

client.write({ customerId: customer1, cmd: 'register', })
client.write({ customerId: customer1, cmd: 'deposit', amount: 200 })
client.write({ customerId: customer2, cmd: 'register', })
client.write({ customerId: customer2, cmd: 'deposit', amount: 123 })
client.write({ customerId: customer1, cmd: 'withdraw', amount: 11 })
client.write({ customerId: customer1, cmd: 'withdraw', amount: 23 })
client.write({ customerId: customer1, cmd: 'withdraw', amount: 3000 })
client.write({ customerId: customer2, cmd: 'withdraw', amount: 10 })
client.write({ customerId: customer2, cmd: 'withdraw', amount: 1000 })
client.write({ customerId: customer2, cmd: 'deposit', amount: 231 })
client.write({ customerId: customer1, cmd: 'balance' })
client.write({ customerId: customer2, cmd: 'balance' })
