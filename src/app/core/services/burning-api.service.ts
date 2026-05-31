import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BurningState } from '../models/plc.models';
import { environment } from '../../../environments/environment';

interface StatusResponse {
  plcConnected: boolean;
  currentState: BurningState;
  sessionId: string | null;
  sessionStartedAt: string | null;
  subscribersCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class BurningApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.apiUrl}/status`);
  }

  getSnapshot(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/snapshot`);
  }


  getSnapshotRaw(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.apiUrl}/snapshot`);
  }

  start(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/start`, {});
  }

  stop(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/stop`, {});
  }

  emergency(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/emergency`, {});
  }

  reset(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset`, {});
  }

  forceMain(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/force-main`, {});
  }
}
