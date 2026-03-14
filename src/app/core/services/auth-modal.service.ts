import { Injectable, signal } from '@angular/core';

export type AuthView = 'login' | 'register' | 'otp' | 'forgot-password' | 'reset-password';

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {
  isOpen = signal<boolean>(false);
  currentView = signal<AuthView>('login');

  open(view: AuthView = 'login') {
    this.currentView.set(view);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden'; // prevent scrolling
  }

  close() {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  switchView(view: AuthView) {
    this.currentView.set(view);
  }
}
