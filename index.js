'use strict'
// todo
//  deze versie wordt in eerste instantie geschreven met de gedachte dat de
//  gebruiker van Mouldit geen fouten maakt,
//  een gebruiker van Mouldit wordt vanaf nu een "dev" genoemd
const http = require("http")
const port = Number(process.env.PORT || 5000)
const express = require('express')
const mongoose = require('mongoose')
const appserver = express()
const {ApolloServer} = require('apollo-server-express')

const Gear = require('./backend/core/types/mouldit/Gear')
const Price = require('./backend/core/types/mouldit/Price')

const App = require("./backend/core/App.js")

const app = new App({
    concepts: [
        {
            name: {ref: {singular: 'product', plural: 'products'}, label: {singular: 'product', plural: 'products'}},
            attr: [
                {
                    type: Gear,
                    label: 'product',
                    constraints: {
                        capitals: ['first']
                    }
                },
                {
                    type: Price,
                    label: 'basis prijs',
                    ref: 'basePrice',
                    // constraints bepalen ENKEL welke data toegelaten is in de database en deels in de frontend
                    // niet HOE validatie moet gebeuren en slechts deels WELKE validatie in een front end formulier
                    constraints: {
                        // elke constraint resulteert in een bepaalde validatie, vandaar dat currency 'EUR' hier niet thuishoort!
                        required: true,
                        // indien false dan enkel gehele bedragen toegestaan zonder bv. eurocent
                        cents: false
                    }
                },
                {
                    type: Date,
                    label: 'aangemaakt op',
                    ref: 'creationDate',
                    // ook hier het formaat wordt bepaald in de frontend component, in de backend is dit steeds een datetime
                    // voor een gewone datum zal de tijd dan overal 0 zijn
                    default: new Date()
                }
            ]
        }
    ],
    actions: [
        {
            subject: 'user',
            name: 'create',
            concepts: [
                'product'
            ]
        },
        {
            subject: 'user',
            name: 'delete',
            concepts: [
                'product'
            ]
        },
        {
            subject: 'user',
            name: 'edit',
            concepts: [
                'product'
            ]
        },
        {
            subject: 'user',
            name: 'get',
            concepts: [
                'product'
            ]
        },
        {
            subject: 'user',
            name: 'getDetailsOf',
            concepts: [
                'product'
            ]
        }
    ],
    users: [],
    components: [
        {
            type: 'menu',
            ref: 'menu',
            configuration: {
                menuItems: [
                    {label: 'Producten', component: 'productCards'}
                ]
            }
        },
        {
            type: 'cards',
            route: 'producten',
            ref: 'productCards',
            configuration: {
                cards: [
                    {label: 'Nieuw product', component: 'newProductForm'},
                    {label: 'Overzicht producten', component: 'productsOverview'},
                ]
            }
        },
        {
            type: 'form',
            subtype: 'create',
            route: 'product/nieuw',
            ref: 'newProductForm',
            configuration: {
                concept: 'product',
                formats: [
                    {
                        ref: 'basePrice',
                        format: [{name: 'currency', value: 'EUR'}, {
                            name: 'cents',
                            value: [{name: 'show', value: false}, {name: 'allowed', value: false}]
                        }]
                    },
                    {
                        ref: 'creationDate',
                        format: [{
                            name: 'time',
                            value: [{name: 'show', value: true}, {
                                name: 'timeFormat',
                                value: 'HH:MM:SS:mmm'
                            }, {name: 'hourFormat', value: '24'}]
                        },
                            {
                                name: 'date',
                                value: [{name: 'show', value: true}, {name: 'dateFormat', value: 'dd/mm/yyyy'}]
                            }]
                    }
                ],
                validation: 'onsubmit'
            }
        },
        {
            type: 'overview',
            route: 'producten/overzicht',
            ref: 'productsOverview',
            configuration: {
                action: 'get',
                concept: 'product',
                actionMenu: [
                    {
                        label: 'aanpassen',
                        component: 'editProductForm'
                    },
                    {
                        label: 'bekijken',
                        component: 'detailsProductForm'
                    },
                    {
                        label: 'verwijderen',
                        component: 'deleteProductForm'
                    }
                ],
                columns: ['gearName', 'basePrice', 'creationDate']
            }
        },
        {
            type: 'form',
            subtype: 'edit',
            route: 'product/aanpassen',
            ref: 'editProductForm',
            configuration: {
                concept: 'product',
                formats: [
                    {
                        ref: 'basePrice',
                        format: [{name: 'currency', value: 'EUR'}, {
                            name: 'cents',
                            value: [{name: 'show', value: false}, {name: 'allowed', value: false}]
                        }]
                    },
                    {
                        ref: 'creationDate',
                        format: [{
                            name: 'time',
                            value: [{name: 'show', value: true}, {
                                name: 'timeFormat',
                                value: 'HH:MM:SS:mmm'
                            }, {name: 'hourFormat', value: '24'}]
                        },
                            {
                                name: 'date',
                                value: [{name: 'show', value: true}, {name: 'dateFormat', value: 'dd/mm/yyyy'}]
                            }]
                    }
                ],
                validation: 'onsubmit'
            }
        },
        /*        {
                    type:'summary',
                    route:'product/samenvatting',
                    ref:'detailsProductSummary',
                    configuration:{
                        action:'getDetailsOf',
                        concept:'product'
                    }
                },*/
        {
            type: 'form',
            subtype: 'getDetailsOf',
            route: 'product/details',
            ref: 'detailsProductForm',
            configuration: {
                concept: 'product',
                formats: [
                    {
                        ref: 'basePrice',
                        format: [{name: 'currency', value: 'EUR'}, {
                            name: 'cents',
                            value: [{name: 'show', value: false}, {name: 'allowed', value: false}]
                        }]
                    },
                    {
                        ref: 'creationDate',
                        format: [{
                            name: 'time',
                            value: [{name: 'show', value: true}, {
                                name: 'timeFormat',
                                value: 'HH:MM:SS:mmm'
                            }, {name: 'hourFormat', value: '24'}]
                        },
                            {
                                name: 'date',
                                value: [{name: 'show', value: true}, {name: 'dateFormat', value: 'dd/mm/yyyy'}]
                            }]
                    }
                ]
            }
        },
        {
            type: 'form',
            subtype: 'delete',
            route: 'product/verwijderen',
            ref: 'deleteProductForm',
            configuration: {
                concept: 'product',
                formats: [
                    {
                        ref: 'basePrice',
                        format: [{name: 'currency', value: 'EUR'}, {
                            name: 'cents',
                            value: [{name: 'show', value: false}, {name: 'allowed', value: false}]
                        }]
                    },
                    {
                        ref: 'creationDate',
                        format: [
                            {
                            name: 'time',
                            value: [{name: 'show', value: true}, {
                                name: 'timeFormat',
                                value: 'HH:MM:SS:mmm'
                            }, {name: 'hourFormat', value: '24'}]
                        },
                            {
                                name: 'date',
                                value: [{name: 'show', value: true}, {name: 'dateFormat', value: 'dd/mm/yyyy'}]
                            }]
                    }
                ]
            }
        },
        /*        {
                    type:'prompt',
                    ref:'deleteProductPrompt',
                    configuration:{
                        action:'delete',
                        concept:'product',
                        header: 'Verwijderen product',
                        question:'Bent u zeker dat u dit product definitief wil verwijderen?',
                        buttons:{yes:'Ja',no:'nee'}
                    }
                },*/
    ],
})

async function startApolloServer() {
    const httpServer = http.createServer(appserver);
    // todo adapt return value van createApp naar ApolloServerExpressConfig
    const server = new ApolloServer(app.generate());
    await server.start()
    await server.applyMiddleware({app: appserver})
    await mongoose.connect(`mongodb+srv://${process.env.MONGO_ATLAS_USER}:` + process.env.MONGO_ATLAS_PW + `${process.env.MONGO_ATLAS_DB}`,
        {
            useNewUrlParser: true,
            useCreateIndex: true,
            autoIndex: true, //this is the code I added that solved it all: should be false in production!!
            keepAlive: true,
            poolSize: 10,
            bufferMaxEntries: 0,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, skip trying IPv6
            useFindAndModify: false,
            useUnifiedTopology: true
        }
        , (err) => {
            if (err)
                console.log(err)
        })
    await new Promise(resolve => httpServer.listen({port: port}, resolve));
    console.log(`🚀 Server ready at http://localhost:5000${server.graphqlPath}`);
    //return { server, app };
}

startApolloServer().then(r => {
    if (r) console.log(r)
})

