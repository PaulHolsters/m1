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
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeNl from '@angular/common/locales/nl';
import localeDe from '@angular/common/locales/de';
import localeBe from '@angular/common/locales/be';

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
    registerLocaleData(localeFr, 'fr');
    registerLocaleData(localeDe, 'de');
    registerLocaleData(localeBe, 'be');
    registerLocaleData(localeNl, 'nl');
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
        // todo fix this to get the correct types
        if(this.component?.configuration.formats){
          console.log('formats',this.component?.configuration.formats)
        }
        if(this.component?.configuration.controls){
          console.log(this.component?.configuration.controls)
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
          this.resourcesAll = Object.values(res)[0].map(val => {
            const valCopy = Object.create(val)
            const resource: {
              resource: {
                property: string,
                type: string | undefined,
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
                type: string | undefined,
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

  isCurrency(field:string):boolean{
    return this.component?.configuration.formats.find(format=>{
      return format.ref === field && format.format.find(formatt=>{
        return formatt.name==='currency'
      }) !== undefined
    }) !== undefined
  }

  getCurrency(conf:string,field:string){
    const format = this.component?.configuration.formats.find(format=>{
      return format.ref === field && format.format.find(formatt=>{
        return formatt.name==='currency'
      }) !== undefined
    })?.format
    switch (conf) {
      case 'code':
        const code = format?.find(formatt=>{
          //console.log(formatt.name)
          return formatt.name==='currency'
        })?.valueS
        //console.log(code)
        return code
      case 'display':
        return format?.find(formatt=>{
          return formatt.name==='display'
        })?.valueS
      case 'digitsInfo':
        const centsValue = format?.find(formatt=>{
          return formatt.name==='cents'
        })?.valueF
          const show = centsValue?.find(value=>{
            return value.name === 'show'
          })?.valueB
          if(!show){
              return '1.0-0'
          }
        return '1.2-3'
      case 'locale':
        return format?.find(formatt=>{
          return formatt.name==='locale'
        })?.valueS
      default:
        return undefined
    }
  }

  getDateTime(datetime: string,field:string){
    console.log(datetime)
    const date = new Date(datetime)
    const format = this.component?.configuration.formats.find(format=>{
      return format.ref === field
    })?.format
    let year = "numeric"
    let month = '2-digit'
    let day= '2-digit'
    let sepDate = '/'
    let sepTime = ':'
    let weekday
    let hour = '2-digit'
    let minute = '2-digit'
    let second = '2-digit'
    let ms = false
    let era
    let timeZone
    let timeZoneName
    let hour12 = false
    let hourCycle
    let showTime = false
    let showDate = false
    format?.forEach(f=>{
      if(f.name==='time'){
        f?.valueF.forEach(tf=>{
          switch (tf.name) {
            case 'show':
              if(tf.value===true){
                showTime=true
              }
              break
            case 'timeFormat':
              let tfArr
              if(tf.valueS.search('.')!==-1){
                sepTime = '.'
                tfArr = tf.valueS.split('.')
              } else{
                tfArr = tf.valueS.split(':')
              }
              tfArr.forEach(v=>{
                switch (v){
                  case 'H':
                    hour = 'numeric'
                    break
                  case 'M':
                    minute = 'numeric'
                    break
                  case 'S':
                    second = 'numeric'
                    break
                  case 'mmm':
                    ms = true
                    break
                }
              })
              break
            case 'hourFormat':
              if(tf.value==='12'){
                hour12 = true
              }
              break
          }
        })
      }
      if(f.name=='date'){
        f?.valueF.forEach(df=>{
          switch (df.name) {
            case 'show':
              if(df.valueB){
                showDate=true
              }
              break
            case 'dateFormat':
              switch (df.valueS) {
                case 'dd-mm-yyyy':
                  sepDate = '-'
                  break
                case 'dd/mm/yy':
                  year = "2-digit"
                  break
                case 'dd-mm-yy':
                  sepDate = '-'
                  year = "2-digit"
                  break
                case 'd/m/yyyy':
                  day = 'numeric'
                  month = 'numeric'
                  break
                case 'd-m-yyyy':
                  sepDate = '-'
                  day = 'numeric'
                  month = 'numeric'
                  break
                case 'd/m/yy':
                  day = 'numeric'
                  month = 'numeric'
                  year = "2-digit"
                  break
                case 'd-m-yy':
                  sepDate = '-'
                  day = 'numeric'
                  month = 'numeric'
                  year = "2-digit"
                  break
              }
              break
          }
        })
      }
    })
    //return Intl.DateTimeFormat('en-GB').format(value);
    // todo op het einde ga je de string nog is formateren voor de extra dingen
    /*
    *     let year = 'numeric'
    let month = '2-digit'
    let day= '2-digit'
    let sepDate = '/'
    let sepTime = ':'
    let weekday
    let hour = '2-digit'
    let minute = '2-digit'
    let second = '2-digit'
    let ms = false
    let era
    let timeZone
    let timeZoneName
    let hour12 = false
    let hourCycle
    let showTime = false
    let showDate = false
    * */
    let opts:any = {year:year,month:month,day:day,hour:hour,minute:minute,second:second,hour12:hour12}
    let convertedDatetime = Intl.DateTimeFormat('en-GB',opts).format(date)
    console.log(convertedDatetime)
    return convertedDatetime
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
          console.log(res)
          this.resourcesAll = Object.values(res)[0].map(val => {
            const valCopy = Object.create(val)
            const resource: {
              resource:
                {
                  property: string,
                  type: string |undefined,
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
                type: string | undefined,
                value: any,
                column: string | undefined
              } = {property: '', type: '', value: undefined, column: ''}
              resourceItem.property = prop
              resourceItem.type = this.getType(prop)
              resourceItem.value = valCopy[prop]
              console.log(valCopy[prop])
              resourceItem.column = this.columns.find(col => {
                return col.ref === prop
              })?.label
              resource.resource.push(resourceItem)
            })
            return resource
          })
          // todo fix this want het lijkt er op dat er steeds dezelfde
          //  pagina getoond wordt => inderdaad terwijl d epagina numme rniet eens correct wijzigt op dat moment!
          this.resources = this.resourcesAll.slice(0, this.numberOfRows)
          this.rerenderActionMenus()
        })
    }

  }

  // todo zorg ervoor dat types in een correct formaat worden getoond
  getType(propertyName: string) {
    return this.component?.configuration.controls.find(control=>{
      return control.ref === propertyName
    })?.type
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
    this.rerenderActionMenus()
  }



  ngOnDestroy(): void {
    this.startupSubscription?.unsubscribe()
    this.querySubscription?.unsubscribe()
  }

}
