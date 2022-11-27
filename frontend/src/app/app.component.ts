import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ConfigService} from "./initializer/config.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  constructor(private router:Router, private config: ConfigService){
  }

  ngOnInit(): void {
    this.config.startupData$.pipe(
    ).subscribe(startupData => {
      if (startupData && startupData.routes)
        this.router.resetConfig(startupData.routes)
    }, err => {
      console.log(err)
    })
  }

}
