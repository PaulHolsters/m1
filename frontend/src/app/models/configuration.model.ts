export class ConfigurationModel {
  constructor(
     public __typename: string,
     public columns: string[] | null,
     public validation: string | null,
     public cards:
       {
         label: string | null,
         ref: string,
         routerLink: string | null,
         __typename?: string }[] | null,
     public actionMenu: {header:string,label: string, ref: string,routerLink: string|null,target: string|null}[] | null,
     public title: string | null,
     public label: string| null,
     public header:string|null,
     public question:string|null
  ) {

  }
}
