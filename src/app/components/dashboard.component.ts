import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MeasurementService } from '../services/measurement.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="dashboard-page">
      <!-- Orbs -->
      <div class="orb orb-primary" style="width:600px;height:600px;top:-200px;right:-200px;opacity:0.2;animation-delay:0s"></div>
      <div class="orb orb-teal" style="width:400px;height:400px;bottom:-100px;left:-100px;opacity:0.15;animation-delay:4s"></div>

      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-mark">⚖️</div>
          <span class="logo-name">QMetric</span>
        </div>

        <nav class="sidebar-nav">
          <button class="nav-item" [class.active]="activeTab === 'convert'" (click)="activeTab='convert'">
            <span class="nav-icon">🔄</span>
            <span>Convert</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'compare'" (click)="activeTab='compare'">
            <span class="nav-icon">⚖️</span>
            <span>Compare</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'arithmetic'" (click)="activeTab='arithmetic'">
            <span class="nav-icon">🧮</span>
            <span>Arithmetic</span>
          </button>
          <button class="nav-item" [class.active]="activeTab === 'history'" (click)="setHistoryTab()">
            <span class="nav-icon">🕐</span>
            <span>History</span>
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="user-pill">
            <div class="user-avatar">{{ userInitial }}</div>
            <div class="user-info">
              <div class="user-name">{{ username }}</div>
              <div class="user-role">Member</div>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()" title="Logout">⏻</button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="main-content">

        <!-- Top bar -->
        <header class="topbar">
          <div>
            <h1 class="topbar-title gradient-text">{{ tabTitle }}</h1>
            <p class="topbar-sub">{{ tabSubtitle }}</p>
          </div>
          <div class="topbar-actions">
            <div class="status-chip">
              <span class="status-dot"></span>
              API Connected
            </div>
          </div>
        </header>

        <!-- ─── CONVERT TAB ─── -->
        <div class="tab-panel animate-fade-in" *ngIf="activeTab === 'convert'">
          <div class="panel-grid">
            <!-- Input card -->
            <div class="glass-card context-card">
              <div class="card-label">Source Quantity</div>
              <div class="big-input-row">
                <input type="number" [(ngModel)]="source.value" class="big-number-input" placeholder="0">
                <select [(ngModel)]="source.unit" class="unit-select">
                  <optgroup label="Length" *ngFor="let g of unitGroups">
                    <option *ngFor="let u of g.units" [value]="u">{{u}}</option>
                  </optgroup>
                </select>
              </div>
              <div class="unit-pills">
                <button *ngFor="let u of quickUnits" class="unit-pill"
                  [class.selected]="source.unit === u" (click)="source.unit = u">{{u}}</button>
              </div>
            </div>

            <!-- Arrow connector -->
            <div class="arrow-connector">
              <div class="arrow-circle">→</div>
            </div>

            <!-- Target card -->
            <div class="glass-card context-card">
              <div class="card-label">Target Unit</div>
              <div class="big-input-row">
                <div class="result-value-big">{{ convertedResult?.value ?? '–' }}</div>
                <select [(ngModel)]="targetUnit" class="unit-select">
                  <option *ngFor="let u of allUnits" [value]="u">{{u}}</option>
                </select>
              </div>
              <div class="unit-pills">
                <button *ngFor="let u of quickUnits" class="unit-pill"
                  [class.selected]="targetUnit === u" (click)="targetUnit = u">{{u}}</button>
              </div>
            </div>
          </div>

          <button class="btn-primary action-btn" (click)="performConvert()" [disabled]="loadingConvert">
            <span class="spinner" *ngIf="loadingConvert"></span>
            <span *ngIf="!loadingConvert">🔄 Convert Now</span>
          </button>

          <div class="result-banner" *ngIf="convertedResult">
            <div class="result-banner-inner">
              <span class="result-label">Result</span>
              <span class="result-big">{{ source.value }} {{ source.unit }}</span>
              <span class="result-arrow">→</span>
              <span class="result-big highlight">{{ convertedResult.value }} {{ targetUnit }}</span>
            </div>
          </div>

          <div class="error-box" *ngIf="convertError">⚠️ {{ convertError }}</div>
        </div>

        <!-- ─── COMPARE TAB ─── -->
        <div class="tab-panel animate-fade-in" *ngIf="activeTab === 'compare'">
          <div class="panel-grid">
            <div class="glass-card context-card">
              <div class="card-label">Quantity 1</div>
              <div class="big-input-row">
                <input type="number" [(ngModel)]="q1.value" class="big-number-input" placeholder="0">
                <select [(ngModel)]="q1.unit" class="unit-select">
                  <option *ngFor="let u of allUnits" [value]="u">{{u}}</option>
                </select>
              </div>
            </div>
            <div class="compare-vs">
              <div class="vs-badge">VS</div>
            </div>
            <div class="glass-card context-card">
              <div class="card-label">Quantity 2</div>
              <div class="big-input-row">
                <input type="number" [(ngModel)]="q2.value" class="big-number-input" placeholder="0">
                <select [(ngModel)]="q2.unit" class="unit-select">
                  <option *ngFor="let u of allUnits" [value]="u">{{u}}</option>
                </select>
              </div>
            </div>
          </div>

          <button class="btn-primary action-btn" (click)="performCompare()" [disabled]="loadingCompare">
            <span class="spinner" *ngIf="loadingCompare"></span>
            <span *ngIf="!loadingCompare">⚖️ Compare Values</span>
          </button>

          <div class="compare-result" *ngIf="compareResult !== null"
            [class.equal]="compareResult" [class.not-equal]="!compareResult">
            <span class="compare-icon">{{ compareResult ? '✅' : '❌' }}</span>
            <div>
              <div class="compare-verdict">{{ compareResult ? 'They are Equal' : 'Not Equal' }}</div>
              <div class="compare-sub">{{ compareResult ? 'Both quantities represent the same measure' : 'The quantities differ in value' }}</div>
            </div>
          </div>

          <div class="error-box" *ngIf="compareError">⚠️ {{ compareError }}</div>
        </div>

        <!-- ─── ARITHMETIC TAB ─── -->
        <div class="tab-panel animate-fade-in" *ngIf="activeTab === 'arithmetic'">
          <div class="glass-card" style="margin-bottom:1.5rem">
            <div class="card-label mb-4">Operation</div>
            <div class="op-pills">
              <button *ngFor="let op of operations" class="op-pill"
                [class.selected]="selectedOp === op.key" (click)="selectedOp = op.key">
                <span>{{ op.icon }}</span>
                <span>{{ op.label }}</span>
              </button>
            </div>
          </div>

          <div class="panel-grid">
            <div class="glass-card context-card">
              <div class="card-label">Quantity 1</div>
              <div class="big-input-row">
                <input type="number" [(ngModel)]="aq1.value" class="big-number-input" placeholder="0">
                <select [(ngModel)]="aq1.unit" class="unit-select">
                  <option *ngFor="let u of allUnits" [value]="u">{{u}}</option>
                </select>
              </div>
            </div>

            <div class="arrow-connector">
              <div class="arrow-circle op-symbol">{{ opSymbol }}</div>
            </div>

            <div class="glass-card context-card">
              <div class="card-label">Quantity 2</div>
              <div class="big-input-row">
                <input type="number" [(ngModel)]="aq2.value" class="big-number-input" placeholder="0">
                <select [(ngModel)]="aq2.unit" class="unit-select">
                  <option *ngFor="let u of allUnits" [value]="u">{{u}}</option>
                </select>
              </div>
            </div>
          </div>

          <div class="glass-card" style="margin-top:1rem;padding:1.25rem 1.5rem" *ngIf="selectedOp !== 'divide'">
            <div class="card-label" style="margin-bottom:0.5rem">Result Unit</div>
            <select [(ngModel)]="arithTargetUnit" class="unit-select" style="max-width:200px">
              <option *ngFor="let u of allUnits" [value]="u">{{u}}</option>
            </select>
          </div>

          <button class="btn-primary action-btn" (click)="performArithmetic()" [disabled]="loadingArith">
            <span class="spinner" *ngIf="loadingArith"></span>
            <span *ngIf="!loadingArith">🧮 Calculate</span>
          </button>

          <div class="result-banner" *ngIf="arithResult">
            <div class="result-banner-inner">
              <span class="result-label">Result</span>
              <span class="result-big highlight">{{ arithResult.value ?? arithResult }} {{ arithResult.unit ?? arithTargetUnit }}</span>
            </div>
          </div>

          <div class="error-box" *ngIf="arithError">⚠️ {{ arithError }}</div>
        </div>

        <!-- ─── HISTORY TAB ─── -->
        <div class="tab-panel animate-fade-in" *ngIf="activeTab === 'history'">
          <div class="history-header">
            <div class="badge badge-primary">{{ history.length }} records</div>
            <button class="btn-secondary" (click)="loadHistory()">
              <span>🔄</span> Refresh
            </button>
          </div>

          <div class="glass-card p-0 overflow-hidden history-table-card" *ngIf="history.length > 0">
            <table class="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Target</th>
                  <th>Result</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let h of history; let i = index">
                  <td class="row-num">{{ i + 1 }}</td>
                  <td><span class="type-badge">{{ h.operationType }}</span></td>
                  <td>{{ h.sourceValue }} <span class="unit-tag">{{ h.sourceUnit }}</span></td>
                  <td><span class="unit-tag">{{ h.targetUnit }}</span></td>
                  <td class="result-cell">{{ h.resultValue }}</td>
                  <td class="date-cell">{{ h.timestamp | date:'MMM d, h:mm a' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="empty-state" *ngIf="history.length === 0 && !loadingHistory">
            <div class="empty-icon">📭</div>
            <div class="empty-title">No history yet</div>
            <div class="empty-sub">Your conversion & operation history will appear here.</div>
          </div>

          <div class="loading-state" *ngIf="loadingHistory">
            <span class="spinner"></span> Loading history…
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    /* ── Layout ── */
    .dashboard-page {
      display: flex;
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 240px;
      min-width: 240px;
      background: rgba(9,12,20,0.9);
      backdrop-filter: blur(20px);
      border-right: 1px solid rgba(255,255,255,0.05);
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      position: relative;
      z-index: 10;
    }
    .sidebar-logo {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      margin-bottom: 2rem;
    }
    .logo-mark {
      font-size: 1.5rem;
      width: 40px; height: 40px;
      background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3));
      border: 1px solid rgba(99,102,241,0.3);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .logo-name {
      font-family: 'Outfit', sans-serif;
      font-size: 1.15rem; font-weight: 700;
      background: var(--primary-gradient);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.35rem; }
    .nav-item {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      background: transparent; border: none;
      color: var(--text-muted);
      font-size: 0.875rem; font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
      text-align: left;
      font-family: 'Inter', sans-serif;
    }
    .nav-item:hover { background: rgba(255,255,255,0.05); color: var(--text-sub); }
    .nav-item.active {
      background: rgba(99,102,241,0.15);
      color: var(--primary-light);
      border: 1px solid rgba(99,102,241,0.2);
    }
    .nav-icon { font-size: 1.1rem; width: 22px; text-align: center; }

    .sidebar-footer {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.75rem;
      border-top: 1px solid rgba(255,255,255,0.06);
      margin-top: 1rem;
    }
    .user-pill { display: flex; align-items: center; gap: 0.6rem; flex: 1; min-width: 0; }
    .user-avatar {
      width: 36px; height: 36px; min-width: 36px;
      background: var(--primary-gradient);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; font-weight: 700; color: white;
    }
    .user-info { overflow: hidden; }
    .user-name { font-size: 0.85rem; font-weight: 600; color: var(--text-sub); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 0.7rem; color: var(--text-muted); }
    .logout-btn {
      background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.2);
      border-radius: 8px; color: #fda4af; cursor: pointer;
      width: 32px; height: 32px; font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .logout-btn:hover { background: rgba(244,63,94,0.2); }

    /* ── Main ── */
    .main-content {
      flex: 1; display: flex; flex-direction: column;
      padding: 2rem 2.5rem;
      overflow-y: auto;
      position: relative; z-index: 1;
    }

    .topbar {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 2rem;
    }
    .topbar-title { font-size: 1.8rem; font-weight: 800; line-height: 1.1; }
    .topbar-sub { color: var(--text-muted); font-size: 0.875rem; margin-top: 0.3rem; }
    .topbar-actions { display: flex; align-items: center; gap: 1rem; }
    .status-chip {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(45,212,191,0.08);
      border: 1px solid rgba(45,212,191,0.2);
      border-radius: 999px; padding: 0.4rem 0.9rem;
      font-size: 0.78rem; font-weight: 600; color: var(--teal);
    }
    .status-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: var(--teal);
      box-shadow: 0 0 6px var(--teal);
      animation: pulse-glow 2s ease-in-out infinite;
    }

    /* ── Tab panel ── */
    .tab-panel { display: flex; flex-direction: column; gap: 1.5rem; }

    /* ── Panel grid ── */
    .panel-grid {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 1rem;
    }

    .context-card { padding: 1.5rem; }
    .card-label {
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--text-muted);
      margin-bottom: 1rem;
    }

    .big-input-row {
      display: flex; align-items: center; gap: 0.75rem;
    }
    .big-number-input {
      flex: 1; font-size: 2rem; font-weight: 700;
      background: transparent; border: none; border-bottom: 2px solid rgba(99,102,241,0.3);
      border-radius: 0; padding: 0.25rem 0.25rem 0.5rem;
      outline: none; color: var(--text-main);
      font-family: 'Outfit', sans-serif;
      min-width: 0;
    }
    .big-number-input:focus { border-bottom-color: var(--primary); }
    .big-number-input::placeholder { color: var(--text-dimmed); }

    .result-value-big {
      flex: 1; font-size: 2rem; font-weight: 700;
      color: var(--primary-light);
      font-family: 'Outfit', sans-serif;
      padding: 0.25rem 0.25rem 0.5rem;
      border-bottom: 2px solid rgba(99,102,241,0.2);
      min-width: 0;
    }

    .unit-select {
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.2);
      color: var(--primary-light);
      padding: 0.5rem 0.75rem;
      border-radius: 10px;
      font-size: 0.85rem; font-weight: 600;
      width: auto; min-width: 80px;
      cursor: pointer;
    }

    .unit-pills { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 1rem; }
    .unit-pill {
      padding: 0.3rem 0.6rem;
      border-radius: 6px;
      border: 1px solid var(--glass-border);
      background: transparent; color: var(--text-muted);
      font-size: 0.72rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .unit-pill:hover { border-color: rgba(99,102,241,0.4); color: var(--primary-light); }
    .unit-pill.selected { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.4); color: var(--primary-light); }

    /* Arrow */
    .arrow-connector { display: flex; align-items: center; justify-content: center; }
    .arrow-circle {
      width: 48px; height: 48px;
      background: rgba(99,102,241,0.12);
      border: 1px solid rgba(99,102,241,0.25);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; color: var(--primary-light);
    }
    .op-symbol { font-size: 1.4rem; font-weight: 700; }

    /* Compare VS */
    .compare-vs { display: flex; align-items: center; justify-content: center; }
    .vs-badge {
      width: 52px; height: 52px;
      background: var(--primary-gradient);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.9rem; font-weight: 800; color: white;
      box-shadow: 0 4px 20px rgba(99,102,241,0.4);
    }

    /* Action Button */
    .action-btn { padding: 1rem 2.5rem; font-size: 1rem; border-radius: 14px; align-self: flex-start; }

    /* Result banner */
    .result-banner {
      background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(168,85,247,0.08) 100%);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 16px;
      padding: 1.25rem 1.75rem;
      animation: fadeInUp 0.4s ease-out;
    }
    .result-banner-inner { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
    .result-label {
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.08em; color: var(--text-muted);
      border: 1px solid var(--glass-border); border-radius: 6px; padding: 0.2rem 0.5rem;
    }
    .result-big { font-size: 1.4rem; font-weight: 700; color: var(--text-sub); font-family: 'Outfit', sans-serif; }
    .result-big.highlight { color: var(--primary-light); }
    .result-arrow { color: var(--text-muted); font-size: 1.2rem; }

    /* Compare result */
    .compare-result {
      display: flex; align-items: center; gap: 1.25rem;
      padding: 1.5rem 2rem;
      border-radius: 16px;
      animation: fadeInUp 0.4s ease-out;
    }
    .compare-result.equal { background: rgba(45,212,191,0.08); border: 1px solid rgba(45,212,191,0.25); }
    .compare-result.not-equal { background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.25); }
    .compare-icon { font-size: 2rem; }
    .compare-verdict { font-size: 1.1rem; font-weight: 700; color: var(--text-main); }
    .compare-sub { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }

    /* Operations */
    .op-pills { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .op-pill {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      border: 1px solid var(--glass-border);
      background: transparent;
      color: var(--text-muted);
      font-size: 0.875rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .op-pill:hover { border-color: rgba(99,102,241,0.3); color: var(--text-sub); }
    .op-pill.selected { background: rgba(99,102,241,0.15); border-color: rgba(99,102,241,0.4); color: var(--primary-light); }

    /* History */
    .history-header { display: flex; align-items: center; justify-content: space-between; }
    .history-table-card { border-radius: 16px; overflow: hidden; }
    .history-table {
      width: 100%; border-collapse: collapse;
      font-size: 0.875rem;
    }
    .history-table thead tr {
      background: rgba(255,255,255,0.03);
    }
    .history-table th {
      padding: 0.9rem 1.25rem;
      font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--text-muted);
      text-align: left;
    }
    .history-table tbody tr {
      border-top: 1px solid rgba(255,255,255,0.04);
      transition: background 0.2s;
    }
    .history-table tbody tr:hover { background: rgba(99,102,241,0.05); }
    .history-table td { padding: 0.85rem 1.25rem; color: var(--text-sub); }
    .row-num { color: var(--text-dimmed); font-size: 0.8rem; }
    .type-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      background: rgba(99,102,241,0.12);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 6px;
      font-size: 0.72rem; font-weight: 700;
      color: var(--primary-light);
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .unit-tag {
      display: inline-block; padding: 0.1rem 0.4rem;
      background: rgba(255,255,255,0.06); border-radius: 4px;
      font-size: 0.75rem; font-weight: 600;
      color: var(--text-muted); margin-left: 0.25rem;
    }
    .result-cell { color: var(--primary-light); font-weight: 600; }
    .date-cell { color: var(--text-muted); font-size: 0.8rem; }

    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      gap: 0.75rem; padding: 4rem 2rem; text-align: center;
    }
    .empty-icon { font-size: 3rem; }
    .empty-title { font-size: 1.1rem; font-weight: 700; color: var(--text-sub); }
    .empty-sub { color: var(--text-muted); font-size: 0.875rem; }

    .loading-state {
      display: flex; align-items: center; gap: 0.75rem;
      color: var(--text-muted); padding: 2rem;
    }

    .error-box {
      display: flex; align-items: center; gap: 0.6rem;
      background: rgba(244,63,94,0.08);
      border: 1px solid rgba(244,63,94,0.2);
      border-radius: 10px;
      padding: 0.75rem 1rem;
      font-size: 0.875rem; color: #fda4af;
    }

    /* Responsive */
    @media (max-width: 900px) {
      .panel-grid { grid-template-columns: 1fr; }
      .arrow-connector, .compare-vs { margin: 0; }
      .sidebar { width: 200px; min-width: 200px; }
    }
    @media (max-width: 640px) {
      .sidebar { display: none; }
      .main-content { padding: 1.5rem; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  activeTab = 'convert';

  // Convert
  source = { value: 0, unit: 'INCH', measurementType: 'Length' };
  targetUnit = 'FEET';
  convertedResult: any = null;
  loadingConvert = false;
  convertError = '';

  // Compare
  q1 = { value: 1, unit: 'FEET', measurementType: 'Length' };
  q2 = { value: 12, unit: 'INCH', measurementType: 'Length' };
  compareResult: boolean | null = null;
  loadingCompare = false;
  compareError = '';

  // Arithmetic
  aq1 = { value: 5, unit: 'FEET', measurementType: 'Length' };
  aq2 = { value: 3, unit: 'FEET', measurementType: 'Length' };
  arithTargetUnit = 'FEET';
  arithResult: any = null;
  selectedOp = 'add';
  loadingArith = false;
  arithError = '';

  // History
  history: any[] = [];
  loadingHistory = false;

  quickUnits = ['INCH', 'FEET', 'CM', 'KG', 'GRAM', 'LITRE'];
  
  // All supported units organized by measurement type
  allUnits = [
    // Length
    'INCH', 'FEET', 'YARD', 'CENTIMETER', 'KM', 'KILOMETER', 'MILE',
    // Volume
    'GALLON', 'LITRE', 'ML', 'MILLILITRE',
    // Weight
    'KG', 'KILOGRAM', 'GRAM', 'MILLIGRAM', 'TONNE', 'POUND',
    // Temperature
    'CELSIUS', 'FAHRENHEIT', 'KELVIN',
    // Time
    'SECOND', 'MINUTE', 'HOUR', 'DAY', 'WEEK',
    // Area
    'SQUAREINCH', 'SQUAREFOOT', 'SQUAREMETER', 'ACRE', 'HECTARE',
    // Speed
    'KMPH', 'MPH', 'MPS', 'KNOT',
    // Energy
    'JOULE', 'CALORIE', 'KILOCALORIE', 'KILOJOULE', 'MEGAJOULE', 'GIGAJOULE', 'WATTHOUR',
    // Pressure
    'PASCAL', 'BAR', 'PSI', 'KILOPASCAL', 'ATMOSPHERE', 'TORR',
    // Angle
    'DEGREE', 'RADIAN', 'GRADIAN',
    // Power
    'WATT', 'KILOWATT', 'MEGAWATT', 'HORSEPOWER'
  ];

  unitGroups = [
    { label: 'All Units', units: this.allUnits }
  ];

  operations = [
    { key: 'add', label: 'Add', icon: '➕' },
    { key: 'subtract', label: 'Subtract', icon: '➖' },
    { key: 'multiply', label: 'Multiply', icon: '✖️' },
    { key: 'divide', label: 'Divide', icon: '➗' },
  ];

  get opSymbol() {
    const map: any = { add: '+', subtract: '–', multiply: '×', divide: '÷' };
    return map[this.selectedOp] || '+';
  }

  get tabTitle() {
    const map: any = { convert: 'Unit Conversion', compare: 'Value Comparison', arithmetic: 'Arithmetic', history: 'Measurement History' };
    return map[this.activeTab] || 'Dashboard';
  }

  get tabSubtitle() {
    const map: any = {
      convert: 'Convert any quantity between supported units instantly',
      compare: 'Check if two quantities are equal across different units',
      arithmetic: 'Add, subtract, multiply or divide quantities',
      history: 'Browse all your past calculations'
    };
    return map[this.activeTab];
  }

  get username(): string {
    const user = localStorage.getItem('user');
    if (user) {
      try { return JSON.parse(user).username || 'User'; } catch { return 'User'; }
    }
    return 'User';
  }

  get userInitial(): string {
    return this.username.charAt(0).toUpperCase();
  }

  constructor(private measurementService: MeasurementService, private authService: AuthService) {}

  ngOnInit() {
    this.loadHistory();
  }

  logout() { this.authService.logout(); }

  setHistoryTab() {
    this.activeTab = 'history';
    this.loadHistory();
  }

  performConvert() {
    this.loadingConvert = true;
    this.convertedResult = null;
    this.convertError = '';
    this.measurementService.convert(this.source, this.targetUnit).subscribe({
      next: res => { this.convertedResult = res; this.loadingConvert = false; this.loadHistory(); },
      error: err => { this.loadingConvert = false; this.convertError = this.parseError(err) || 'Conversion failed.'; }
    });
  }

  performCompare() {
    this.loadingCompare = true;
    this.compareResult = null;
    this.compareError = '';
    this.measurementService.compare(this.q1, this.q2).subscribe({
      next: res => { this.compareResult = res.areEqual ?? res.AreEqual; this.loadingCompare = false; },
      error: err => { this.loadingCompare = false; this.compareError = this.parseError(err) || 'Comparison failed.'; }
    });
  }

  performArithmetic() {
    this.loadingArith = true;
    this.arithResult = null;
    this.arithError = '';

    const opMap: any = {
      add: () => this.measurementService.add(this.aq1, this.aq2, this.arithTargetUnit),
      subtract: () => this.measurementService.subtract(this.aq1, this.aq2, this.arithTargetUnit),
      multiply: () => this.measurementService.multiply(this.aq1, this.aq2, this.arithTargetUnit),
      divide: () => this.measurementService.divide(this.aq1, this.aq2),
    };

    (opMap[this.selectedOp]?.() || opMap.add()).subscribe({
      next: (res: any) => { this.arithResult = res; this.loadingArith = false; this.loadHistory(); },
      error: (err: any) => { this.loadingArith = false; this.arithError = this.parseError(err) || 'Calculation failed.'; }
    });
  }

  loadHistory() {
    this.loadingHistory = true;
    this.measurementService.getHistory().subscribe({
      next: res => { this.history = res; this.loadingHistory = false; },
      error: () => { this.loadingHistory = false; }
    });
  }

  private parseError(err: any): string {
    if (!err) return '';
    const errorBody = err.error ?? err;

    if (typeof errorBody === 'string') {
      return errorBody;
    }

    if (errorBody.Error) {
      return errorBody.Error;
    }
    if (errorBody.error) {
      return errorBody.error;
    }
    if (errorBody.details) {
      return errorBody.details;
    }
    if (errorBody.message) {
      return errorBody.message;
    }
    if (errorBody.errors && typeof errorBody.errors === 'object') {
      return Object.values(errorBody.errors)
        .flatMap((value: any) => Array.isArray(value) ? value : [value])
        .map((item: any) => item?.toString())
        .join(' ');
    }

    return JSON.stringify(errorBody);
  }
}
