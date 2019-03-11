const readline = require('readline')

// simple promised prompt for taking in user input
function prompt(message) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve, reject) => {
        rl.question(message, answer => {
            rl.close()
            resolve(answer)
        })
    })
}

module.exports = prompt
