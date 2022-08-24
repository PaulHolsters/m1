const Gear = require('./Gear')
const Price = require('./Price')

// todo toevoegen van functie zodat je je eigen custom type class hier automatisch kan laten registreren
module.exports = {
    Model:{
        model: Gear.name,
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
