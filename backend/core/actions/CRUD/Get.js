module.exports = class Get{
    // plurality betekent dat het endpoint wat betreft het concept in deze vorm (plural/singular) verschijnt
    static get plurality(){
        return 'plural'
    }

    static get returnType(){
        return 'array'
    }

    static get components(){
        return [
            'overview', 'form'
        ]
    }
}
