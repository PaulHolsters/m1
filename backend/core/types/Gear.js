
// een type is een concept met slechts 1 attribuut
// daarom heeft een type een methode die 1 primitief datatype teruggeeft en dezelfde naam heeft als de klasse
// de ref en label zijn gelijk aan de klasse naam, maar dan beginnend met een kleine letter
// van de laatste regel kan afgeweken worden door een getRef en getLabel methode te voorzien
module.exports = class Model{
    // de referentie en het label zijn per definitie gelijk aan de klassenaam maar dan met kleine letter
    static get name(){
        // todo voeg nog letters als ö é etc. toe
// [-*/\\:\[\]!()#@%'"&]   match:[/[a-z]*[0-9]*/,'U gebruikt verkeerde tekens'], match:[/[A-Z]*[a-z]*/,'U gebruikt verkeerde tekens']
        // todo een goeie match validation vinden
        const constraints = {unique:true,required:true,trim:true}
        const type = new Map()
        return type.set(String, constraints)
    }

    static get UIControl(){
        return 'text'
    }

    // todo deze functie beschikbaar stellen voor gewone props ipv alleen voor model => in concept zetten
    static capitalized(value){
        // dit is een check Function (mongoose custom validator)
        if(value==='first')
        return function (v){
            return v.substr(0,1).toUpperCase()===v.substr(0,1)
        }
        return function (v){
            return v.toUpperCase()===v
        }
    }
}

// todo zorg ervoor dat je type's kan bijmaken gebaseerd op niet primitieve types als onderhavig type ?
