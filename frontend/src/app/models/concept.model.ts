import {PropModel} from "./prop.model";

export class ConceptModel {
  constructor(
    public concept:
      {
        label:{
          plural:string,
          singular:string
        },
        ref:{
          plural:string,
          singular:string
        }
      },
    public props:PropModel[]
  ) {

  }
}
