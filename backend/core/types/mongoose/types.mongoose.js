const String = require('./String')
const Number = require('./Number')
const Date = require('./Date')
const Boolean = require('./Boolean')
const Map = require('./Map')
const Array = require('./Array')

module.exports = {
    String:{
        function:String.function,
        classname:String.classname
    },
    Number:{
        function:Number.function,
        classname:Number.classname
    },
    Date:{
        function:Date.function,
        classname:Date.classname
    },
    Boolean:{
        function:Boolean.function,
        classname:Boolean.classname
    },
    Map:{
        function:Map.function,
        classname:Map.classname
    },
    Array:{
        function:Array.function,
        classname:Array.classname
    },
}
