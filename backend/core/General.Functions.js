const mongoose = require("mongoose");

module.exports = class GeneralFunctions{

    static capitalizeFirst(word){
        if (typeof word === 'string')
            return word[0].toUpperCase() + word.substr(1)
        else return word
    }

    static getTypeOf(value){
        switch (typeof value) {
            case 'object':
                // now it can be a: date, an normal object, an array, ...
                if (value instanceof Array) {
                    return 'array'
                } else if (value instanceof mongoose.Types.ObjectId) {
                    return 'objectId'
                } else if (value instanceof Map) {
                    return 'map'
                } else if (value instanceof Date) {
                    return 'date'
                } else return 'object'
            case 'function':
                return 'function'
            case 'string':
                return 'string'
            case 'number':
                return 'number'
            case 'boolean':
                return 'boolean'
            default:
                return undefined
        }
    }

}