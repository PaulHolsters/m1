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

@Component({
  selector: 'app-form-control',
  templateUrl: './form-control.component.html',
  styleUrls: ['./form-control.component.css']
})
export class FormControlComponent implements OnInit, OnChanges,AfterViewChecked  {
  @Input() control: {type:string, label:string, id:string,value:any,valid:{value: boolean|undefined,constraints:ConstraintsModel}}|undefined
  @Input() savePressed: boolean|undefined
  @Output() onPreSave = new EventEmitter<{type:string, label:string, id:string,value:any}>()

  mode:string
  currency:string|null
  maxFractionDigits:number

  constructor(
    private cd: ChangeDetectorRef) {
    this.mode = 'decimal'
    this.currency = null
    this.maxFractionDigits = 3
  }

  ngOnInit(): void {
    if(this.control) console.log(this.control.type,this.control.valid.constraints)
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
