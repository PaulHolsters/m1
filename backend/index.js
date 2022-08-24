'use strict'
const http = require("http")
const port = Number(process.env.PORT || 5000)
const express = require('express')
const mongoose = require('mongoose')
const appserver = express()
const {ApolloServer} = require('apollo-server-express')

const Gear = require('./core/types/Gear')
const Price = require('./core/types/Price')

const App = require("./core/App.js")

const app = new App( {
    concepts: [
        {
            name:{ref:{singular:'product',plural:'products'},label:{singular:'product',plural:'products'}},
            attr:[
                {
                    type:Gear.name,
                    label:'product',
                    constraints:{
                        capitals: ['first']
                    }
                },
                {
                    type:Price,
                    label:'basis prijs',
                    ref:'basePrice',
                    // constraints bepalen ENKEL welke data toegelaten is in de database en deels in de frontend
                    // niet HOE validatie moet gebeuren en slechts deels WELKE validatie in een front end formulier
                    constraints:{
                        // elke constraint resulteert in een bepaalde validatie, vandaar dat currency 'EUR' hier niet thuishoort!
                        required: true,
                        cents: false // indien false dan enkel gehele bedragen toegestaan zonder bv. eurocent
                    }
                },
                {
                    type:Date,
                    label:'aangemaakt op',
                    ref:'creationDate',
                    default: new Date() // ook hier het formaat wordt bepaald in de frontend component, in de backend is dit steeds een datetime
                }
            ]
        }
    ],
    actions:[
        {
            subject:'user',
            name:'create',
            concepts:[
                'product'
            ]
        },
        {
            subject:'user',
            name:'delete',
            concepts:[
                'product'
            ]
        },
        {
            subject:'user',
            name:'edit',
            concepts:[
                'product'
            ]
        },
        {
            subject:'user',
            name:'get',
            concepts:[
                'product'
            ]
        },
        {
            subject:'user',
            name:'getDetailsOf',
            concepts:[
                'product'
            ]
        }
    ],
    users:[],
    components:[
        {
            type:'menu', ref:'menu', configuration:{
                menuItems:[
                    {label: 'Producten', component:'productCards'}
                ]
            }
        },
        {
            type:'cards', ref:'productCards', configuration:{
                cards:[
                    {label: 'Nieuw product', component:'newProductForm'},
                    {label: 'Overzicht producten', component:'productsOverview'},
                ]
            }
        },
        {
            type:'form', ref:'newProductForm', configuration:{
                action:'create',
                concept:'product',
                formats: [
                    {ref: 'basePrice',format:'EUR'},{ref: 'creationDate',format:'datetime'}
                ],
                validation:'onsubmit'
            }
        },
        {
            type:'overview', ref:'productsOverview', configuration:{
                action:'get',
                concept:'product',
                actionMenu:[
                    {label:'aanpassen',component:'editProductForm'},
                    {label:'bekijken',component:'detailsProductSummary'},
                    {label:'verwijderen',component: 'deleteProductPrompt'}
                ]
            }
        },
        {
            type:'form', ref:'editProductForm', configuration:{
                action:'edit',
                concept:'product',
                formats: [
                    {ref: 'basePrice',format:'EUR'},{ref: 'creationDate',format:'datetime'}
                ],
                validation:'onsubmit'
            }
        },
        {
            type:'summary', ref:'detailsProductSummary', configuration:{
                action:'getDetailsOf',
                concept:'product'
            }
        },
        {
            type:'prompt', ref:'deleteProductPrompt', configuration:{
                action:'delete',
                concept:'product',
                header: 'Verwijderen product',
                message:'Bent u zeker dat u dit product definitief wil verwijderen?'
            }
        },
    ],
})


async function startApolloServer() {
    const httpServer = http.createServer(appserver);
    // todo adapt return value van createApp naar ApolloServerExpressConfig
    const server = new ApolloServer(app.generate());
    await server.start()
    await server.applyMiddleware({app:appserver})
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
            if(err)
                console.log(err)
        })
    await new Promise(resolve => httpServer.listen({port: port}, resolve));
    console.log(`🚀 Server ready at http://localhost:5000${server.graphqlPath}`);
    //return { server, app };
}

startApolloServer().then(r => {if(r)console.log(r)})

