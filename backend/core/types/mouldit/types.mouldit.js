const Gear = require('./Gear')
const Price = require('./Price')

module.exports = {
    Gear:{
        Gear: Gear.gear,
        ref: Gear.ref,
        UIControl: Gear.UIControl
    },
    Price:{
        Price: Price.price,
        ref: Price.ref,
        currency: Price.currency,
        cents:Price.cents,
        isInt:Price.isInt,
        UIControl:Price.UIControl
    },
}
