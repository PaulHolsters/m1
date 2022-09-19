import {AfterViewChecked, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ConfigService} from "../initializer/config.service";
import {ActivatedRoute, Router} from "@angular/router";
import {UUID} from "angular2-uuid";
import {Apollo, gql} from "apollo-angular";
import {ConstraintsModel} from "../models/constraints.model";
import {ComponentModel} from "../models/component.model";
import {FunctionsService} from "../services/functions.service";

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit,AfterViewChecked {
  controls: { label: string, type: string, constraints:ConstraintsModel, id: string, value: any, valid:{value:boolean|undefined, constraints: ConstraintsModel} }[]
  savePressed: boolean
  currentPath: string | undefined
  component: ComponentModel | undefined
  invalidForm:boolean|undefined
  constructor(private config: ConfigService, private route: ActivatedRoute, private router: Router, private apollo: Apollo,
              private cd: ChangeDetectorRef,private functions:FunctionsService) {
    this.controls = []
    this.savePressed = false
  }

  ngOnInit(): void {
    this.config.startupData$.pipe(
    ).subscribe(startupData => {
      if (startupData && startupData.routes && startupData.components) {
        this.route.url.subscribe(segments => {
          this.currentPath = segments[0] + '/' + segments[1]
        })
        const compRef = this.config.getRoutes().find(route => {
          return route.path.substr(1) === this.currentPath
        })?.component

        this.component = startupData.components.find(comp => {
          return comp.ref === compRef
        })

        this.component?.concept.props.forEach(prop => {
          this.controls.push({label: prop.label, type: prop.type, constraints:prop.constraints, id: UUID.UUID(),
            value: undefined,valid:{value:undefined,constraints:{}}})
        })
      }
    }, err => {
      console.log(err)
    })
  }

  updateControl(control: any) {
    const index = this.controls.findIndex(ctrl => {
      return ctrl.id === control.id
    })
    this.controls.fill(control, index, index)
    this.save()
  }

  preSave() {
    if (this.component && this.component.action) {
      this.savePressed = true
    } else {
      console.log('No action implemented')
    }
  }

  save() {
    this.savePressed = false
    this.checkValidity()
    if(!this.invalidForm){
      try {
        if (this.component && this.component.action) {
          let actionString
          if (this.component.action.search(/[{]\s*[a-z][^(]+[(]/) === 0) {
            // actie bevat parameters
            let actionCopy = this.component.action
            let stopAt = this.component.action.indexOf(')')
            let pattern = /[:]([^:,)]+)[),]/g
            let match
            let index = 0
            let term = 0
            while ((match = pattern.exec(this.component.action)) !== null && match.index < stopAt) {
              const part1 = actionCopy.substr(0, (match.index) + 1 - term)
              const part2 = actionCopy.substr((match.index) + 1 + match[1].length - term)
              switch (match[1].toString().trim()) {
                case 'String':
                  if(this.controls[index].value){
                    actionCopy = part1 + '"' + this.controls[index].value + '"' + part2
                    term += match[1].length - (this.controls[index].value.length + 2)
                  } else{
                    const value = null
                    actionCopy = part1 + value + part2
                    term += match[1].length - 6
                  }
                  break
                case 'Date':
                  if(this.controls[index].value){
                    const value = this.controls[index].value.getFullYear()+'-'+(this.controls[index].value.getMonth()+1)+'-' + this.controls[index].value.getDate()
                    actionCopy = part1 + '"' + value + '"' + part2
                    term += match[1].length - (('"' + value + '"').length + 2)
                  } else{
                    const value = null
                    actionCopy = part1 + value + part2
                    term += match[1].length - 6
                  }
                  break
                case 'Int':
                  if(this.controls[index].value){
                    actionCopy = part1 + this.controls[index].value + part2
                    term += match[1].length - this.controls[index].value.toString().length
                  } else{
                    const value = null
                    actionCopy = part1 + value + part2
                    term += match[1].length - 6
                  }
                  break
                default:
                  throw new Error('Type not implemented')
              }
              index++
            }
            actionString = actionCopy
          } else {
            // actie bevat enkel een return type

          }
          this.apollo
            .mutate({
              mutation: gql`mutation${actionString}`
            }).subscribe(response => {
            this.router.navigate([this.component?.routerLink]).then(r => {
            })
            console.log(response)
          }, err => {
            this.router.navigate([this.component?.routerLink]).then(r => {
            })
            console.log('Client friendly error message not implemented', err)
          })
        } else {
          console.log('No action implemented')
        }
      } catch (e) {
        console.log(e)
      }
    }
  }

  isValid(constraint:string,control:any):{value:boolean,constraints:ConstraintsModel}{
    if(control.constraints.hasOwnProperty(constraint) && control.constraints[constraint]!==null){
      switch (constraint) {
        case 'required':
          if(control.constraints.required === true)
          return {value: (control.value !== undefined && control.value !== null && control.value !== '') , constraints:{required:true}}
          break
        case 'currency':
          if(control.value){
            return {value: (
                control.constraints.currency
                && typeof control.value === 'number'
                && control.value > 0
                && (control.value - Math.trunc(control.value)).toString().length<5
              ) , constraints:{currency:control.constraints.currency}}
          }
          break
        case 'cents':
          if(control.constraints.cents && control.constraints.cents.hasOwnProperty('allowed') && control.value){
            if(!control.constraints.cents.allowed ){
              return {value: (
                  typeof control.value === 'number'
                  && control.value > 0
                  && (control.value - Math.trunc(control.value)) === 0
                ) , constraints:{cents:control.constraints.cents}}
            }
          }
          break
        case 'capitalized':
          if(control.constraints.capitalized === 'first' && control.value){
            return {value: (
                this.functions.capitalizeFirst(control.value) === control.value
              ) , constraints:{capitalized:control.constraints.capitalized}}
          }
          break
        case 'min':
          if(control.value)
            return {value: (
                typeof control.value === 'number' && control.value >= control.constraints.min
              ) , constraints:{min:control.constraints.min}}
          break
      }
    }
    const constraintObj = Object.create({})
    constraintObj[constraint] = control.constraints[constraint]
    return {
      value:true,constraints:constraintObj
    }
  }

  checkValidity(){
    this.invalidForm = false
    this.controls.forEach(control=>{
      for (let constraint of Object.keys(control.constraints)){
        const valid = this.isValid(constraint,control)
        if(!valid.value){
          control.valid.value = false
          let constrainstObj = Object.assign({},control.valid.constraints)
          constrainstObj = Object.assign(constrainstObj,valid.constraints)
          control.valid.constraints = constrainstObj
        }
        if(!this.invalidForm && !control.valid.value){
          this.invalidForm = true
        }
      }
      // todo nog te ontwikkelen: de mogelijkheid om over props heen constraints te leggen
    })
  }

  reset() {
    this.controls.forEach(control => {
      control.value = undefined
      control.valid.value = undefined
      control.valid.constraints = {}
    })
  }

  cancel() {
    this.router.navigate([this.component?.routerLink]).then(r => {
    })
  }

  isDisabled() {
    return false
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges()
  }

}
