import {Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import {Hero} from './hero';
import {MessageService} from './message.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()

export class HeroService {

  private heroesUrl = 'api/heroes';  // URL к api

  constructor(
    private http: HttpClient,
    private messageService: MessageService) {}

  // получить героев с сервера
  getHeroes (): Observable<Hero[]> {
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(heroes => this.log(`fetched heroes`)),
        catchError(this.handleError('getHeroes', []))
      );
  }

  // получить героя по id. Возвращает `undefined`, когда id не найден
  getHeroNo404<Data>(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/?id=${id}`;
    return this.http.get<Hero[]>(url)
      .pipe(
        map(heroes => heroes[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? `fetched` : `did not find`;
          this.log(`${outcome} hero id=${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id=${id}`))
      );
  }

  // получить героя по id. Если id не найден будет 404
  getHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url).pipe(
      tap(_ => this.log(`fetched hero id=${id}`)),
      catchError(this.handleError<Hero>(`getHero id=${id}`))
    );
  }

  // получить героя, имя котрого содержит поисковый запрос
  searchHeroes(term: string): Observable<Hero[]> {
    if (!term.trim()) {
      // если имя не отвечает поисковому запросу, возвращаем пустой массив
      return of([]);
    }
    return this.http.get<Hero[]>(`api/heroes/?name=${term}`).pipe(
      tap(_ => this.log(`found heroes matching "${term}"`)),
      catchError(this.handleError<Hero[]>('searchHeroes', []))
    );
  }

  //////// Сохраненные методы //////////

  // добавить нового героя на сервер
  addHero (hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, httpOptions).pipe(
      tap((hero: Hero) => this.log(`added hero w/ id=${hero.id}`)),
      catchError(this.handleError<Hero>('addHero'))
    );
  }

  // удалить героя с сервера
  deleteHero (hero: Hero | number): Observable<Hero> {
    const id = typeof hero === 'number' ? hero : hero.id;
    const url = `${this.heroesUrl}/${id}`;

    return this.http.delete<Hero>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted hero id=${id}`)),
      catchError(this.handleError<Hero>('deleteHero'))
    );
  }

  // обновить героя на сервере
  updateHero (hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, httpOptions).pipe(
      tap(_ => this.log(`updated hero id=${hero.id}`)),
      catchError(this.handleError<any>('updateHero'))
    );
  }

  /** Если не удалось выполнить операцию Http, приложение продолжит работать.
      @param operation - имя проделанной операции
      @param result - необязательное значение для возврата в качестве наблюдаемого результата **/
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // отправьте сообщение об ошибке в удаленную инфраструктуру регистрации
      console.error(error);

      // трансформация вида ошибки для пользователей
      this.log(`${operation} failed: ${error.message}`);

      // приложение продолжает работать, возвращая пустой результат
      return of(result as T);
    };
  }

  // регистрация сообщения HeroService с MessageService
  private log(message: string) {
    this.messageService.add('HeroService: ' + message);
  }
}
