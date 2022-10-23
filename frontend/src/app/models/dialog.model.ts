import {ActionModel} from "./action.model";
import {ToastModel} from "./toast.model";

export class DialogModel {
  constructor(
    public label: string,
    public icon: string|undefined,
    public rang:number,
    public header:string,
    public action:ActionModel[],
    public toast?:ToastModel,
    public message?:string, // default = Are you sure you want to proceed?
    public acceptText?:string, // default = Yes
    public rejectText?:string // default = No

  ) {

  }
}
