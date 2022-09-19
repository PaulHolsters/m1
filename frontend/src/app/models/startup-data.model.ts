import {ComponentModel} from "./component.model";
import {RouteModel} from "./route.model";
import {MenuModel} from "./menu.model";
import {Route} from "@angular/router";

export class StartupDataModel {
  constructor(
    public components: ComponentModel[],
    public currentComponent: string,
    public menu: MenuModel[],
    public routesIn?: RouteModel[],
    public routes?: Route[],
  ) {

  }
}
