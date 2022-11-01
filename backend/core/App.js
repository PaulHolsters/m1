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
const MoulditConstraints = require("./Mouldit.Constraints");
const MongooseConstraints = require("./Mongoose.Constraints");

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
        // todo define startupData in schema
        this.#GQLstr += `\nscalar Date\n`
        this.#GQLstr += `type Result{
            statusCode: Int!
            msg: String
        }\n`
        // todo finish configuration
        this.#GQLstr +=`type Route{
            path: String
            componentName: String
        }
        
        type Action{
            name:String
            value:String
        }
        
        type Column{
            ref:String
            label:String
        }
              
        type ActionMenuItem{
            label:String
            routerLink: String
            dialogRef: String
            icon: String
        }
        
        type Button{
            name:String,
            text:String
        }
        
        union Value = ValueB | ValueS | ValueI | ValueF | SValue
        
        type ValueS{
            name:String
            value:String
        }
        
        type SValue{
            name:String
            value:[String]
        }
        
        type ValueI{
            name:String
            value:Int
        }
        
        type ValueB{
            name:String
            value:Boolean
        }
        
        type ValueF{
            name:String
            value:[Value]
        }
       
        type Format{
            ref:String,
            format:[Value]
        }
        
        type MenuItem{
            routerLink:String
            label:String
        }
        
        type Card{
            routerLink:String
            label:String
        }
        
        type Constraints{
            min:Int
            maxDecimals:Int
            minDecimals:Int
            decimals:Int
            required:Boolean
            cents:Boolean
            trim:Boolean
            unique:Boolean
            uniqueInList:Boolean
            uniqueToList:Boolean
        }
        
        type Control{
            ref:String
            label:String
            type:String
            constraints:Constraints
        }
        
        type Toast{
            summary:String
            severity:String
            detail: String
        }
        
        type Configuration{
            action: [Action]
            toast: Toast
            columns: [Column]
            validation: String
            actionMenu: [ActionMenuItem]
            header: String
            message: String 
            buttons:[Button]
            formats: [Format]
            menuItems:[MenuItem]
            cards: [Card]
            controls:[Control]
        }
        
        type Component{
            type: String
            subtype:String
            route:String
            ref: String
            configuration: Configuration
        }
        
        type StartupData{
           routes: [Route]
           components: [Component]
           currentComponent: String
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
        this.#GQLstr += '\n}\ntype Query{'+
            'getStartupData: StartupData\n'
        this.actions.filter(action => {
            return GQLFunctions.getQueryTypeOf(action) === 'Query'
        }).forEach(action => {
            this.#GQLstr += '\n' + GQLFunctions.createAndGetGQLFor(action, this.concepts, this)
        })
        this.#GQLstr += '\n}\n'
        return this.GQLstr
    }

    #generateResolverObj() {
        const dateScalar = new GraphQLScalarType({
            name: 'Date',
            description: 'Date custom scalar type',
            serialize(value) {
                // todo geef steeds het volledige formaat aan de frontend => die moet dan op basis van de format
                //  de transformatie doen
                // value is een Date Object
                //return Intl.DateTimeFormat('en-GB').format(value); // Convert outgoing Date to string for JSON
                return value.toISOString()
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
            Date: dateScalar,/*
            ActionComponent: {
                __resolveType(obj, context, info){
                    // Only Author has a name field
                    if(obj.ref){
                        return 'Prompt';
                    }
                    return null; // GraphQLError is thrown
                },
            },*/
            Value: {
                __resolveType(obj, context, info){
                    // Only Author has a name field
                    if(typeof obj === 'string'){
                        return 'String';
                    } else if(typeof obj.value === 'string'){
                        return 'ValueS'
                    }else if(typeof obj.value === 'number'){
                        return 'ValueI'
                    }else if(typeof obj.value === 'boolean'){
                        return 'ValueB'
                    } else if(obj.name === 'capitals'){
                        return 'SValue'
                    } else if(typeof obj.value === 'object') return 'ValueF'
                    return null; // GraphQLError is thrown
                },
            },
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
       const routes = []
       this.components.forEach(component=>{
         if(component.hasOwnProperty('route')){
             routes.push({path:component.route,componentName:component.ref})
         }
       })
       return routes
    }

    #getComponents() {
        const components = []
        this.components.forEach(component => {
            console.log(component.ref)
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
                                    case 'dialog':
                                        switch (comp2.subtype){
                                            case 'confirm':
                                                menuItem['dialogRef'] = comp2.ref
                                                delete menuItem.component
                                                break
                                            default:
                                                break
                                        }
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
                            // todo check of de desbetreffende actie inderdaad gelieerd is met de desbetreffende UI component
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
                                component.configuration.action = [{name:'get',value:'query{\n\t'  + request + '{\n' +'id\n' +  properties + '\t}\n}'}]
                            } else {
                                throw new Error('action not configured')
                            }
                        }
                    }
                    if (component.configuration.hasOwnProperty('concept')) {
                        // todo voeg deze controls functionaliteit ook toe aan de overview
                        component.configuration['controls'] = []
                        const targetConcept = this.concepts.find(concept => {
                            return concept.name.ref.singular === component.configuration.concept
                        })
                        if (targetConcept) {
                            targetConcept.attr.forEach(at => {
                                if (MoulditFunctions.isMoulditType(at)) {
                                    const constraints = {}
                                    const mongooseConstraints = MoulditFunctions.getConstraintsOf(at)
                                    Object.assign(constraints, mongooseConstraints)
                                    // todo refactor naming of namespaces and functions
                                    const staticConstraints = MoulditFunctions.getStaticConstraintsOf(at)
                                    staticConstraints.forEach(ct => {
                                        for (let key of Object.keys(mongooseConstraints)) {
                                            if (key === ct.function) {
                                                constraints[key] = mongooseConstraints[key]
                                                break
                                            }
                                        }
                                    })
                                    let optionalConstraints
                                    let optionalSelected
                                    if (MoulditFunctions.hasOptionalConstraints(at)) {
                                        optionalConstraints = MoulditFunctions.getOptionalConstraintsOf(at)
                                        optionalSelected = {...at.constraints}
                                        for (let key of Object.keys(optionalSelected)) {
                                            if (MoulditFunctions.isMongooseConstraint(key)) {
                                                constraints[key] = optionalSelected[key]
                                            } else {
                                                const optionalConstraint = optionalConstraints.find(ct => {
                                                    return ct.function === key
                                                })
                                                if (optionalConstraint && MoulditConstraints.isAllowedValue(key, optionalSelected[key])) {
                                                    constraints[key] = optionalSelected[key]
                                                }
                                            }
                                        }
                                    }
                                    const control = {
                                        ref:MoulditFunctions.getRef(at),
                                        label: this.#getLabel(component.configuration.concept, MoulditFunctions.getRef(at)),
                                        type: MoulditFunctions.getTypeOf(at),
                                        constraints: constraints
                                    }
                                    component.configuration.controls.push(control)
                                } else if (MoulditFunctions.isMongooseType(at)) {
                                    const optionalSelected = {...at.constraints}
                                    for (let key of Object.keys(optionalSelected)) {
                                        if (!MoulditFunctions.isMongooseConstraint(key)) {
                                            throw new Error('unknown constraint')
                                        } else if (!MongooseConstraints.isAllowedValue(key, optionalSelected[key])) {
                                            throw new Error('unknown type of value for constraint')
                                        }
                                    }
                                    const control = {
                                        ref: MoulditFunctions.getRef(at),
                                        label: this.#getLabel(component.configuration.concept, MoulditFunctions.getRef(at)),
                                        type: at.type.name,
                                        constraints: optionalSelected
                                    }
                                    component.configuration.controls.push(control)
                                }
                            })
                        }
                        delete component.configuration.concept
                    }
                    components.push(component)
                    break
                case 'form':
                    if (component.hasOwnProperty('subtype')) {
                        // todo zet volgende gemeenschappleijke lijnen in een aparte functie
                        if (MoulditActions.hasOwnProperty(GeneralFunctions.capitalizeFirst(component.subtype))) {
                            const plurality = MoulditActions[GeneralFunctions.capitalizeFirst(component.subtype)].plurality
                            const targetConcept = this.concepts.find(concept => {
                                return concept.name.ref.singular === component.configuration.concept
                            })
                            const actionName = component.subtype + GeneralFunctions.capitalizeFirst(
                                plurality === 'singular' ? GeneralFunctions.capitalizeFirst(targetConcept.name.ref.singular)
                                    : GeneralFunctions.capitalizeFirst(targetConcept.name.ref.plural)
                            )
                            // todo check of de desbetreffende actie inderdaad gelieerd is met de desbetreffende UI component
                            const targetAction = this.actions.find(act => {
                                return act.name === component.subtype
                            })
                            if (targetAction) {
                                // todo ook dit in een aparte functie
                                const queryType = GQLFunctions.getQueryTypeOf(targetAction)
                                const requests = this.GQLstr.split('type ' + queryType + '{')[1].split('}')[0].trim().split('\n')
                                let request = requests.find(request => {
                                    return request.search(actionName) !== -1
                                })
                                request = request.split('(')[0].trim()
                                let properties = ''
                                let params = '('
                                targetConcept.attr.forEach(at => {
                                    if (at.hasOwnProperty('ref')) {
                                        properties += '\t\t' + at.ref + '\n'
                                        params += at.ref + ':'
                                    } else if (MoulditFunctions.isMoulditType(at)) {
                                        properties += '\t\t' + MoulditFunctions.getRef(at) + '\n'
                                        params += MoulditFunctions.getRef(at) + ':'
                                    } else throw new Error('no ref property found')
                                    params += ' ' + MoulditFunctions.getGQLTypeOf(at, this) + ', '
                                })
                                params = params.substr(0, params.length - 2) + ')'
                                const pluralitySwitch = MoulditActions['GetDetailsOf'].plurality
                                const targetConceptSwitch = this.concepts.find(concept => {
                                    return concept.name.ref.singular === component.configuration.concept
                                })
                                const actionNameSwitch = 'getDetailsOf' + GeneralFunctions.capitalizeFirst(
                                    pluralitySwitch === 'singular' ? GeneralFunctions.capitalizeFirst(targetConceptSwitch.name.ref.singular)
                                        : GeneralFunctions.capitalizeFirst(targetConceptSwitch.name.ref.plural)
                                )
                                switch (component.subtype){
                                    case 'create':
                                        component.configuration.action = [{name:'create',value:'mutation{\n\t' + request + params + '{\n' + properties + '\t}\n}'}]
                                        break
                                    case 'edit':
                                        component.configuration.action = []
                                        component.configuration.action.push({name:'edit',value: 'mutation{\n\t' + request + params + '{\n' + properties + '\t}\n}'})
                                        component.configuration.action.push({name:'getDetailsOf',value: 'query{\n\t' + actionNameSwitch + '(id:ID)' + '{\n' + properties + '\t}\n}'})
                                        break
                                    case 'getDetailsOf':
                                        component.configuration.action = [{name:'getDetailsOf',value:'query{\n\t' + actionNameSwitch + '(id:ID)' + '{\n' + properties + '\t}\n}'}]
                                        break
                                    case 'delete':
                                        params = '(id:ID)'
                                        component.configuration.action = []
                                        component.configuration.action.push({name:'delete',value: 'mutation{\n\t' + request + params +
                                                `{
                                                    Result{
                                                        statusCode
                                                        msg
                                                    }
                                                }`
                                        })
                                        component.configuration.action.push({name:'getDetailsOf',value: 'query{\n\t' + actionNameSwitch + '(id:ID)' + '{\n' + properties + '\t}\n}'})
                                        break
                                }
                            }
                        }
                    }
                    if (component.configuration.hasOwnProperty('concept')) {
                        component.configuration['controls'] = []
                        const targetConcept = this.concepts.find(concept => {
                            return concept.name.ref.singular === component.configuration.concept
                        })
                        if (targetConcept) {
                            targetConcept.attr.forEach(at => {
                                if (MoulditFunctions.isMoulditType(at)) {
                                    const constraints = {}
                                    const mongooseConstraints = MoulditFunctions.getConstraintsOf(at)
                                    Object.assign(constraints, mongooseConstraints)
                                    // todo refactor naming of namespaces and functions
                                    const staticConstraints = MoulditFunctions.getStaticConstraintsOf(at)
                                    staticConstraints.forEach(ct => {
                                        for (let key of Object.keys(mongooseConstraints)) {
                                            if (key === ct.function) {
                                                constraints[key] = mongooseConstraints[key]
                                                break
                                            }
                                        }
                                    })
                                    let optionalConstraints
                                    let optionalSelected
                                    if (MoulditFunctions.hasOptionalConstraints(at)) {
                                        optionalConstraints = MoulditFunctions.getOptionalConstraintsOf(at)
                                        optionalSelected = {...at.constraints}
                                        for (let key of Object.keys(optionalSelected)) {
                                            if (MoulditFunctions.isMongooseConstraint(key)) {
                                                constraints[key] = optionalSelected[key]
                                            } else {
                                                const optionalConstraint = optionalConstraints.find(ct => {
                                                    return ct.function === key
                                                })
                                                if (optionalConstraint && MoulditConstraints.isAllowedValue(key, optionalSelected[key])) {
                                                    constraints[key] = optionalSelected[key]
                                                }
                                            }
                                        }
                                    }
                                    const control = {
                                        ref:MoulditFunctions.getRef(at),
                                        label: this.#getLabel(component.configuration.concept, MoulditFunctions.getRef(at)),
                                        type: MoulditFunctions.getTypeOf(at),
                                        constraints: constraints
                                    }
                                    component.configuration.controls.push(control)
                                } else if (MoulditFunctions.isMongooseType(at)) {
                                    const optionalSelected = {...at.constraints}
                                    for (let key of Object.keys(optionalSelected)) {
                                        if (!MoulditFunctions.isMongooseConstraint(key)) {
                                            throw new Error('unknown constraint')
                                        } else if (!MongooseConstraints.isAllowedValue(key, optionalSelected[key])) {
                                            throw new Error('unknown type of value for constraint')
                                        }
                                    }
                                    const control = {
                                        ref: MoulditFunctions.getRef(at),
                                        label: this.#getLabel(component.configuration.concept, MoulditFunctions.getRef(at)),
                                        type: at.type.name,
                                        constraints: optionalSelected
                                    }
                                    component.configuration.controls.push(control)
                                }
                            })
                        }
                        delete component.configuration.concept
                    }
                    components.push(component)
                    break
                case 'summary':
                    // todo
                    break
                case 'dialog':
                    switch (component.subtype){
                        case 'confirm':
                            switch (component.configuration.action) {
                                case 'delete':
                                    const actionName = 'delete' + GeneralFunctions.capitalizeFirst(component.configuration.concept)
                                    const request = actionName + '(id:"ID")'
                                    let properties = 'statusCode msg'
                                    component.configuration.action = [{name:'delete',value:'mutation{\n\t' + request + '{\n' + properties + '\t}\n}'}]
                                    delete component.configuration.concept
                                    break
                                default:
                                    break
                            }
                            if(component.configuration.buttons){
                                const buttons = []
                                for (let btn of Object.keys(component.configuration.buttons)){
                                    buttons.push({name:btn,text:component.configuration.buttons[btn]})
                                }
                                component.configuration.buttons = buttons
                            }
                            break

                        default:
                            break
                    }
                    console.log(component.configuration)
                    components.push(component)
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
