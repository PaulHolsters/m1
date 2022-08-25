module.exports = class Price {
    static get price(){
        const constraints = {min:0}
        const type = new Map()
        return type.set(Number, constraints)
    }

    static get UIControl(){
        return 'money'
    }

    static currency(currency){
        switch (currency){
            case 'EUR':
                return function (v){
                    return (v - Math.trunc(v)).toString().length<5
                }
        }
    }

    static cents(config){
        if(config.allowed===false){
            return function (v) {
                return Math.trunc(v) === v
            }
        }
    }

    static isInt(constraints){
        return constraints.hasOwnProperty('cents') && constraints.cents.allowed === false
    }
}
