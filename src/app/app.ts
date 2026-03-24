import { Component, inject, signal, computed } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AuthModalComponent } from './features/auth/components/auth-modal/auth-modal.component';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster, HeaderComponent, FooterComponent, AuthModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);

  private navEnd = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
  );

  protected isAdminArea = computed(() => {
    this.navEnd(); // trigger on navigation
    return this.router.url.startsWith('/admin') || this.router.url.startsWith('/teacher');
  });
}
