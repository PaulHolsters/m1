import { Injectable } from '@angular/core';
import {Apollo, gql} from "apollo-angular";
import {CardsComponent} from "../cards/cards.component";
import {OverviewComponent} from "../overview/overview.component";
import {FormComponent} from "../form/form.component";
import {HomeComponent} from "../home/home.component";
import {Route, Routes} from "@angular/router";
import {BehaviorSubject} from "rxjs";
import {filter} from "rxjs/operators";
import {StartupDataModel} from "../models/startup-data.model";
import {RouteModel} from "../models/route.model";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private startupData = new BehaviorSubject<StartupDataModel|null>(null)
  readonly startupData$ = this.startupData.asObservable().pipe(
    filter(data=>!!data),
  )

  private routes:RouteModel[] = []

  constructor(private apollo:Apollo) { }

  getRoutes(){
    return [...this.routes]
  }

  fetchConfig(){
    this.getStartupData().subscribe((result: any) => {
      console.log(result,'result incoming')
      this.routes = Array.from(result.data.getStartupData.routes)
      const components: any = Array.from(result.data.getStartupData.components)
      const routes: any = Array.from(result.data.getStartupData.routes)
      const menuItems: any = Array.from(result.data.getStartupData.menu)
      const currentComponent: any = result.data.getStartupData.currentComponent
      const startupData: StartupDataModel = {components: components, routesIn: routes, menu:menuItems, currentComponent:currentComponent}
      const getComponent = function (componentName: string) {
        const component = startupData.components.find((comp) => {
          return comp.ref === componentName
        })?.type
        switch (component) {
          case 'cards':
            return CardsComponent
          case 'overview':
            return OverviewComponent
          case 'form':
            return FormComponent
          default:
            return HomeComponent
        }
      }
      const appRoutes: Route[] = []
      startupData.routesIn?.forEach(route => {
        appRoutes.push({path: route.path, component: getComponent(route.component)})
      })
      const newRoutes: Route[] = []
      appRoutes.forEach(r => {
        const route = newRoutes.find(r2 => {
          return r2.path === r?.path?.substr(1)
        })
        if (!route) {
          r.path = r?.path?.substr(1)
          newRoutes.push(r)
        }
      })
      newRoutes.push({path: '',pathMatch: 'full',  component: HomeComponent})
      newRoutes.push({path: '**', redirectTo:''})
      this.startupData.next({routes:newRoutes, menu:startupData.menu,
        components:startupData.components, currentComponent:startupData.currentComponent})
    },(err)=>{
      console.log(err)
    })
  }

  private getStartupData(){
    // todo algoritme voorzien dat de
    //  string zich automatisch aanpast aan een diepere nesting van concepts
    return this.apollo
      .watchQuery({
        query: gql`
{
  getStartupData{
    components{
      type
      subtype
      ref
      configuration{
        menuItems{
          routerLink
          label
        }
        action{
          name
          value
        }
        buttons{
          name
        }
      validation
      columns{
        ref
        label
      }
      actionMenu{
        label
        routerLink
        component{
          __typename
        }
      }
      formats{
        ref
        format{
          ... on ValueB{
            name
            valueB:value
          }
          ... on ValueS{
            name
            valueS:value
          }
          ... on ValueI{
            name
            valueI:value
          }
          ... on ValueF{
            name
            valueF:value{
              ... on ValueB{
                name
                valueB:value
              }
              ... on ValueS{
                name
                valueS:value
              }
              ... on ValueI{
                name
                valueI:value
              }
            }
          }
        }
      }
      cards{
        routerLink
        label
      }
      controls{
        ref
        label
        type
        constraints{
          min
          maxDecimals
          decimals
          required
          trim
        }
      }
    }
  }
}
}
        `,
      })
      .valueChanges
  }
}
