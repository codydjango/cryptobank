class Bank {
    static calculateBalancesFromLog(log) {
        return log.toArray().map(entry => entry.value).reduce((acc, current) => {
            if (!Number.isInteger(acc[current.customerId])) {
                acc[current.customerId] = 0
            }

            switch (current.cmd) {
                case 'deposit':
                    acc[current.customerId] += current.amount
                    break
                case 'withdraw':
                    acc[current.customerId] -= current.amount
                    break
            }

            return acc
        }, {})
    }

    constructor({ log }) {
        this._balances = Bank.calculateBalancesFromLog(log)

        this.register = this.register.bind(this)
        this.deposit = this.deposit.bind(this)
        this.withdraw = this.withdraw.bind(this)

        this.register = log.constructor.logify(this.register, log)
        this.deposit = log.constructor.logify(this.deposit, log)
        this.withdraw = log.constructor.logify(this.withdraw, log)
    }

    getBalance(customerId) {
        return this._balances[customerId]
    }

    register({ customerId }) {
        this._balances[customerId] = 0
    }

    deposit({ customerId, amount }) {
        this._balances[customerId] += amount
    }

    withdraw({ customerId, amount }) {
        this._balances[customerId] -= amount
    }

    canRegister({ customerId }) {
        return (this._balances[customerId] === undefined)
    }

    canDeposit({ amount }) {
        return (amount >= 0)
    }

    canWithdraw({ customerId, amount }) {
        return (this._balances[customerId] >= amount)
    }
}

module.exports = Bank
