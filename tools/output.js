// Helper function for coloring display output.
function output(msg, color='reset') {
    const colors = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        pink: '\x1b[38;5;205m',
        blue: '\x1b[34m'
    }

    if (!colors[color]) throw new Error('Only red, green, and blue are supported.')

    console.log(`${ colors[color] }${ msg }${ colors['reset'] }`)
}

module.exports = output
