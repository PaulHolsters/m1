module.exports = class GeneralFunctions{
    static capitalizeFirst(word){
        if (typeof word === 'string')
            return word[0].toUpperCase() + word.substr(1)
        else return word
    }

}