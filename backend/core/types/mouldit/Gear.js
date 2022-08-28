module.exports = class Gear{

    static get gear(){
        const constraints = {unique:true,required:true,trim:true}
        const type = new Map()
        return type.set(String, constraints)
    }

    static get UIControl(){
        return 'text'
    }

    static get ref(){
        return 'gearName'
    }
}

