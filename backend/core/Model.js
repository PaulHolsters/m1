const mongoose = require("mongoose");
const Schema = require("./Schema");
const generalFunctions = require("./General.Functions");
const MoulditFunctions = require("./Mouldit.Functions");
const MoulditConstraints = require("./Mouldit.Constraints");

module.exports = class Model {
/********************************************   attributes  ******************************************************/
    #model
    #schema
    constructor(concept,app) {
        this.#schema = new mongoose.Schema(new Schema(concept.attr, app, concept.constraints).schema, {})
        this.#model = mongoose.model(generalFunctions.capitalizeFirst(concept.name.ref.singular), this.#schema)
        for (let i=0;i<concept.attr.length;i++){
            for (let [k,v] in Object.entries(concept.attr[i].constraints)) {
                if(!MoulditFunctions.isMongooseConstraint(k) && MoulditConstraints.validate.hasOwnProperty(k)){
                    this.#schema.path(concept.attr[i].ref).validate(MoulditConstraints[k]([app,concept,concept.attr[i],this.model],v))
                }
            }
            if(MoulditFunctions.isChildListConcept(concept.attr[i],app)){
                this.#schema.path(concept.attr[i].ref)
                    .validate(MoulditConstraints
                        .checkChildListId([app,concept,concept.attr[i],this.model],true))
            }
            if(MoulditFunctions.isChildConcept(concept.attr[i],app)){
                this.#schema.path(concept.attr[i].ref)
                    .validate(MoulditConstraints
                        .checkChildId([app,concept,concept.attr[i],this.model],true))
            }
        }
        // todo

    }

/********************************************   getters and setters  *********************************************/
    get model(){
        return this.#model
    }

}