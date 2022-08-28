/*const {
    ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');*/
const {gql} = require("apollo-server-express")
const {GraphQLScalarType, Kind} = require("graphql");
const Model = require("./Model");
const MoulditFunctions = require("./Mouldit.Functions");
const GeneralFunctions = require("./General.Functions");
const GQLFunctions = require("./Mouldit.GQL");

module.exports = class App {
    /********************************************   attributes  ******************************************************/
    #concepts
    #actions
    #users
    #components
    #GQLstr

    constructor(configObj) {
        this.#concepts = new Map()
        this.#actions = []
        this.#users = []
        this.#components = []
        this.#GQLstr = ''
        configObj.concepts.forEach(concept => {
            this.#concepts.set(concept, null)
        })
        for (let k of this.concepts.reverse()) {
            this.#concepts.set(k, new Model(k, this).model)
        }
        configObj.actions.forEach(action => {
            this.#actions.push(action)
        })
        configObj.users.forEach(user => {
            this.#users.push(user)
        })
        configObj.components.forEach(comp => {
            this.#components.push(comp)
        })
    }

    /********************************************   getters and setters  *********************************************/
    get concepts() {
        return [...this.#concepts.keys()]
    }

    get models() {
        return [...this.#concepts.values()]
    }

    get actions(){
        return [...this.#actions]
    }

    get GQLstr() {
        return this.#GQLstr
    }

    /********************************************   public methods  **************************************************/
    generate() {
        const typeDefs = this.#generateGQLStr()
        const resolvers = this.#generateResolverObj()
        return {
            typeDefs,
            resolvers,
            /*                csrfPrevention: true,
                            cache: 'bounded',*/
            /**
             * What's up with this embed: true option?
             * These are our recommended settings for using AS;
             * they aren't the defaults in AS3 for backwards-compatibility reasons but
             * will be the defaults in AS4. For production environments, use
             * ApolloServerPluginLandingPageProductionDefault instead.
             **/
            /*                            plugins: [
                                            ApolloServerPluginLandingPageLocalDefault({ embed: true }),
                                        ],*/
        }
    }

    /********************************************   private methods  *************************************************/
    #generateGQLStr() {
        this.#GQLstr += `\nscalar Date\n`
        this.concepts.forEach(concept => {
            this.#GQLstr += '\ntype ' + GeneralFunctions.capitalizeFirst(concept.name.ref.singular) + '{'
            this.#GQLstr += '\n   ' + 'id' + ': ' + 'ID!'
            for (let i = 0; i < concept.attr.length; i++) {
                if (MoulditFunctions.isChildConcept(concept.attr[i], this)) {
                    this.#GQLstr += '\n   ' + concept.attr[i].ref + ': ' + GeneralFunctions.capitalizeFirst(concept.attr[i].type)
                } else if (MoulditFunctions.isChildListConcept(concept.attr[i], this)) {
                    this.#GQLstr += '\n   ' + concept.attr[i].ref + ': [' + GeneralFunctions.capitalizeFirst(concept.attr[i].type) + ']'
                } else{
                    // Mongoose or Mouldit type
                    this.#GQLstr += '\n   ' + MoulditFunctions.getRef(concept.attr[i]) + ': ' + MoulditFunctions.getGQLTypeOf(concept.attr[i])
                }
            }
            this.#GQLstr += '\n}\n'
        })
        this.#GQLstr += 'type Mutation{'
        this.actions.filter(action=>{
            return GQLFunctions.getQueryTypeOf(action) === 'Mutation'
        }).forEach(action=>{
            this.#GQLstr += '\n'+GQLFunctions.createAndGetGQLFor(action,this.concepts,this)
        })
        this.#GQLstr += '\n}\ntype Query{'
        this.actions.filter(action=>{
            return GQLFunctions.getQueryTypeOf(action) === 'Query'
        }).forEach(action=>{
            this.#GQLstr += '\n'+GQLFunctions.createAndGetGQLFor(action,this.concepts,this)
        })
        this.#GQLstr += '\n}\n'
        console.log(this.GQLstr)
        return this.GQLstr
    }

    #generateResolverObj() {
        // todo next
    }

}
