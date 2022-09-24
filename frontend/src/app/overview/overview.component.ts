import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfigService} from "../initializer/config.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Apollo, gql} from "apollo-angular";
import {map} from "rxjs/operators";
import {Subscription} from "rxjs";
import {ComponentModel} from "../models/component.model";
import {ConfirmationService} from "primeng/api";

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, OnDestroy {
  querySubscription: Subscription | undefined
  startupSubscription: Subscription | undefined
  numberOfRows: number | undefined
  resourcesAll: any
  header: string | undefined
  prompts: { header: string, question: string, action: string }[] = []
  activatedActionsMenu: string | undefined
  resources: {
    resource:
      {
        property: string,
        type: string,
        value: any,
        column: string | undefined
      }[],
    id: string
  }[]
  resourcesMenuHandler: { id: string, items: any }[]
  currentPath: string | undefined
  columns: { name: string, value: string }[]
  component: ComponentModel | undefined

  constructor(private config: ConfigService,
              private route: ActivatedRoute,
              private router: Router,
              private apollo: Apollo,
              private confirmationService: ConfirmationService) {
    this.columns = []
    this.resources = []
    this.numberOfRows = 10
    this.resourcesMenuHandler = []
  }

  /*
  *     this.confirmationService.confirm({
      message: 'Het verwijderen is definitief. Doorgaan?',
      accept: ()=>{
        this.header = undefined
        this.dataService.deleteQuotationSpecification(id).subscribe(res=>{
          // inform parent to rerender this component
          this.source.splice(this.source.findIndex(opt=>{
            return opt._id===id
          }),1)
          this.listChanged.emit({source:this.source,target:this.target})
          this.messageService.add({severity:'success', summary: 'Offerte specificatie verwijderd', life:3000});
        })
      },
      reject: ()=>{
        this.header = undefined
      }
    })
  *
  * */

  ngOnInit(): void {
    this.startupSubscription = this.config.startupData$.pipe(
    ).subscribe(async startupData => {
      if (startupData && startupData.routes && startupData.components) {
        this.route.url.subscribe(segments => {
          this.currentPath = segments[0] + '/' + segments[1]
        })
        const compRef = this.config.getRoutes().find(route => {
          return route.path.substr(1) === this.currentPath
        })?.componentName
        this.component = startupData.components.find(comp => {
          return comp.ref === compRef
        })
        if (this.component?.configuration.actionMenu !== null) {
          this.component?.configuration.actionMenu.forEach(item => {
            if (item.target !== null) {
              const target = startupData.components.find(comp => {
                return comp.ref === item.target
              })
              if (target?.type === 'prompt') {
                this.prompts.push({
                  header: target.configuration.header || '',
                  question: target.configuration.question || '',
                  action: target.action || ''
                })
              }
            }
          })
        }
        if (this.component?.columns) {
          this.columns = this.component?.columns
        }
      }
    }, err => {
      console.log(err)
    })
    this.querySubscription = this.apollo
      .watchQuery<{ data: {}[] }>({
        query: gql`
            ${this.component?.action}
        `,
      })
      .valueChanges.pipe(map((result) => result.data)).subscribe(res => {
        this.resourcesAll = Object.values(res)[0].map(val => {
          const valCopy = Object.create(val)
          const resource: {
            resource:
              {
                property: string,
                type: string,
                value: any,
                column: string | undefined
              }[],
            id: string
          } = {id: valCopy.id.toString(), resource: []}
          Object.getOwnPropertyNames(val).filter(prop => {
            return prop !== '__typename' && prop !== 'id'
          }).forEach(prop => {
            const resourceItem: {
              property: string,
              type: string,
              value: any,
              column: string | undefined
            } = {property: '', type: '', value: undefined, column: ''}
            resourceItem.property = prop
            resourceItem.type = this.getType(prop)
            resourceItem.value = valCopy[prop]
            resourceItem.column = this.columns.find(col => {
              return col.name === prop
            })?.value
            resource.resource.push(resourceItem)
          })
          return resource
        })
        this.resources = this.resourcesAll.slice(0, this.numberOfRows)
        this.rerenderActionMenus()
      })
  }

  rerenderActionMenus() {
    this.resourcesMenuHandler = this.resources.map(res => {
      return {
        id: res.id, items: [
          {
            label: 'Verwijderen', icon: 'pi pi-fw pi-trash',
            command: () => {
              this.confirmationService.confirm({
                  message: this.prompts[0].question,
                  accept: () => {
                    const actionStr = this.prompts[0].action.replace('ID','"'+res.id+'"')
                    this.apollo
                      .mutate({
                        mutation: gql`mutation${actionStr}`
                      }).subscribe(response => {
                      this.reloadPage()
                    })
                    this.hideMenu()
                  }
                }
              )
            }
          }]
      }
    })
  }

  reloadPage(){
    this.querySubscription = this.apollo
      .watchQuery<{ data: {}[] }>({
        query: gql`
            ${this.component?.action}
        `,
      })
      .valueChanges.pipe(map((result) => result.data)).subscribe(res => {
        this.resourcesAll = Object.values(res)[0].map(val => {
          const valCopy = Object.create(val)
          const resource: {
            resource:
              {
                property: string,
                type: string,
                value: any,
                column: string | undefined
              }[],
            id: string
          } = {id: valCopy.id.toString(), resource: []}
          Object.getOwnPropertyNames(val).filter(prop => {
            return prop !== '__typename' && prop !== 'id'
          }).forEach(prop => {
            const resourceItem: {
              property: string,
              type: string,
              value: any,
              column: string | undefined
            } = {property: '', type: '', value: undefined, column: ''}
            resourceItem.property = prop
            resourceItem.type = this.getType(prop)
            resourceItem.value = valCopy[prop]
            resourceItem.column = this.columns.find(col => {
              return col.name === prop
            })?.value
            resource.resource.push(resourceItem)
          })
          return resource
        })
        this.resources = this.resourcesAll.slice(0, this.numberOfRows)
        this.rerenderActionMenus()
      })
  }

  isMenu(id: string): boolean {
    return this.activatedActionsMenu === id;
  }

  isIcon(id: string): boolean {
    return this.activatedActionsMenu !== id;
  }

  showMenu(id: string) {
    this.activatedActionsMenu = id
  }

  hideMenu() {
    this.activatedActionsMenu = undefined
  }

  getItems(id: string) {
    return this.resourcesMenuHandler.find(handler => {
      return handler.id === id
    })?.items || []
  }

  paginate(event: any) {
    this.resources = this.resourcesAll.slice(event.page * event.rows, (event.page * event.rows + event.rows))
  }

  getType(propertyName: string) {
    return 'DEFAULT'
  }

  getResource(type: string, id: string, columnRef: string) {
    if (type === 'type') {
      return this.resources.find(ress => {
        return ress.id === id
      })?.resource.find(res => {
        return res.property === columnRef
      })?.type
    } else {
      return this.resources.find(ress => {
        return ress.id === id
      })?.resource.find(res => {
        return res.property === columnRef
      })?.value
    }
  }

  ngOnDestroy(): void {
    this.startupSubscription?.unsubscribe()
    this.querySubscription?.unsubscribe()
  }

}
