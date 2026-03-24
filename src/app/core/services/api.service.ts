import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Base API service - centralizes headers, auth token, and API key logic.
 * All feature services should inject this instead of duplicating getHeaders().
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  readonly http = inject(HttpClient);
  readonly baseUrl = environment.apiUrl;

  private readonly apiKey = environment.apiKey;
  private readonly storageKeys = environment.storageKeys;

  /** Build common headers with API key + request ID. Optionally attach Bearer token. */
  createHeaders(includeAuth = true): HttpHeaders {
    let headers = new HttpHeaders({
      'x-api-key': this.apiKey,
      'x-request-id': crypto.randomUUID(),
    });
    if (includeAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.storageKeys.accessToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.storageKeys.refreshToken);
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.storageKeys.accessToken, accessToken);
    localStorage.setItem(this.storageKeys.refreshToken, refreshToken);
  }

  getUserFromStorage<T>(): T | null {
    const json = localStorage.getItem(this.storageKeys.user);
    return json ? JSON.parse(json) : null;
  }

  setUserInStorage<T>(user: T): void {
    localStorage.setItem(this.storageKeys.user, JSON.stringify(user));
  }

  clearStorage(): void {
    localStorage.removeItem(this.storageKeys.accessToken);
    localStorage.removeItem(this.storageKeys.refreshToken);
    localStorage.removeItem(this.storageKeys.user);
  }
}
