const mongoose = require("mongoose");
module.exports = class GeneralFunctions{

    static capitalizeFirst(word){
        if (typeof word === 'string')
            return word[0].toUpperCase() + word.substr(1)
        else return word
    }

    static getTypeOf(attr){
        switch (typeof attr.type) {
            case 'object':
                // now it can be a: date, an normal object, an array, ...
                if (attr.type instanceof Array) {
                    return 'array'
                } else if (attr.type instanceof mongoose.Types.ObjectId) {
                    return 'objectId'
                } else if (attr.type instanceof Map) {
                    return 'map'
                } else if (attr.type instanceof Date) {
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