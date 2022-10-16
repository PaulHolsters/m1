import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfigService} from "../initializer/config.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Apollo, gql} from "apollo-angular";
import {map} from "rxjs/operators";
import {Subscription} from "rxjs";
import {ComponentModel} from "../models/component.model";
import {ConfirmationService} from "primeng/api";
import {PromptModel} from "../models/prompt.model";
import {ConfirmModel} from "../models/confirm.model";

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
  actionMenuItems: any[] = []
  activatedActionsMenu: string | undefined
  posX:number|undefined
  posY:number|undefined
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
  columns: { ref: string, label: string }[]
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

  ngOnInit(): void {
    this.startupSubscription = this.config.startupData$.pipe(
    ).subscribe(async startupData => {
      if (startupData && startupData.routes && startupData.components) {
        // ophalen data component
        this.route.url.subscribe(segments => {
          this.currentPath = segments[0] + '/' + segments[1]
        })
        const compRef = this.config.getRoutes().find(route => {
          return route.path === this.currentPath
        })?.componentName
        this.component = startupData.components.find(comp => {
          return comp.ref === compRef
        })
        // invullen component met de data
        // controleren of het een tabel is mét of zonder actie menu
        if (this.component?.configuration.actionMenu !== null) {
          this.component?.configuration.actionMenu.forEach(action => {
            if (action.dialogRef !== null) {
              const dialog = startupData.components.find(comp => {
                return comp.ref === action.dialogRef
              })
              if (dialog && dialog.subtype === 'confirm' && dialog.configuration.action) {
                this.actionMenuItems.push({
                  label: action.label,
                  icon: action.icon,
                  type: 'dialog',
                  subtype: 'confirm',
                  header: dialog.configuration.header || '',
                  message: dialog.configuration.message || '',
                  // hier zal tijdens de uitvoering van de actie het placeholder ID door een echt ID vervangen moeten worden
                  action: dialog.configuration.action,
                  acceptText: dialog.configuration?.buttons && dialog.configuration?.buttons?.length > 0 ? dialog.configuration?.buttons[0].text : undefined,
                  rejectText: dialog.configuration?.buttons && dialog.configuration?.buttons?.length > 1 ? dialog.configuration?.buttons[1].text : undefined
                })
              } else {
                // todo andere dialoogvensters zoals alert of ...

              }
            } else {
              this.actionMenuItems.push({
                label: action.label,
                icon: action.icon,
                type: 'navigation',
                routerLink: action.routerLink
              })
            }
          })
        }
        if (this.component?.configuration.columns) {
          this.columns = this.component?.configuration.columns
        }
      }
    }, err => {
      console.log(err)
    })
    if (this.component?.configuration.action && this.component?.configuration.action.length > 0) {
      this.querySubscription = this.apollo
        .watchQuery<{ data: {}[] }>({
          query: gql`
            ${this.component.configuration.action[0].value}
        `,
        })
        .valueChanges.pipe(map((result) => result.data)).subscribe(res => {
          //console.log('items van de overview',res)
          this.resourcesAll = Object.values(res)[0].map(val => {
            const valCopy = Object.create(val)
            const resource: {
              resource: {
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
                return col.ref === prop
              })?.label
              resource.resource.push(resourceItem)
            })
            return resource
          })
          this.resources = this.resourcesAll.slice(0, this.numberOfRows)
          if (this.component?.configuration.actionMenu !== null)
            this.rerenderActionMenus()
        })
    }

  }

  /*
  *         return {
          id: res.id, items: [
            {
              label: 'Verwijderen', icon: 'pi pi-fw pi-trash',
              command: () => {
                this.confirmationService.confirm({
                    message: this.confirmDialogs[0].message,
                    accept: () => {
                      const actionStr = this.confirmDialogs[0].action[0].value.replace('ID','"'+res.id+'"')
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
  * */

  getConfirmDialogs(): ConfirmModel[] {
    return this.actionMenuItems.filter(item => {
      return item.type === 'dialog' && item.subtype === 'confirm'
    }).map(confirmD => {
      delete confirmD.type
      delete confirmD.subscribe
      return confirmD
    })
  }

  getIconName(icon: string) {
    switch (icon) {
      case 'trash':
        return 'pi pi-fw pi-trash'
      default:
        return ''
    }
  }

  getCommand(item:any){
    // todo finish dialog
    if (item.type === 'dialog'){
      return () => {
        this.confirmationService.confirm({
            message: "",
            accept: () => {
              const actionStr =''// this.confirmDialogs[0].action[0].value.replace('ID', '"' + res.id + '"')
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
    } else{
      return ()=>{
        this.router.navigate([this.actionMenuItems.find(menu=>{
          return menu.label === item.label
        }).routerLink])
      }
    }
  }

  rerenderActionMenus() {
    this.resourcesMenuHandler = this.resources.map(res => {
      const items: any[] = []
      this.actionMenuItems.forEach(item => {
        const actionIcon = item.icon === undefined ? null : this.getIconName(item.icon)
        items.push(
          {
            label: item.label, icon: actionIcon,
            command: this.getCommand(item)
          })
      })
      return {
        id: res.id,
        items: items
      }
    })
  }

  reloadPage() {
    if (this.component?.configuration?.action && this.component?.configuration?.action.length > 0) {
      this.querySubscription = this.apollo
        .watchQuery<{ data: {}[] }>({
          query: gql`
            ${this.component?.configuration?.action[0].value}
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
                return col.ref === prop
              })?.label
              resource.resource.push(resourceItem)
            })
            return resource
          })
          this.resources = this.resourcesAll.slice(0, this.numberOfRows)
          this.rerenderActionMenus()
        })
    }

  }

  isMenu(id: string): boolean {
    return this.activatedActionsMenu === id;
  }

  isIcon(id: string): boolean {
    return this.activatedActionsMenu !== id;
  }

  showMenu(id: string, event:MouseEvent) {
    this.posX = event.x + 4
    this.posY = event.y - 6
    this.activatedActionsMenu = id
  }

  hideMenu() {
    this.activatedActionsMenu = undefined
    this.posY = undefined
    this.posY  = undefined
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
