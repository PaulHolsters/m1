/*const {
    ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');*/
const {gql} = require("apollo-server-express")
const {GraphQLScalarType, Kind} = require("graphql");
const Model = require("./Model");

module.exports = class App {
/********************************************   attributes  ******************************************************/
    #concepts
    #actions
    #users
    #components
    constructor(configObj) {
        this.#concepts = new Map()
        this.#actions = []
        this.#users = []
        this.#components = []
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
get concepts(){
    return [...this.#concepts.keys()]
}

get models(){
    return [...this.#concepts.values()]
}

/********************************************   public methods  **************************************************/
generate(){
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
    #generateGQLStr(){

    }

    #generateResolverObj(){

    }

}
