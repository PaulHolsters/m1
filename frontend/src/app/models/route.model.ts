import {Component} from "@angular/core";

export class RouteModel {
  constructor(
    public path: string,
    public component?:object,
    public pathMatch?: string,
    public redirectTo?: string,
    public componentName?: string,
    public __typename?: string
  ) {

  }
}
