export class ConstraintsModel {
  constructor(
    public __typename?:string,
    public decimals?:number,
    public maxDecimals?:number,
    public required?:boolean,
    public min?:number,
    public trim?:boolean,
  ) {

  }
}
