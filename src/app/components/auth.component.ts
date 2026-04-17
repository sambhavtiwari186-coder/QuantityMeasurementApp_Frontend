import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-page">
      <!-- Decorative orbs -->
      <div class="orb orb-primary" style="width:500px;height:500px;top:-150px;left:-150px;opacity:0.4;animation-delay:0s"></div>
      <div class="orb orb-accent" style="width:400px;height:400px;bottom:-100px;right:-100px;opacity:0.3;animation-delay:3s"></div>
      <div class="orb orb-teal" style="width:300px;height:300px;top:50%;left:60%;opacity:0.2;animation-delay:5s"></div>

      <!-- Animated grid bg -->
      <div class="grid-bg"></div>

      <div class="auth-container animate-fade-in">
        <!-- Left panel – branding -->
        <div class="auth-brand">
          <div class="brand-inner">
            <div class="brand-logo">
              <span class="logo-icon">⚖️</span>
            </div>
            <h1 class="brand-title gradient-text-aurora">Quantity<br>Measurement</h1>
            <p class="brand-desc">Transform, compare, and compute quantities across every unit system with blazing speed.</p>

            <div class="feature-list">
              <div class="feature-item" *ngFor="let f of features">
                <div class="feature-icon">{{f.icon}}</div>
                <div>
                  <div class="feature-name">{{f.name}}</div>
                  <div class="feature-desc">{{f.desc}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right panel – form -->
        <div class="auth-form-panel glass-card">
          <!-- Tab switcher -->
          <div class="auth-tabs">
            <button class="auth-tab" [class.active]="isLoginMode" (click)="setMode(true)">Sign In</button>
            <button class="auth-tab" [class.active]="!isLoginMode" (click)="setMode(false)">Register</button>
            <div class="tab-slider" [style.transform]="isLoginMode ? 'translateX(0)' : 'translateX(100%)'"></div>
          </div>

          <div class="form-body">
            <div class="form-header">
              <h2 class="form-title">{{ isLoginMode ? 'Welcome back' : 'Create account' }}</h2>
              <p class="form-subtitle">{{ isLoginMode ? 'Sign in to your workspace' : 'Get started for free today' }}</p>
            </div>

            <form (ngSubmit)="onSubmit()">
              <div class="fields-stack">

                <div class="input-group" *ngIf="!isLoginMode" [class.animate-slide-right]="!isLoginMode">
                  <label>Full Name</label>
                  <div class="input-wrapper">
                    <span class="input-icon">👤</span>
                    <input type="text" [(ngModel)]="data.fullName" name="fullName"
                           placeholder="Your full name">
                  </div>
                </div>

                <div class="input-group">
                  <label>Username</label>
                  <div class="input-wrapper">
                    <span class="input-icon">&#64;</span>
                    <input type="text" [(ngModel)]="data.username" name="username"
                           placeholder="Enter username" required>
                  </div>
                </div>

                <div class="input-group" *ngIf="!isLoginMode" [class.animate-slide-right]="!isLoginMode">
                  <label>Email</label>
                  <div class="input-wrapper">
                    <span class="input-icon">✉️</span>
                    <input type="email" [(ngModel)]="data.email" name="email"
                           placeholder="you@email.com" required>
                  </div>
                </div>

                <div class="input-group">
                  <label>Password</label>
                  <div class="input-wrapper">
                    <span class="input-icon">🔑</span>
                    <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="data.password" name="password"
                           placeholder="••••••••" required minlength="6">
                    <button type="button" class="pass-toggle" (click)="showPassword = !showPassword">
                      {{ showPassword ? '🙈' : '👁' }}
                    </button>
                  </div>
                  <div class="input-note" *ngIf="!isLoginMode && data.password && data.password.length < 6">
                    Password must be at least 6 characters.
                  </div>
                </div>
              </div>

              <!-- Error -->
              <div class="error-box" *ngIf="error">
                <span class="error-icon">⚠️</span>
                <span>{{error}}</span>
              </div>

              <!-- Success -->
              <div class="success-box" *ngIf="successMsg">
                <span>✅</span>
                <span>{{successMsg}}</span>
              </div>

              <button type="submit" class="btn-primary w-full submit-btn" [disabled]="!canSubmit">
                <span class="spinner" *ngIf="loading"></span>
                <span *ngIf="!loading">{{ isLoginMode ? 'Sign In' : 'Create Account' }}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    /* Animated dot-grid background */
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image:
        radial-gradient(circle, rgba(99,102,241,0.15) 1px, transparent 1px);
      background-size: 40px 40px;
      mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
      pointer-events: none;
    }

    /* Container */
    .auth-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 950px;
      width: 100%;
      gap: 2rem;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    /* Brand panel */
    .auth-brand {
      padding: 2rem;
    }
    .brand-inner { display: flex; flex-direction: column; gap: 1.5rem; }
    .brand-logo {
      width: 64px; height: 64px;
      background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3));
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem;
      box-shadow: 0 8px 32px rgba(99,102,241,0.2);
    }
    .brand-title {
      font-size: 2.8rem;
      font-weight: 800;
      line-height: 1.1;
    }
    .brand-desc {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.7;
      max-width: 320px;
    }
    .feature-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem; }
    .feature-item {
      display: flex; align-items: flex-start; gap: 0.85rem;
    }
    .feature-icon {
      width: 36px; height: 36px; min-width: 36px;
      background: rgba(99,102,241,0.12);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1rem;
    }
    .feature-name { font-weight: 600; font-size: 0.9rem; color: var(--text-sub); }
    .feature-desc { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }

    /* Form card */
    .auth-form-panel {
      padding: 0;
      overflow: visible;
      background: rgba(13, 17, 28, 0.85);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(99,102,241,0.15);
      box-shadow:
        0 0 0 1px rgba(99,102,241,0.05),
        0 24px 80px rgba(0,0,0,0.6),
        inset 0 1px 0 rgba(255,255,255,0.06);
    }

    /* Tabs */
    .auth-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      position: relative;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      overflow: hidden;
      border-radius: 24px 24px 0 0;
    }
    .auth-tab {
      padding: 1.1rem;
      background: transparent; border: none;
      color: var(--text-muted);
      font-size: 0.9rem; font-weight: 600;
      cursor: pointer;
      transition: color 0.25s;
      position: relative; z-index: 1;
      font-family: 'Inter', sans-serif;
    }
    .auth-tab.active { color: var(--text-main); }
    .tab-slider {
      position: absolute; bottom: 0; left: 0;
      width: 50%; height: 2px;
      background: var(--primary-gradient);
      border-radius: 2px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Form body */
    .form-body {
      padding: 2rem 2rem 2.5rem;
      display: flex; flex-direction: column; gap: 1.25rem;
    }
    .form-header { margin-bottom: 0.5rem; }
    .form-title {
      font-size: 1.6rem; font-weight: 700;
      color: var(--text-main); line-height: 1.2;
    }
    .form-subtitle { color: var(--text-muted); font-size: 0.875rem; margin-top: 0.3rem; }

    .fields-stack { display: flex; flex-direction: column; gap: 1rem; }

    .input-wrapper {
      position: relative; display: flex; align-items: center;
    }
    .input-icon {
      position: absolute; left: 0.9rem;
      font-size: 0.95rem; color: var(--text-muted);
      pointer-events: none; z-index: 1;
      line-height: 1;
    }
    .input-wrapper input {
      padding-left: 2.5rem;
      padding-right: 2.5rem;
    }
    .pass-toggle {
      position: absolute; right: 0.75rem;
      background: none; border: none; cursor: pointer;
      font-size: 1rem; padding: 0; line-height: 1;
    }

    .error-box {
      display: flex; align-items: center; gap: 0.6rem;
      background: rgba(244,63,94,0.1);
      border: 1px solid rgba(244,63,94,0.25);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: #fda4af;
    }

    .success-box {
      display: flex; align-items: center; gap: 0.6rem;
      background: rgba(45,212,191,0.1);
      border: 1px solid rgba(45,212,191,0.25);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
      color: #5eead4;
    }

    .submit-btn {
      margin-top: 0.5rem;
      padding: 1rem;
      font-size: 0.95rem;
      letter-spacing: 0.03em;
      border-radius: 12px;
    }
    .submit-btn:disabled {
      opacity: 0.7; cursor: not-allowed;
    }

    /* Responsive */
    @media (max-width: 720px) {
      .auth-container { grid-template-columns: 1fr; }
      .auth-brand { display: none; }
    }
  `]
})
export class AuthComponent implements OnInit {
  isLoginMode = true;
  data = { fullName: '', username: '', email: '', password: '' };
  error = '';
  successMsg = '';
  loading = false;
  showPassword = false;

  features = [
    { icon: '📐', name: 'Unit Conversion', desc: 'Length, mass, volume, temperature & more' },
    { icon: '⚡', name: 'Instant Results', desc: 'Real-time calculations with full precision' },
    { icon: '📊', name: 'History Tracking', desc: 'Every operation saved and searchable' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  setMode(isLogin: boolean) {
    this.isLoginMode = isLogin;
    this.error = '';
    this.successMsg = '';
    this.data = { fullName: '', username: '', email: '', password: '' };
  }

  toggleMode() { this.setMode(!this.isLoginMode); }

  get canSubmit(): boolean {
    if (this.loading) {
      return false;
    }
    if (!this.data.username || !this.data.password) {
      return false;
    }
    if (!this.isLoginMode) {
      return !!this.data.fullName && !!this.data.email && this.data.password.length >= 6;
    }
    return true;
  }

  onSubmit() {
    this.error = '';
    this.successMsg = '';
    this.loading = true;

    if (this.isLoginMode) {
      this.authService.login({ username: this.data.username, password: this.data.password }).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          this.loading = false;
          this.error = this.parseError(err) || 'Invalid username or password.';
        }
      });
    } else {
      this.authService.register({
        fullName: this.data.fullName,
        username: this.data.username,
        email: this.data.email,
        password: this.data.password
      }).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
        },
        error: err => {
          this.loading = false;
          this.error = this.parseError(err) || 'Registration failed. Please try again.';
        }
      });
    }
  }

  private parseError(err: any): string {
    if (err?.status === 0) {
      return 'Cannot connect to the backend server. Please check if the backend is awake (Render cold start) or if CORS is blocking the request.';
    }

    const error = err?.error;
    if (!error) {
      return err?.message || 'Unknown error occurred.';
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error.Error) {
      return error.Error;
    }
    if (error.error) {
      return error.error;
    }
    if (error.details) {
      return error.details;
    }
    if (error.title) {
      return error.title;
    }
    if (error.errors && typeof error.errors === 'object') {
      return Object.values(error.errors)
        .flat()
        .map((value: any) => value?.toString())
        .join(' ');
    }

    return JSON.stringify(error);
  }
}
