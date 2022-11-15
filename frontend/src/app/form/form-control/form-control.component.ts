import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output
} from '@angular/core';
import {ConstraintsModel} from "../../models/constraints.model";
import {FormatModel} from "../../models/format.model";

@Component({
  selector: 'app-form-control',
  templateUrl: './form-control.component.html',
  styleUrls: ['./form-control.component.css']
})
export class FormControlComponent implements OnInit, OnChanges,AfterViewChecked  {
  @Input() control: {type:string, label:string, id:string,format:FormatModel|undefined,value:any,valid:{value: boolean|undefined,constraints:ConstraintsModel}}|undefined
  @Input() savePressed: boolean|undefined
  @Output() onPreSave = new EventEmitter<{type:string, label:string, id:string,value:any}>()

  mode:string
  currency:string|undefined
  maxFractionDigits:number

  constructor(
    private cd: ChangeDetectorRef) {
    this.mode = 'decimal'
    this.maxFractionDigits = 3
  }

  ngOnInit(): void {
    //if(this.control) console.log(this.control.type,this.control.valid.constraints)
  }

  checkValidity(constraint:string,control:any):{value:boolean,constraints:ConstraintsModel}{
    if(control.constraints.hasOwnProperty(constraint) && control.constraints[constraint]!==null){
      switch (constraint) {
        case 'required':
          if(control.constraints.required === true)
            return {value: (control.value !== undefined && control.value !== null && control.value !== '') , constraints:{required:true}}
          break
        case 'min':
          if(control.value)
            return {value: (
                typeof control.value === 'number' && control.value >= control.constraints.min
              ) , constraints:{min:control.constraints.min}}
          break
        case 'maxDecimals':
          break
        case 'decimals':
          break
        case 'trim':
          break
        // todo replace these by going through the format property => is er wezenlijk een verschil hier tussen een format en een constraint?
        // je zou de frontend kunnne toevoegen aan het constraintmodel tijdens de initializatie?
        /*        case 'currency':
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
                  break*/

      }
    }
    const constraintObj = Object.create({})
    constraintObj[constraint] = control.constraints[constraint]
    return {
      value:true,constraints:constraintObj
    }
  }

  isValid(){
    // enkel hier wordt validiteit berekend
    if(this.control?.format && typeof this.control.format === 'object'){

    }

    if(this.control) console.log(this.control.format)
    return true
  }

  ngOnChanges(event:any): void {
    if(this.savePressed){
      if(this.control) this.onPreSave.emit(this.control)
    }
  }

  resetValidity(){
    if(this.control){
      this.control.valid.value = true
      this.control.valid.constraints = {}
    }
  }

  getMessage(){
    if(this.control){
      switch (Object.keys(this.control.valid.constraints)[0]) {
        case 'required':
            return "Field "+ "<b>"+ this.control.label +"</b>" +" is required."
        case 'currency':
          return 'Field '+ "<b>"+this.control.label+"</b>" + ' is not a currency.'
        case 'cents':
          return 'Field '+ "<b>"+this.control.label+"</b>" + ' is not allowed to have decimals, only whole numbers.'
        case 'capitalized':
          return 'Field '+ "<b>"+this.control.label +"</b>"+ ' should start with a capital letter.'
        case 'min':
          return 'Field '+ "<b>"+this.control.label+"</b>" + ' should be a number with a value of at least '+ Object.values(this.control.valid.constraints)[0] +'.'
      }
    }
    return ''
  }

  ngAfterViewChecked(): void {
    this.cd.detectChanges()
  }

}
