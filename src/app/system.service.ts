import { Injectable } from '@angular/core';

import { System } from './models/system.model';
import { Celestial } from './models/celestial.model';

import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
const API = 'http://localhost:8000/';
const systemAPI = API + 'system/';
const celestialAPI = API + 'celestial/';
const userSystems = API + 'systems/';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  public getUserSystems(): Observable<System[]> {
    return this.http.get<System[]>(userSystems, httpOptions).pipe(map(this.extractData), catchError(this.handleError));
  }
  public newSystem(): Observable<any> {
    return this.http.post(systemAPI, { name: 'Untitled System' }, httpOptions).pipe(catchError(this.handleError));
  }
  public deleteSystem(_id: string): Observable<any> {
    return this.http.delete(systemAPI + _id, httpOptions).pipe(catchError(this.handleError));
  }
  public getSystem(_id: string): Observable<System> {
    return this.http.get<System>(systemAPI + _id, httpOptions).pipe(map(this.extractData), catchError(this.handleError));
  }
  public putSystem(system: System): Observable<any> {
    return this.http.put(systemAPI + system._id, system, httpOptions).pipe(map(this.extractData), catchError(this.handleError));
  }

  /*
   * CRUD with Celestials
   */
  public newCelestial(): Observable<Celestial> {
    return this.http.post<Celestial>(celestialAPI, httpOptions).pipe(catchError(this.handleError));
  }
  public newBinaryCelestial(): Observable<Celestial> {
    return this.http.post<Celestial>(celestialAPI, { binary: true }, httpOptions).pipe(catchError(this.handleError));
  }
  public deleteCelestial(_id: string): Observable<any> {
    return this.http.delete(celestialAPI + _id, httpOptions).pipe(catchError(this.handleError));
  }
  public getCelestial(_id: string): Observable<Celestial> {
    return this.http.get<Celestial>(celestialAPI + _id, httpOptions).pipe(map(this.extractData), catchError(this.handleError));
  }

  ping(): Observable<any> {
    //return this.http.get('http://localhost:8000/system/5b62209cc7e3454588d4a01ef', httpOptions).pipe(
    //   map(this.extractData),
    //   catchError(this.handleError));
    //this.http.post('http://localhost:8000/system/', { name: 'Darvince\'s New System' }, httpOptions)
    //  .pipe(catchError(this.handleError));
    return this.http.post('http://localhost:8000/system/', { name: 'Fihano System' }, httpOptions)
      .pipe(catchError(this.handleError));
    //this.http.delete('http://localhost:8000/system/5b62209cc7e3454588d4a01e', httpOptions)
    //  .pipe(catchError(this.handleError));
  }

  //https://www.djamware.com/post/5b00bb9180aca726dee1fd6d/mean-stack-angular-6-crud-web-application
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  };
  private extractData(res: Response) {
    let body = res;
    return body || {};
  }
}
