import { Injectable } from '@angular/core';

import { Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { User } from 'src/app/models/user';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};
const API = 'http://localhost:8000/';
const userAPI = API + 'user/';
const myselfAPI = API + 'myself/';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  public initializeUser(): Observable<any> {
    return this.http.post(userAPI, {}, httpOptions).pipe(catchError(this.handleError));
  }
  public getUser(auth_id: string): Observable<User> {
    return this.http.get<User>(userAPI + auth_id, httpOptions).pipe(map(this.extractData), catchError(this.handleError));
  }
  public putUser(user: User): Observable<any> {
    return this.http.put(userAPI + user.auth_id, user, httpOptions).pipe(map(this.extractData), catchError(this.handleError));
  }
  public getMyself(): Observable<User> {
    return this.http.get<User>(myselfAPI, httpOptions).pipe(map(this.extractData), catchError(this.handleError));
  }

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
