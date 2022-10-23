import {Component, OnDestroy, OnInit} from '@angular/core';
import {ConfigService} from "../initializer/config.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Apollo, gql} from "apollo-angular";
import {map} from "rxjs/operators";
import {Subscription} from "rxjs";
import {ComponentModel} from "../models/component.model";
import {ConfirmationService, MessageService} from "primeng/api";
import {NavigationModel} from "../models/navigation.model";
import {DialogModel} from "../models/dialog.model";
import {ToastModel} from "../models/toast.model";

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
  toasts:ToastModel[]
  confirmDialogs:DialogModel[]
  navigations: NavigationModel[]
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
              private confirmationService: ConfirmationService,
              private messageService: MessageService) {
    this.columns = []
    this.resources = []
    this.numberOfRows = 10
    this.resourcesMenuHandler = []
    this.confirmDialogs = []
    this.navigations = []
    this.toasts = []
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
        if (this.component?.configuration.actionMenu) {
          for (let i=0;i<this.component?.configuration.actionMenu.length;i++){
            if (this.component?.configuration.actionMenu[i].dialogRef !== null) {
              const dialog = startupData.components.find(comp => {
                return comp.ref === this.component?.configuration.actionMenu[i].dialogRef
              })
              if (dialog && dialog.subtype === 'confirm' && dialog.configuration.action) {
                this.confirmDialogs.push({
                  label: this.component?.configuration.actionMenu[i].label,
                  icon: this.component?.configuration.actionMenu[i].icon,
                  rang:i,
                  header: dialog.configuration.header || '',
                  message: dialog.configuration.message || '',
                  action: dialog.configuration.action,
                  toast:dialog.configuration.toast,
                  acceptText: dialog.configuration?.buttons && dialog.configuration?.buttons?.length > 0 ? dialog.configuration?.buttons[0].text : undefined,
                  rejectText: dialog.configuration?.buttons && dialog.configuration?.buttons?.length > 1 ? dialog.configuration?.buttons[1].text : undefined
                })
              } else {
                // todo andere dialoogvensters zoals alert of ...

              }
            } else {
              this.navigations.push({
                label: this.component?.configuration.actionMenu[i].label,
                icon: this.component?.configuration.actionMenu[i].icon,
                routerLink: this.component?.configuration.actionMenu[i].routerLink,
                rang:i
              })
            }
          }

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

  // todo use yield to show it in the correct order
  rerenderActionMenus() {
    this.resourcesMenuHandler = this.resources.map(res => {
      const items: any[] = []
      this.navigations.forEach(nav=>{
        const actionIcon = nav.icon === undefined ? null : this.getIconName(nav.icon)
        items.push(
          {
            label: nav.label,
            icon: actionIcon,
            command: ()=>{
              this.router.navigate([nav.routerLink])
            }
          })
      })
      this.confirmDialogs.forEach(confirmD => {
        const actionStr = confirmD.action[0].value.replace('ID',  res.id )
        const actionIcon = confirmD.icon === undefined ? null : this.getIconName(confirmD.icon)
        items.push(
          {
            label: confirmD.label,
            icon: actionIcon,
            command: () => {
              this.confirmationService.confirm({
                  message: confirmD.message,
                  accept: () => {
                    this.apollo
                      .mutate({
                        mutation: gql`${actionStr}`
                      }).subscribe(response => {
                      this.reloadPage()
                      if(confirmD.toast){
                        this.messageService.add({
                          severity:confirmD.toast.severity !== null ? confirmD.toast.severity : 'success',
                          summary:confirmD.toast.summary,
                          detail: confirmD.toast.detail})
                      }
                    })
                    this.hideMenu()
                  }
                })
            }
          })
      })
      return {
        id: res.id,
        items: items
      }
    })
  }

  // todo finish method
  getIconName(icon: string) {
    switch (icon) {
      case 'trash':
        return 'pi pi-fw pi-trash'
      default:
        return ''
    }
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

  // todo fix bug: op volgende pagina's komt geen menu
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
