import {APP_INITIALIZER, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ConfigService} from "./config.service";
import {take} from "rxjs/operators";



@NgModule({
 providers:[
   {
     provide: APP_INITIALIZER,
     multi: true,
     useFactory: (config:ConfigService)=>{
       return ()=>{
          config.fetchConfig()
          return config.startupData$.pipe(take(1))
       }
     },
     deps:[ConfigService]
   }
 ]
})
export class InitializerModule { }
