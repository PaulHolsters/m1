const mongoose = require("mongoose");
const Schema = require("./Schema");
const generalFunctions = require("./General.Functions");

module.exports = class Model {
/********************************************   attributes  ******************************************************/
    model
    #schema
    constructor(concept,app) {
        this.#schema = new mongoose.Schema(new Schema(concept.attr, app, concept.constraints).schema, {})
        this.model = mongoose.model(generalFunctions.capitalizeFirst(concept.name.ref.singular), this.#schema)
    }

/********************************************   getters and setters  *********************************************/
    get model(){
        return this.model
    }

}