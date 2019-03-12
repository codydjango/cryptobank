class Bank {
    static calculateBalancesFromLog(log) {
        return log.toArray().map(entry => entry.value).reduce((acc, current) => {
            switch (current.cmd) {
                case 'register':
                    acc[current.customerId] = 0
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

        this.register = log.constructor.logify(this.register.bind(this), log)
        this.deposit = log.constructor.logify(this.deposit.bind(this), log)
        this.withdraw = log.constructor.logify(this.withdraw.bind(this), log)
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

    isRegistered(customerId) {
        return (this._balances[customerId] === undefined)
    }

    canRegister({ customerId }) {
        return (!isRegistered(customerId))
    }

    canDeposit({ customerId, amount }) {
        return this.isRegistered(customerId) && (amount >= 0)
    }

    canWithdraw({ customerId, amount }) {
        return this.isRegistered(customerId) && (this._balances[customerId] >= amount)
    }
}

module.exports = Bank
