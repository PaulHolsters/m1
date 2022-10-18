import {Component, Input, OnInit} from '@angular/core';
import {ConfirmModel} from "../../models/confirm.model";
import {ConfirmationService} from "primeng/api";

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css']
})
export class ConfirmComponent implements OnInit {
  /*
    deze component wordt zichtbaar wanneer hij gebruikt wordt
    op dat moment zit er altijd een header bij, dus bij initializatie moet
    indien nodig nog wel eventueel niet default waarden voor message, accept en reject gezet worden
  */
  // incoming data
  @Input() confirmObject: ConfirmModel|undefined
  // outgoing data

  // UI variables

  // logics variables

  constructor(private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    if(!this.confirmObject){
      this.confirmObject = {header:'',action:[{name:'',value:''}], message:'Are you sure you want to proceed',acceptText:'Yes',rejectText:'No'}
    }
    else{
      if(!this.confirmObject.message) this.confirmObject.message = 'Are you sure you want to proceed'
      if(!this.confirmObject.acceptText) this.confirmObject.acceptText = 'Yes'
      if(!this.confirmObject.rejectText) this.confirmObject.rejectText = 'No'
    }
  }

}
