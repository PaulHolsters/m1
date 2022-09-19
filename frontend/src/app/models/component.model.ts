import {ConfigurationModel} from "./configuration.model";
import {ConceptModel} from "./concept.model";

export class ComponentModel {
  constructor(
    public configuration: ConfigurationModel,
    public ref: string,
    public type: string,
    public routerLink: string | null,
    public columns: {name:string,value:string}[],
    public concept: ConceptModel,
    public action?:string,
    public __typename?: string
  ) {

  }
}
