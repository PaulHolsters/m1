import {ConfigurationModel} from "./configuration.model";

export class ComponentModel {
  constructor(
    public configuration: ConfigurationModel,
    public ref: string,
    public type: string,
    public route: string | null,
    public routerLink?: string,
    public subtype?: string,
    public __typename?: string
  ) {

  }
}
/*
*         type Component{
            type: String
            subtype:String
            route:String
            ref: String
            configuration: Configuration
        }
* */
