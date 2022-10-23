import {ConstraintsModel} from "./constraints.model";

export class ControlModel {
  constructor(
    public __typename: string,
    public label: string,
    public ref:string,
    public type: string,
    public constraints:ConstraintsModel
  ) {

  }
}
