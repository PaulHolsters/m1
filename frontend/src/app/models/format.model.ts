import {ValueModel} from "./value.model";


export class FormatModel {
  constructor(
    public ref: string,
    public format:{
      name:string,
      value:boolean|string|number|ValueModel
    }[]
  ) {

  }
}
