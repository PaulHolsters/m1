

export class ValueModel {
  constructor(
    public name: string,
    public value: boolean|string|number|ValueModel[]
  ) {

  }
}
