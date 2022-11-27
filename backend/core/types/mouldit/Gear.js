const MoulditConstraints = require("../../Mouldit.Constraints");
module.exports = class Gear{

    static get gear(){
        const constraints = {required:true,trim:true,unique:true}
        const type = new Map()
        return type.set(String, constraints)
    }

    static get ref(){
        return 'gearName'
    }

    // dat dit zowel voor de components als de backend is is problematisch
    static get staticConstraints(){
        return [
            {function:'unique',value:MoulditConstraints.unique}
        ]
    }

}

