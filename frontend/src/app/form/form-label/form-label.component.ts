import {Component, ElementRef, Input, OnInit, Renderer2} from '@angular/core';
import {UUID} from "angular2-uuid";

@Component({
  selector: 'app-form-label',
  templateUrl: './form-label.component.html',
  styleUrls: ['./form-label.component.css']
})
export class FormLabelComponent implements OnInit {
  @Input() control: {type:string|undefined, label:string|undefined, id:string,value:any}|undefined

  constructor(private _r:Renderer2, private el: ElementRef) {
  }

  ngOnInit(): void {
    if(this.control) this._r.setAttribute(this.el.nativeElement,'for',this.control.id)
  }

}
