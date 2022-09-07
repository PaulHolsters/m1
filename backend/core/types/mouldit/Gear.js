const MoulditConstraints = require("../../Mouldit.Constraints");
module.exports = class Gear{

    static get gear(){
        const constraints = {required:true,trim:true}
        const type = new Map()
        return type.set(String, constraints)
    }

    static get ref(){
        return 'gearName'
    }

    static staticConstraints({arr:arr,val:val}){
        return [
            {function:'unique',params:[arr,val],value:MoulditConstraints.unique(arr,val)}
        ]
    }

}

