import { Injectable } from '@angular/core';
import {Apollo, gql} from "apollo-angular";
import {CardsComponent} from "../cards/cards.component";
import {OverviewComponent} from "../overview/overview.component";
import {FormComponent} from "../form/form.component";
import {HomeComponent} from "../home/home.component";
import {Route} from "@angular/router";
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
    this.getStartupData().subscribe((result:any) => {
      let components: any[] = []
      let menuItems: any[] = []
      if(result?.data?.getStartupData?.components){
        components = Array.from(result.data.getStartupData.components)
        menuItems = [...components.find(comp=>{
          return comp.ref === 'menu'
        }).configuration.menuItems]
      }
      let currentComponent
      if(result?.data?.getStartupData?.currentComponent){
        currentComponent = result.data.getStartupData.currentComponent
      }
      const getComponent = function (componentName: string) {
        const component = components.find((comp) => {
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
      let routesIn:RouteModel[] = []
      let routesOut:Route[] = []
      if(result?.data?.getStartupData?.routes){
        routesIn = Array.from(result?.data?.getStartupData?.routes)
        this.routes = Array.from(result?.data?.getStartupData?.routes)
        // todo plaats alle routes in de juiste volgorde
        routesIn.forEach(el=>{
          if(el.componentName)
          el.component = getComponent(el.componentName)
        })
        routesIn.push({path: '', pathMatch: 'full',  component: HomeComponent})
        routesIn.push({path: '**', redirectTo:''})
        this.routes = [...routesIn]
        routesIn.forEach(r=>{
          const route = {path:''}
          Object.assign(route,{path:r.path})
          if(r.component) Object.assign(route,{component:r.component})
          if(r.redirectTo !== undefined) Object.assign(route,{redirectTo:r.redirectTo})
          if(r.pathMatch) Object.assign(route,{pathMatch:r.pathMatch})
          routesOut.push(route)
        })
      }
      this.startupData.next({routes:routesOut, menu:menuItems,
        components:components, currentComponent:currentComponent})
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
    routes{
      path
      componentName
    }
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
        toast{
          summary
          severity
          detail
        }
        buttons{
          name
          text
        }
        validation
        columns{
          ref
          label
        }
        actionMenu{
          label
          routerLink
          dialogRef
          icon
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
          ... on SValue{
            name
            sValue:value
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
          ... on SValue{
            name
            sValue:value
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
      message
      header
    }
  }
}
}
        `,
      })
      .valueChanges
  }
}
