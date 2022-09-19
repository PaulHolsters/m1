import {Component, OnInit} from '@angular/core';
import {ConfigService} from "../initializer/config.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {
  items: { label: string | null, routerLink: string | null }[]
  currentPath:string|undefined
  constructor(private config: ConfigService,private route: ActivatedRoute,) {
    this.items = []
  }

  ngOnInit(): void {
    this.config.startupData$.pipe(
    ).subscribe(startupData => {
      if (startupData && startupData.components) {
        this.route.url.subscribe(segments => {
          this.currentPath = segments[0].toString()
        })
        const compRef = this.config.getRoutes().find(route => {
          return route.path.substr(1) === this.currentPath
        })?.component
        const cards = startupData.components.find(comp => {
          return comp.ref === compRef
        })
        if (cards && cards.configuration && cards.configuration.cards) {
          console.log(cards.configuration.cards)
          this.items = cards.configuration.cards.map(card => {
            return {label: card.label, routerLink: card.routerLink}
          })
        }
      }
    }, err => {
      console.log(err)
    })
  }

}
