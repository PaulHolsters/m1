const MoulditFunctions = require("./Mouldit.Functions");
const GeneralFunctions = require("./General.Functions");
const MoulditActions = require("./actions/Mouldit.Actions");

module.exports = class GQLFunctions{
    static createAndGetGQLFor(action,concepts,app){
        if (this.getQueryTypeOf(action)=== 'Mutation') {
            let params
            for (let concept of action.concepts){
                const fullConcept = concepts.find(cpt=>{
                    return cpt.name.ref.singular === concept
                })
                switch (action.name) {
                    case 'create':
                        params = `(`
                        for (let i = 0; i < fullConcept.attr.length; i++) {
                            if (i + 1 === fullConcept.attr.length) params += `${MoulditFunctions.getRef(fullConcept.attr[i])}: ${MoulditFunctions.getGQLTypeOf(fullConcept.attr[i],app)})`
                            else params += `${MoulditFunctions.getRef(fullConcept.attr[i])}: ${MoulditFunctions.getGQLTypeOf(fullConcept.attr[i],app)}, `
                        }
                        break
                    case 'edit':
                        params = `(id: ID, `
                        for (let i = 0; i < fullConcept.attr.length; i++) {
                            if (i + 1 === fullConcept.attr.length) params += `${MoulditFunctions.getRef(fullConcept.attr[i])}: ${MoulditFunctions.getGQLTypeOf(fullConcept.attr[i],app)})`
                            else params += `${MoulditFunctions.getRef(fullConcept.attr[i])}: ${MoulditFunctions.getGQLTypeOf(fullConcept.attr[i],app)}, `
                        }
                        break
                    case 'delete':
                        params = `(id: ID)`
                        return `${action.name}${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}${params}: Result`
                }
                if (MoulditActions.hasOwnProperty(GeneralFunctions.capitalizeFirst(action.name)) && MoulditActions[GeneralFunctions.capitalizeFirst(action.name)].plurality === 'singular') {
                    if (MoulditActions[GeneralFunctions.capitalizeFirst(action.name)].returnType === 'object') {
                        return `${action.name}${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}${params}: ${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}`
                    } else {
                        return `${action.name}${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}${params}: [${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}]`
                    }
                } else if(MoulditActions.hasOwnProperty(GeneralFunctions.capitalizeFirst(action.name))){
                    if (MoulditActions[GeneralFunctions.capitalizeFirst(action.name)].returnType === 'object') {
                        return `${action.name}${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.plural)}${params}: ${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}`
                    } else {
                        return `${action.name}${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.plural)}${params}: [${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}]`
                    }
                }
            }
        } else {
            // query actions
            for (let concept of action.concepts){
                const fullConcept = concepts.find(cpt=>{
                    return cpt.name.ref.singular === concept
                })
                if (MoulditActions.hasOwnProperty(GeneralFunctions.capitalizeFirst(action.name)) && MoulditActions[GeneralFunctions.capitalizeFirst(action.name)].plurality === 'singular') {
                    if (MoulditActions[GeneralFunctions.capitalizeFirst(action.name)].returnType === 'object') {
                        return `${action.name}${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}: ${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}`
                    } else {
                        return `${action.name}${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}: [${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}]`
                    }
                } else if(MoulditActions.hasOwnProperty(GeneralFunctions.capitalizeFirst(action.name))){
                    if (MoulditActions[GeneralFunctions.capitalizeFirst(action.name)].returnType === 'object') {
                        return `${action.name}${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.plural)}: ${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}`
                    } else {
                        return `${action.name}${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.plural)}: [${GeneralFunctions.capitalizeFirst(fullConcept.name.ref.singular)}]`
                    }
                }
            }
        }
        return ''
    }

/********************************************   private methods  *************************************************/
    static getQueryTypeOf(action) {
        switch (action.name) {
            case 'get':
                return 'Query'
            case 'getDetailsOf':
                return 'Query'
            case 'create':
                return 'Mutation'
            case 'edit':
                return 'Mutation'
            case 'delete':
                return 'Mutation'
            default :
                throw new Error('Action does not exist')
        }
    }



}