const GeneralFunctions = require("./General.Functions");

module.exports = class MoulditConstraints{

    static capitals(v){
        v.forEach(func=>{
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

    static #isNumericArray(arr){
        for (let i=0;i<arr.length;i++){
            if(typeof arr[i] !== 'number') return false
        }
        return true
    }
}