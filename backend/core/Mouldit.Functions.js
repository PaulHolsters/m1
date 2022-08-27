const mongooseTypes = require('./types/mongoose/types.mongoose')
const moulditTypes = require('./types/mouldit/types.mouldit')
const GeneralFunctions = require("./General.Functions");

module.exports = class MoulditFunctions{
    static isMongooseType(attr){
        return Object.keys(mongooseTypes).includes(attr.type.name)
    }

    static isMoulditType(attr){
        return Object.keys(moulditTypes).includes(attr.type.name)
    }

    static isChildConcept(attr,app){
        if(GeneralFunctions.getTypeOf(attr)==='string'){
            return app.concepts.find(concept=>{
                return attr.type.search(concept.name.ref.singular) !== -1
            }) !== undefined
        }
        return false
    }

    static isChildListConcept(attr,app){
        if(GeneralFunctions.getTypeOf(attr.type)==='array' && attr.type.length === 1){
            return app.concepts.find(concept=>{
                return attr.type[0].search(concept.name.ref.singular) !== -1
            }) !== undefined
        }
        return false
    }

    static getTypeOf(attr){
        if(moulditTypes.hasOwnProperty(attr.type.toString())) return moulditTypes[attr.type.toString()][attr.type.toString()].keys()[0]
        return undefined
    }

    static getConstraintsOf(attr){
        if(moulditTypes.hasOwnProperty(attr.type.toString())) return moulditTypes[attr.type.toString()][attr.type.toString()].values()[0]
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