const Gear = require('./Gear')
const Price = require('./Price')

module.exports = {
    Gear:{
        Gear: Gear.gear,
        ref: Gear.ref,
        staticConstraints: Gear.staticConstraints
    },
    Price:{
        Price: Price.price,
        ref: Price.ref,
        staticConstraints: Price.staticConstraints,
        optionalConstraints: Price.optionalConstraints
    },
}
