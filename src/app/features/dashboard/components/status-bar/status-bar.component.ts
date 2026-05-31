import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlcWebSocketService } from '../../../../core/services/plc-websocket.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroWifi,
  heroPlayCircle,
  heroExclamationTriangle,
  heroCheckCircle,
  heroFire,
  heroBolt,
  heroStopCircle,
  heroPauseCircle
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      heroWifi,
      heroPlayCircle,
      heroExclamationTriangle,
      heroCheckCircle,
      heroFire,
      heroBolt,
      heroStopCircle,
      heroPauseCircle
    })
  ],
  template: `
    <div class="h-14 bg-[var(--color-bg-panel)] border-b border-[var(--color-border)] flex items-center justify-between px-6 sticky top-0 z-40">
      <div class="flex items-center gap-4">
        <span class="font-[var(--font-mono)] font-bold text-lg tracking-widest text-[var(--color-text-primary)]">
          SINTER PILOTO
        </span>
      </div>

      <div class="flex items-center">
        <div class="flex items-center px-4 py-1.5 rounded-full border" [ngClass]="stateClasses()">
          <ng-icon [name]="stateIcon()" class="mr-2 text-xl"></ng-icon>
          <span class="font-[var(--font-ui)] font-bold text-sm tracking-wide">
            {{ stateLabel() }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <span class="font-[var(--font-mono)] text-xs text-[var(--color-text-muted)]">
          {{ lastUpdate() | date:'HH:mm:ss.SSS' }}
        </span>
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full" [ngClass]="connected() ? 'bg-[var(--color-accent-green)] shadow-[0_0_8px_var(--color-accent-green)]' : 'bg-[var(--color-accent-red)] animate-pulse shadow-[0_0_8px_var(--color-accent-red)]'"></div>
          <span class="font-[var(--font-ui)] font-bold text-xs tracking-wider"
                [ngClass]="connected() ? 'text-[var(--color-accent-green)]' : 'text-[var(--color-accent-red)]'">
            {{ connected() ? 'ONLINE' : 'OFFLINE' }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class StatusBarComponent {
  private plcService = inject(PlcWebSocketService);

  connected = this.plcService.connected;
  sessionState = this.plcService.sessionState;
  snapshot = this.plcService.snapshot;

  lastUpdate = computed(() => {
    const snap = this.snapshot();
    return snap ? snap.timestamp : null;
  });

  stateLabel = computed(() => {
    const session = this.sessionState();
    return session ? session.state.replace(/_/g, ' ') : 'AGUARDANDO';
  });

  stateClasses = computed(() => {
    const session = this.sessionState();
    if (!session) return 'bg-[var(--color-bg-base)] border-[var(--color-border)] text-[var(--color-text-muted)]';

    switch (session.state) {
      case 'IDLE':
        return 'bg-[var(--color-bg-base)] border-[var(--color-border)] text-[var(--color-text-secondary)]';
      case 'PRE_PURGA':
      case 'ABRE_GLP':
      case 'ABRE_SV01':
      case 'DESLIGAMENTO':
      case 'RESFRIAMENTO':
        return 'bg-[rgba(59,130,246,0.1)] border-[var(--color-accent-blue)] text-[var(--color-accent-blue)]';
      case 'IGNICAO':
        return 'bg-[rgba(245,158,11,0.1)] border-[var(--color-accent-amber)] text-[var(--color-accent-amber)] animate-pulse';
      case 'PILOTO_ESTAVEL':
        return 'bg-[rgba(6,182,212,0.1)] border-[var(--color-accent-cyan)] text-[var(--color-accent-cyan)]';
      case 'ABRE_SV02':
        return 'bg-[rgba(245,158,11,0.1)] border-[var(--color-accent-amber)] text-[var(--color-accent-amber)]';
      case 'QUEIMA_PLENA':
        return 'bg-[rgba(249,115,22,0.1)] border-[var(--color-accent-orange)] text-[var(--color-accent-orange)]';
      case 'FALHA':
        return 'bg-[rgba(239,68,68,0.1)] border-[var(--color-accent-red)] text-[var(--color-accent-red)] animate-pulse';
      default:
        return 'bg-[var(--color-bg-base)] border-[var(--color-border)] text-[var(--color-text-secondary)]';
    }
  });

  stateIcon = computed(() => {
    const session = this.sessionState();
    if (!session) return 'heroPauseCircle';
    switch (session.state) {
      case 'IDLE': return 'heroPauseCircle';
      case 'FALHA': return 'heroExclamationTriangle';
      case 'QUEIMA_PLENA': return 'heroFire';
      case 'IGNICAO': return 'heroBolt';
      case 'PILOTO_ESTAVEL': return 'heroFire';
      case 'DESLIGAMENTO':
      case 'RESFRIAMENTO': return 'heroStopCircle';
      default: return 'heroPlayCircle';
    }
  });
}
