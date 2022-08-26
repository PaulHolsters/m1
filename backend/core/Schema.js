
module.exports = class DocumentObj {
/********************************************   attributes  ******************************************************/
    schema
    constructor(attr,app) {
        this.schema = {}
        for (let i = 0; i < attr.length; i++) {
            /*
            er zijn 5 types attributen:
            - MT: Mongoose types
            - BT: built-in types of Mouldit types
            - CT: custom types: dit zijn types gedefinieerd door de gebruiker van Mouldit
            - CCT: child concept types: dit zijn geen echte types
            - LCT: list concept types: dit zijn geen echte types => deze constructor opnieuw oproepen
                =>
                    in het mongoose schema komen CCT en LCT als een mongoose Id met een referentie naar het child schema.
                    Dit zijn schema wordt op opgesteld op het moment dat onderhavige constructorwordt opgeroepen voor dit
                    childconcept in de constructor van de App klasse

            Elk type resulteert in een specifiek type in het mongoose schema van de desbetreffende resource.
            Voor CCT en LCT zijn dit schema's, voor MT is dit gewoon een binnen Mongoose gekend type.
            Voor BT en CT zijn dit eveneens binnen Mongoose bekende types. Het verschil met een MT is dat
            BT en CT in feite MT's zijn met extra constraints.

            todo
                voorzien van CT

            todo
                In een latere fase zou ik nog samengestelde types willen hebben. Dit zijn types gebaseerd op een concept.
                Zij bestaan dus uit meerdere attributen, die elk met een Mongoose type geassocieerd kunnen worden. Een voorbeeld hiervan is
                een type Gear dat behalve een naam nog andere attributen heeft. Ik moet dan wel nog uitzoeken hoe je deze
                andere attributen zet als gebruiker indien je van de standaard waarde zou willen afwijken.
            */

        }
    }

/********************************************   getters and setters  *********************************************/
    get schema(){
        return this.schema
    }
}