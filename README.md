# CryptoBank

This is an exercise in crypto primitives. I've decided to use the sodium-native library.

The exercise requirements are documented here: [https://github.com/sodium-friends/learntocrypto](https://github.com/sodium-friends/learntocrypto).

To run, first run the bank server `node bank.js` and then run the teller client in another terminal `node teller.js`.

This program will automatically create a keypair for assymetrical encryption and stores it in a plaintext `.keypair` file. It's not encrypted as this is out of scope of the exercise. In a real-life scenario all keys would be coming from a hardware vault. This program also generates a secret key for symmetrical encryption of the log, again stored as hex in a plaintext `.secret` file. The log is stored encrypted in `.data`.

To reset the generated keypairs, secret, and log, run `npm run reset`.


