import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigModel } from '../models/configuration.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationsService {
  BASE_URL = 'http://localhost:3000/api/tickets/';
  constructor(private _http: HttpClient) {}

  startConfiguration(serviceUrl: string): Observable<any> {
    return this._http.post(`${this.BASE_URL}${serviceUrl}`, {});
  }

  stopConfiguration(serviceUrl: string): Observable<any> {
    return this._http.post(`${this.BASE_URL}${serviceUrl}`, {});
  }

  updateConfiguration(
    serviceUrl: string,
    payload: ConfigModel
  ): Observable<any> {
    return this._http.post(`${this.BASE_URL}${serviceUrl}`, payload);
  }

  getStatus(serviceUrl: string): Observable<any> {
    return this._http.get(`${this.BASE_URL}${serviceUrl}`);
  }

  addTickets(serviceUrl: string, payload: any): Observable<any> {
    return this._http.post(`${this.BASE_URL}${serviceUrl}`, payload);
  }

  purchaseTicket(serviceUrl: string, payload: any): Observable<any> {
    return this._http.post(`${this.BASE_URL}${serviceUrl}`, payload);
  }
}
