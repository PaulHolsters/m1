import { Component, OnInit } from '@angular/core';
import {MenuItem} from "primeng/api";
import {ConfigService} from "../initializer/config.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  items:MenuItem[]
  constructor(private config:ConfigService) {
    this.items = [
    ]
  }

  ngOnInit(): void {
    this.config.startupData$.pipe(
    ).subscribe(startupData => {
      if (startupData && startupData.menu){
        console.log(startupData.menu)
        this.items = startupData.menu
      }
    }, err => {
      console.log(err)
    })
  }

}
