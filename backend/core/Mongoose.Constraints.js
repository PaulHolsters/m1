const GeneralFunctions = require("./General.Functions");

module.exports = class MongooseConstraints{

    static isAllowedValue(functionName,value){
        switch (functionName){
            case 'uppercase':
                return
            case 'default':
                return GeneralFunctions.getTypeOf(value) !== undefined
            case 'enum':
                return GeneralFunctions.getTypeOf(value) === 'array'
            case 'match':
                return value instanceof RegExp
            case 'validate':
                return GeneralFunctions.getTypeOf(value) === 'function'
            case 'required':
                return value===true||value===false
            case 'minLength':
                return !isNaN(value) && value >=0
            case 'maxLength':
                return !isNaN(value) && value >=0
            case 'minlength':
                return !isNaN(value) && value >=0
            case 'maxlength':
                return !isNaN(value) && value >=0
            case 'min':
                return !isNaN(value)
            case 'max':
                return !isNaN(value)
            case 'trim':
                return value===true||value===false
            case 'alias':
                return typeof value === 'string'
            case 'lowercase':
                return value===true||value===false
        }
    }


}