import {ActionModel} from "./action.model";

export class NavigationModel {
  constructor(
    public label: string,
    public icon: string|undefined,
    public rang:number,
    public routerLink:string|undefined
  ) {

  }
}
