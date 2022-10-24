import {ValueModel} from "./value.model";


export class FormatModel {
  constructor(
    public ref: string,
    public format:{
      name:string,
      valueS:string,
      valueB:boolean,
      valueI:number,
      valueF:ValueModel[],
      value:boolean|string|number|ValueModel
    }[]
  ) {

  }
}
