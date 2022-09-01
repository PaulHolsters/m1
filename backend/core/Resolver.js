const GQLFunctions = require("./Mouldit.GQL");
const GeneralFunctions = require("./General.Functions");
const MoulditActions = require('./actions/Mouldit.Actions')

module.exports = class Resolver {
    /********************************************   attributes  ******************************************************/
    #resolver
    constructor(action,model,concept) {
        this.#resolver = {}
        const queryFunctionObject = {}
        let actionFunc
        let actionQueryType = GQLFunctions.getQueryTypeOf(action)
        if (actionQueryType === 'Mutation') {
            switch (action.name) {
                case 'create':
                    actionFunc = async function (_, data) {
                        const resource = new model(data)
                        return resource.save()
                    }
                    break
                case 'edit':
                    actionFunc = async function (_, data) {
                        const update = {}
                        await model.findById({_id: data.id},{_id:0,__v:0}).then(resource=>{
                            Object.assign(update,resource._doc)
                            Object.assign(update,data)
                        })
                        return model.findByIdAndUpdate({_id: data.id}, update, {runValidators: true,context:'query'}).then(result => {
                            return update
                        }).catch(err => {
                            console.log(err)
                        })
                    }
                    break
                case 'delete':
                    actionFunc = async function (_, data) {
                        return model.deleteOne({_id:data})
                    }
                    break
            }
        } else {
            switch(action.name){
                case 'get':
                    (actionFunc = function () {
                        return model.find()
                    }).bind(this)
                    break
                case 'getDetailsOf':
                    (actionFunc = function () {
                        return model.find()
                    }).bind(this)
                    break
            }
        }
        if(MoulditActions.hasOwnProperty(GeneralFunctions.capitalizeFirst(action.name))){
            const plurality = MoulditActions[GeneralFunctions.capitalizeFirst(action.name)].plurality
            if(plurality === 'plural'){
                queryFunctionObject[action.name + GeneralFunctions.capitalizeFirst(concept.name.ref.plural)] = actionFunc
            } else{
                queryFunctionObject[action.name + GeneralFunctions.capitalizeFirst(concept.name.ref.singular)] = actionFunc
            }
        }
        this.#resolver[actionQueryType] = queryFunctionObject
    }

    /********************************************   getters and setters  *********************************************/
    get resolver() {
        return {...this.#resolver}
    }

    /********************************************   private methods  *************************************************/


}