const GeneralFunctions = require("./General.Functions");

module.exports = class MoulditConstraints{

    static validate = {
        unique:this.unique,
        uniqueList:this.uniqueList,
        uniqueInList:this.uniqueInList,
        uniqueToList:this.uniqueToList,
        checkChildId:this.checkChildId,
        capitals:this.capitals,
        maxDecimals:this.maxDecimals,
    }

    static capitals(arr,val){
        val.forEach(func=>{
            if(func === 'first'){
                return function (v){
                    return v.substr(0,1).toUpperCase()===v.substr(0,1)
                }
            } else if(func === 'word'){

            } else if(func === 'all'){
                return function (v){
                    return v.toUpperCase()===v
                }
            } else if(func === 'none'){
                return function (v){
                    return v.toLowerCase()===v
                }
            } else if(GeneralFunctions.getTypeOf(func) === 'array' && func.length > 0){
                if(this.#isNumericArray(func)){
                    return function(v){
                        for (let i=0;i<func.length;i++){
                            if(v[func[i]].toUpperCase()!==v[func[i]]) return false
                        }
                        return true
                    }
                } else{
                    func.forEach(value=>{
                        return this.capitals(value)
                    })
                }
            }
        })
    }

    static maxDecimals(arr,val){
        return function (v){
            if(typeof v !== 'number') return false
            return (v - Math.trunc(v)).toString().length<=val+2
        }
    }

    static unique(arr,val) {
        if(val){
            return async function (v) {
                if (this._update) {
                    let docs = await arr[3].find().where(arr[2].ref).equals(v).exec()
                    docs = docs.filter(doc => {
                        return doc._id.toString() !== this._conditions._id.toString()
                    })
                    return docs.length === 0
                } else {
                    return (await arr[3].find().where(arr[2].ref).equals(v).countDocuments()) === 0
                }
            }
        }
    }

    static uniqueList(arr,val) {
        if(val){
            return async function (v) {
                if (this._update) {
                    let docs = await arr[3].find().where(arr[1].name.ref.plural).all(v).size(v.length).exec()
                    docs = docs.filter(doc => {
                        return doc._id.toString() !== this._conditions._id.toString()
                    })
                    return docs.length === 0
                } else {
                    return (await arr[3].find().where(arr[1].name.ref.plural).all(v).size(v.length)).length === 0
                }
            }
        }
    }

    static uniqueInList(arr,val) {
        if(val){
            return async function (v) {
                let ok = true
                v.forEach(el1 => {
                    let count = 0
                    v.forEach(el2 => {
                        if (el1.equals(el2)) count++
                    })
                    if (count > 1 && ok) ok = false
                })
                return ok
            }
        }
    }

    static uniqueToList(arr,val) {
        if(val){
            return async function (v) {
                let docs
                if (this._update) {
                    docs = await arr[3].find().where('_id').ne(this._conditions._id).select(arr[1].name.ref.plural).exec()

                } else {
                    docs = await arr[3].find().select(arr[2].name.ref.plural).exec()
                }
                return docs.find(
                    doc => {
                        return doc[arr[1].name.ref.plural].find(elem => {
                            return v.includes(elem)
                        }) !== undefined
                    }
                ) === undefined
            }
        }
    }

    static checkChildId(arr,val) {
        if(val){
            return async function (v) {
                const arr = await arr[3].find({}, {_id: 1}).exec()
                let ok = true
                v.forEach(id => {
                    let includes = false
                    arr.forEach(obj => {
                        if (obj._id.toString() === id.toString()) includes = true
                    })
                    if (!includes) ok = false
                })
                return ok
            }
        }
    }

/********************************************   private methods  *************************************************/
    static #isNumericArray(arr){
        for (let i=0;i<arr.length;i++){
            if(typeof arr[i] !== 'number') return false
        }
        return true
    }


}