import {ConceptModel} from "./concept.model";
import {ConstraintsModel} from "./constraints.model";

export class PropModel {
  constructor(
    public concept:ConceptModel,
    public label:string,
    public type:string,
    public constraints:ConstraintsModel
  ) {

  }
}
