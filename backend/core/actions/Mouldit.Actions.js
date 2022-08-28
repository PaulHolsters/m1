const Create = require('./CRUD/Create')
const Get = require('./CRUD/Get')
const Edit = require('./CRUD/Edit')
const Delete = require('./CRUD/Delete')
const GetDetailsOf = require('./CRUD/GetDetailsOf')

module.exports = {
    Create:{
        plurality: Create.plurality,
        returnType: Create.returnType,
    },
    Get:{
        plurality: Get.plurality,
        returnType: Get.returnType,
    },
    Edit:{
        plurality: Edit.plurality,
        returnType: Edit.returnType,
    },
    Delete:{
        plurality: Delete.plurality,
        returnType: Delete.returnType,
    },
    GetDetailsOf:{
        plurality: GetDetailsOf.plurality,
        returnType: GetDetailsOf.returnType
    }
}
