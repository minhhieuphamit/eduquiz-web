import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // add CommonModule if not present by default
import { RouterModule, Router } from '@angular/router';
import { AuthModalService } from '../../../core/services/auth-modal.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private authModal = inject(AuthModalService);
  public authService = inject(AuthService);
  private router = inject(Router);

  isDropdownOpen = false;

  openLogin() {
    this.authModal.open('login');
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  navigateToManagement() {
    this.isDropdownOpen = false;
    const role = this.authService.currentUser()?.role;
    if (role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else if (role === 'TEACHER') {
      this.router.navigate(['/teacher']);
    }
  }

  navigateTo(path: string) {
    this.isDropdownOpen = false;
    this.router.navigate([path]);
  }

  navigateToProfile(tab: 'profile' | 'password') {
    this.isDropdownOpen = false;
    this.router.navigate(['/profile'], { 
      queryParams: { tab: tab }
    });
  }

  logout() {
    this.authService.logout();
    this.isDropdownOpen = false;
    this.router.navigate(['/']); // Ensure redirection after logout
  }
}
