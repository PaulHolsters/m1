/*const {
    ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');*/
const {gql} = require("apollo-server-express")
const {GraphQLScalarType, Kind} = require("graphql");
const Model = require("./Model");
const MoulditFunctions = require("./Mouldit.Functions");
const GeneralFunctions = require("./General.Functions");
const GQLFunctions = require("./Mouldit.GQL");
const Resolver = require("./Resolver");

module.exports = class App {
    /********************************************   attributes  ******************************************************/
    #concepts
    #actions
    #users
    #components
    #GQLstr
    #resolvers
    #startupData
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

    get resolvers() {
        return {...this.#resolvers}
    }

    get startupData() {
        return {...this.#startupData}
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
        this.#GQLstr += `type Result{
            statusCode: Int!
            msg: String
        }\n`
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
        const dateScalar = new GraphQLScalarType({
            name: 'Date',
            description: 'Date custom scalar type',
            serialize(value) {
                return Intl.DateTimeFormat('en-GB').format(value); // Convert outgoing Date to string for JSON
            },
            parseValue(value) {
                return new Date(value); // Convert incoming string to Date
            },
            parseLiteral(ast) {
                if (ast.kind === Kind.STRING) {
                    return new Date(ast.value); // Convert hard-coded AST string to Date
                }
                return null; // Invalid hard-coded value (not a string)
            },
        });
        this.#resolvers = {
            Date: dateScalar
        }
        this.actions.forEach(action=>{
            // voor elke actie moet er natuurlijk een resolver zijn
            // en zo'n resolver moet er per concept zijn voor zo'n actie
            if(action.hasOwnProperty('concepts') && action.concepts.length>0){
                action.concepts.forEach(conceptRef=>{
                    const concept = this.concepts.find(concept=>{
                        return concept.name.ref.singular === conceptRef
                    })
                    if(concept){
                        const model = this.#concepts.get(concept)
                        const resolver = new Resolver(action, model, concept).resolver
                        if (resolver.hasOwnProperty('Mutation')) {
                            if (this.#resolvers.hasOwnProperty('Mutation')) {
                                this.#resolvers['Mutation'][Object.keys(resolver['Mutation'])[0]] = Object.values(resolver['Mutation'])[0]
                            } else {
                                this.#resolvers['Mutation'] = resolver['Mutation']
                            }
                        } else {
                            if (this.#resolvers.hasOwnProperty('Query')) {
                                this.#resolvers['Query'][Object.keys(resolver['Query'])[0]] = Object.values(resolver['Query'])[0]
                            } else {
                                this.#resolvers['Query'] = resolver['Query']
                            }
                        }
                    }
                })
            } else{
                // in de toekomst echter moet het mogelijk zijn om acties aan te maken zonder dat de actie
                // geassocieerd is met een bepaald concept (todo is dat ooit nodig?)
                // indien er acties moeten kunnen bestaan zonder een geassocieerd concept
                // dan moet dit weerspiegeld zijn in het configObject m.a.w. concepts moet dan leeg zijnj of onbestaande voor
                // deze actie
            }
        })
        this.#startupData = this.#getStartupData()
        if(this.#startupData){
            this.#resolvers['Query']['getStartupData'] = (function () {
                return this.startupData
            }).bind(this)
        }
        console.log(this.resolvers)
        return this.#resolvers
    }

    #getStartupData() {
        // wat heeft de frontend nodig dat niet al in het configObject zit?

    }

}
