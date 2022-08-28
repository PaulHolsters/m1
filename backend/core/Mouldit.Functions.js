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
        if(moulditTypes.hasOwnProperty(attr.type.name)) return [...moulditTypes[attr.type.name][attr.type.name].keys()][0].name
        return undefined
    }

    static getGQLTypeOf(attr,app){
        if(this.isMongooseType(attr)){
            if(attr.type.name === 'Number') return 'Int'
            return attr.type.name
        }
        if(this.isMoulditType(attr) && this.getTypeOf(attr) === 'Number'){
            return 'Int'
        }
        if(this.isMoulditType(attr)){
            return this.getTypeOf(attr)
        }
        if(this.isChildConcept(attr)) return 'ID'
        if(this.isChildListConcept(attr,app)) return '[ID]'
        throw new Error('type not implemented')
    }

    static getRef(attr){
        if(!attr.ref && this.isMoulditType(attr)){
            return moulditTypes[attr.type.name].ref
        }
        if(attr.ref) return attr.ref
        throw new Error('no reference exists for this attribute')
    }

    static getConstraintsOf(attr){
        if(moulditTypes.hasOwnProperty(attr.type.name)) return [...moulditTypes[attr.type.name][attr.type.name].values()][0]
        return undefined
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