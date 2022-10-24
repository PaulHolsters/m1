

export class ValueModel {
  constructor(
    public name: string,
    public valueS:string,
    public valueB:boolean,
    public valueI:number,
    public value: boolean|string|number|ValueModel[]
  ) {

  }
}
