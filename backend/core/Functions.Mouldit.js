const mongooseTypes = require('./types/mongoose/types.mongoose')
const moulditTypes = require('./types/mouldit/types.mouldit')

module.exports = class MoulditFunctions{
    static isMongooseType(type){
        return Object.keys(mongooseTypes).includes(type.name)
    }

    static isMoulditType(type){
        return Object.keys(moulditTypes).includes(type.name)
    }

    static isMongooseConstraint(constraint){
        return (
            constraint === 'required' ||
            constraint === 'minLength' ||
            constraint === 'maxLength' ||
            constraint === 'minlength' ||
            constraint === 'maxlength' ||
            constraint === 'min' ||
            constraint === 'max' ||
            constraint === 'trim' ||
            constraint === 'alias' ||
            constraint === 'lowercase' ||
            constraint === 'uppercase' ||
            constraint === 'default' ||
            constraint === 'enum' ||
            constraint === 'match' ||
            constraint === 'validate'
        )
    }

}