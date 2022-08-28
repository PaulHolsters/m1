module.exports = class GetDetailsOf{
    static get plurality(){
        return 'singular'
    }

    static get returnType(){
        return 'object'
    }

    static get components(){
        return [
            'summary', 'form'
        ]
    }
}
