class Bank {
    constructor(balances) {
        this._balances = balances

        this.register = this.register.bind(this)
        this.deposit = this.deposit.bind(this)
        this.withdraw = this.withdraw.bind(this)
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
        return (this._balances[customerId] !== undefined)
    }

    canRegister({ customerId }) {
        return (!this.isRegistered(customerId))
    }

    canDeposit({ customerId, amount }) {
        return this.isRegistered(customerId) && (amount >= 0)
    }

    canWithdraw({ customerId, amount }) {
        return this.isRegistered(customerId) && (this._balances[customerId] >= amount)
    }
}

module.exports = Bank
