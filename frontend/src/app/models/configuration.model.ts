import {ControlModel} from "./control.model";
import {ActionModel} from "./action.model";
import {FormatModel} from "./format.model";
import {ButtonModel} from "./button.model";
import {ActionMenuItemModel} from "./action-menu-item.model";
import {ToastModel} from "./toast.model";

export class ConfigurationModel {
  constructor(
     public __typename: string,
     public columns: {ref:string,label:string}[],
     public controls:ControlModel[],
     public validation: string,
     public cards:
       {
         ref: string,
         label: string,
         routerLink: string,
         __typename: string }[],
     public actionMenu: ActionMenuItemModel[],
     public title: string,
     public label: string,
     public header:string,
     public message:string,
     public buttons:ButtonModel[],
     public action:ActionModel[],
     public formats:FormatModel[],
     public icon: string,
     public toast:ToastModel
  ) {

  }
}
