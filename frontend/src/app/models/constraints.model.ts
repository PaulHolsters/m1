export class ConstraintsModel {
  constructor(
      public required?: boolean|null,
      public currency?: string|null,
      public cents?: {
        allowed:boolean,
        show:boolean
      }|null,
      public capitalized?:string|null,
      public uniqueList?:boolean|null,
      public uniqueInList?:boolean|null,
      public uniqueToList?:boolean|null,
      public min?:number|null,
      public unique?:boolean|null,
      public trim?:boolean|null
  ) {

  }
}
