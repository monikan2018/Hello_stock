import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../interfaces/stock.interface';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly API_URL = 'https://xoayxfutpurdbmprkiwi.supabase.co'; // Replace with your actual API URL

  constructor(private http: HttpClient) { }

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(`${this.API_URL}/stocks`);
  }

  getStock(id: string): Observable<Stock> {
    return this.http.get<Stock>(`${this.API_URL}/stocks/${id}`);
  }

  createStock(stock: Stock): Observable<Stock> {
    return this.http.post<Stock>(`${this.API_URL}/stocks`, stock);
  }

  updateStock(id: string, stock: Stock): Observable<Stock> {
    return this.http.put<Stock>(`${this.API_URL}/stocks/${id}`, stock);
  }

  deleteStock(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/stocks/${id}`);
  }
} 