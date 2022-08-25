const Gear = require('./Gear')
const Price = require('./Price')

module.exports = {
    Gear:{
        name: Gear.name,
        capitalized: Gear.capitalized,
        UIControl: Gear.UIControl
    },
    Price:{
        price: Price.price,
        currency: Price.currency,
        cents:Price.cents,
        isInt:Price.isInt,
        UIControl:Price.UIControl
    },
}
