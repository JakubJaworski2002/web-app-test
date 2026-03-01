import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * AuthInterceptor jest używany do klonowania każdego żądania HTTP i dodawania
 * opcji `withCredentials: true`, co umożliwia wysyłanie ciasteczek wraz z żądaniami.
 *
 * @implements {HttpInterceptor}
 * @injectable
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  /**
   * Metoda interceptuje każde żądanie HTTP wychodzące z aplikacji,
   * klonuje je i dodaje opcję `withCredentials: true`.
   *
   * @param {HttpRequest<any>} req - Oryginalne żądanie HTTP.
   * @param {HttpHandler} next - Następny handler w łańcuchu interceptora.
   * @returns {Observable<HttpEvent<any>>} - Observable emitujący zdarzenia HTTP.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedRequest = req.clone({
      withCredentials: true
    });

    return next.handle(clonedRequest);
  }
}
