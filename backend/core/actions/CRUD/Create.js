module.exports = class Create{
    // plurality betekent dat het endpoint wat betreft het concept in deze vorm (plural/singular) verschijnt
    static get plurality(){
        return 'singular'
    }

    static get returnType(){
        return 'object'
    }

    static get components(){
        return [
            'form'
        ]
    }
}