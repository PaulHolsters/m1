const Gear = require('./Gear')
const Price = require('./Price')

module.exports = {
    Gear:{
        Gear: Gear.name,
        UIControl: Gear.UIControl
    },
    Price:{
        Price: Price.price,
        currency: Price.currency,
        cents:Price.cents,
        isInt:Price.isInt,
        UIControl:Price.UIControl
    },
}
