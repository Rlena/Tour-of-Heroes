import { Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { of } from 'rxjs/observable/of';

import {
  debounceTime, distinctUntilChanged, switchMap
} from 'rxjs/operators';

import { Hero } from '../hero';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: [ './hero-search.component.css' ]
})

export class HeroSearchComponent implements OnInit {

  heroes$: Observable<Hero[]>;
  private searchTerms = new Subject<string>();

  constructor(private heroService: HeroService) {}

  // Вставьте поисковый запрос в наблюдаемый stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }

  ngOnInit(): void {
    this.heroes$ = this.searchTerms.pipe(
      // запросы будут не чаще, чем 1 раз в 300 мс
      debounceTime(300),

      // запрос отправляется, только если текст фильтра изменился
      distinctUntilChanged(),

      // сохраняет исходный запрос, возвращая только наблюдаемый из последнего вызова метода HTTP
      // результаты предыдущих вызовов сбрасываются
      switchMap((term: string) => this.heroService.searchHeroes(term)),
    );
  }
}
