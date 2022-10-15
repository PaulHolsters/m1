import {ActionModel} from "./action.model";

export class ConfirmModel {
  constructor(
    public header:string,
    public action:ActionModel[],
    public message?:string, // default = Are you sure you want to proceed?
    public acceptText?:string, // default = Yes
    public rejectText?:string // default = No

  ) {

  }
}
