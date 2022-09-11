const MoulditConstraints = require('../../Mouldit.Constraints')

module.exports = class Price {
    static get price() {
        const constraints = {
            min: 0, maxDecimals:2
        }
        const type = new Map()
        return type.set(Number, constraints)
    }

    static get ref() {
        return 'price'
    }

    // je moet hiervoor iets steken in het backend schema
    // dit heeft ook zijn equivalent in het frontend schema
    static get staticConstraints(){
        return [
            {function:'maxDecimals',value:MoulditConstraints.maxDecimals}
        ]
    }

    static get optionalConstraints(){
        return [
            {function:'cents',value:MoulditConstraints.cents}
        ]
    }

}
