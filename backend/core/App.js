/*const {
    ApolloServerPluginLandingPageLocalDefault
} = require('apollo-server-core');*/
const {gql} = require("apollo-server-express")
const {GraphQLScalarType, Kind} = require("graphql");
const Model = require("./Model");
const MoulditFunctions = require("./Mouldit.Functions");
const GeneralFunctions = require("./General.Functions");
const GQLFunctions = require("./Mouldit.GQL");
const MoulditTypes = require('./types/mouldit/types.mouldit')
const MoulditActions = require('./actions/Mouldit.Actions')
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

    get actions() {
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

    get components() {
        return [...this.#components]
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
                } else {
                    // Mongoose or Mouldit type
                    this.#GQLstr += '\n   ' + MoulditFunctions.getRef(concept.attr[i]) + ': ' + MoulditFunctions.getGQLTypeOf(concept.attr[i])
                }
            }
            this.#GQLstr += '\n}\n'
        })
        this.#GQLstr += 'type Mutation{'
        this.actions.filter(action => {
            return GQLFunctions.getQueryTypeOf(action) === 'Mutation'
        }).forEach(action => {
            this.#GQLstr += '\n' + GQLFunctions.createAndGetGQLFor(action, this.concepts, this)
        })
        this.#GQLstr += '\n}\ntype Query{'
        this.actions.filter(action => {
            return GQLFunctions.getQueryTypeOf(action) === 'Query'
        }).forEach(action => {
            this.#GQLstr += '\n' + GQLFunctions.createAndGetGQLFor(action, this.concepts, this)
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
        this.actions.forEach(action => {
            // voor elke actie moet er natuurlijk een resolver zijn
            // en zo'n resolver moet er per concept zijn voor zo'n actie
            if (action.hasOwnProperty('concepts') && action.concepts.length > 0) {
                action.concepts.forEach(conceptRef => {
                    const concept = this.concepts.find(concept => {
                        return concept.name.ref.singular === conceptRef
                    })
                    if (concept) {
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
            } else {
                // in de toekomst echter moet het mogelijk zijn om acties aan te maken zonder dat de actie
                // geassocieerd is met een bepaald concept (todo is dat ooit nodig?)
                // indien er acties moeten kunnen bestaan zonder een geassocieerd concept
                // dan moet dit weerspiegeld zijn in het configObject m.a.w. concepts moet dan leeg zijnj of onbestaande voor
                // deze actie
            }
        })
        this.#startupData = this.#getStartupData()
        if (this.#startupData) {
            this.#resolvers['Query']['getStartupData'] = (function () {
                return this.startupData
            }).bind(this)
        }
        console.log(this.resolvers)
        return this.#resolvers
    }

    #getStartupData() {
        return {
            routes: this.#getRoutes(),
            components: this.#getComponents(),
            currentComponent: ''
        }
    }

    #getRoutes() {

    }

    #getComponents() {
        const components = []
        this.components.forEach(component => {
            switch (component.type) {
                case 'menu':
                    component.configuration.menuItems.forEach(item => {
                        item['routerLink'] = '/' + this.components.find(comp => {
                            return comp.ref === item.component
                        }).route
                        delete item.component
                    })
                    components.push(component)
                    break
                case 'cards':
                    component.configuration.cards.forEach(card => {
                        card['routerLink'] = '/' + this.components.find(comp => {
                            return comp.ref === card.component
                        }).route
                        delete card.component
                    })
                    components.push(component)
                    break
                case 'overview':
                    if (component.configuration.hasOwnProperty('columns')) {
                        const newColumns = []
                        component.configuration.columns.forEach(column => {
                                newColumns.push({
                                    ref: column, label: this.#getLabel(component.configuration.concept, column)
                                })
                            }
                        )
                        component.configuration.columns = newColumns
                    }
                    if (component.configuration.hasOwnProperty('actionMenu')) {
                        component.configuration.actionMenu.forEach(menuItem => {
                            const comp2 = this.components.find(component2 => {
                                return component2.ref === menuItem.component
                            })
                            if (!comp2) throw new Error('component of menu item does not exist')
                            if (comp2.hasOwnProperty('route')) {
                                menuItem['routerLink'] = '/' + comp2.route
                                delete menuItem.component
                            } else {
                                switch (comp2.type) {
                                    case 'prompt':
                                        switch (comp2.configuration.action) {
                                            case 'delete':
                                                const actionName = 'delete' + GeneralFunctions.capitalizeFirst(comp2.configuration.concept)
                                                const request = actionName + '(id:"ID")'
                                                let properties = '{Result{' +
                                                    'statusCode msg' +
                                                    '}}'
                                                comp2.configuration.action = 'Mutation{\n\t' + request + '{\n' + properties + '\t}\n}'
                                                delete comp2.configuration.concept
                                                break
                                            default:
                                                break
                                        }
                                        menuItem.component = {...comp2}
                                        break
                                    default:
                                        break
                                }
                            }
                        })
                    }
                    if (component.configuration.hasOwnProperty('action')) {
                        if (MoulditActions.hasOwnProperty(GeneralFunctions.capitalizeFirst(component.configuration.action))) {
                            const plurality = MoulditActions[GeneralFunctions.capitalizeFirst(component.configuration.action)].plurality
                            const targetConcept = this.concepts.find(concept => {
                                return concept.name.ref.singular === component.configuration.concept
                            })
                            const actionName = component.configuration.action + GeneralFunctions.capitalizeFirst(
                                plurality === 'singular' ? GeneralFunctions.capitalizeFirst(targetConcept.name.ref.singular)
                                    : GeneralFunctions.capitalizeFirst(targetConcept.name.ref.plural)
                            )
                            const targetAction = this.actions.find(act => {
                                return act.name === component.configuration.action
                            })
                            if (targetAction) {
                                const queryType = GQLFunctions.getQueryTypeOf(targetAction)
                                const requests = this.GQLstr.split('type ' + queryType + '{')[1].split('}')[0].trim().split('\n')
                                let request = requests.find(request => {
                                    return request.search(actionName) !== -1
                                })
                                request = request.split(':')[0].trim()
                                let properties = ''
                                targetConcept.attr.forEach(at => {
                                    if (at.hasOwnProperty('ref')) properties += '\t\t' + at.ref + '\n'
                                    else if (MoulditFunctions.isMoulditType(at)) properties += '\t\t' + MoulditFunctions.getRef(at) + '\n'
                                    else throw new Error('no ref property found')
                                })
                                component.configuration.action = 'Query{\n\t' + request + '{\n' + properties + '\t}\n}'
                            } else {
                                throw new Error('action not configured')
                            }
                        }
                    }
                    console.log(component)
                    components.push(component)
                    break
                case 'form':

                    break
                case 'summary':

                    break
                case 'prompt':

                    break
            }
        })
        return components
    }

    #getLabel(concept, ref) {
        const concept3 = this.concepts.find(concept2 => {
            return concept2.name.ref.singular === concept
        })
        if (concept3) {
            const at = concept3.attr.find(at => {
                if (at.hasOwnProperty('ref')) return at.ref === ref
                if (MoulditTypes.hasOwnProperty(at.type.name)) return MoulditTypes[at.type.name].ref === ref
                throw new Error('No attribute with ref exists')
            })
            if (at.hasOwnProperty('label')) return at.label
            return ref
        }
        throw new Error('Concept does not exist')
    }

}
