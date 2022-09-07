const MoulditConstraints = require('../../Mouldit.Constraints')

module.exports = class Price {
    static get price() {
        const constraints = {
            min: 0
        }
        const type = new Map()
        return type.set(Number, constraints)
    }

    static get ref() {
        return 'price'
    }

    static staticConstraints(){
        return [
            {function:'maxDecimals',params:[2],value:MoulditConstraints.maxDecimals(2)}
        ]
    }

    static optionalConstraints({allowed:allowed}){
        return [
            {function:'cents',params:[allowed],value:MoulditConstraints.cents(allowed)}
        ]
    }

}
