import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {

  constructor() { }

  capitalizeFirst(word:string) {
    return word[0].toUpperCase() + word.substr(1)
  }

}
