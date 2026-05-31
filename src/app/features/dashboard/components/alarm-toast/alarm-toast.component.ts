import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlcWebSocketService } from '../../../../core/services/plc-websocket.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroXMark,
  heroInformationCircle,
  heroExclamationTriangle,
  heroExclamationCircle,
  heroFire
} from '@ng-icons/heroicons/outline';
import { AlarmEvent } from '../../../../core/models/plc.models';

@Component({
  selector: 'app-alarm-toast',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      heroXMark,
      heroInformationCircle,
      heroExclamationTriangle,
      heroExclamationCircle,
      heroFire
    })
  ],
  template: `
    @defer {
      <div class="fixed top-20 right-6 z-50 flex flex-col gap-3 w-96 pointer-events-none">
        @for (alarm of alarms(); track alarm.timestamp + alarm.alarmCode) {
          <div class="pointer-events-auto flex items-start gap-3 p-4 rounded border shadow-lg backdrop-blur-sm bg-[var(--color-bg-panel)] opacity-95 transition-all duration-300 translate-x-0"
               [ngClass]="severityClasses(alarm.severity)">
            
            <ng-icon [name]="severityIcon(alarm.severity)" class="text-2xl mt-0.5 shrink-0"
                     [ngClass]="alarm.severity === 'CRITICAL' ? 'animate-pulse' : ''"></ng-icon>
            
            <div class="flex-1 min-w-0">
              <div class="flex justify-between items-start mb-1">
                <span class="font-bold font-[var(--font-ui)] text-sm tracking-wide truncate pr-2">
                  {{ alarm.alarmCode }}
                </span>
                <span class="text-xs font-[var(--font-mono)] opacity-70 shrink-0">
                  {{ alarm.timestamp | date:'HH:mm:ss' }}
                </span>
              </div>
              <p class="text-sm font-[var(--font-ui)] opacity-90 leading-snug">
                {{ alarm.description }}
              </p>
            </div>

            <button 
              (click)="dismiss(alarm)"
              class="p-1 rounded opacity-60 hover:opacity-100 hover:bg-black/10 transition-all shrink-0">
              <ng-icon name="heroXMark" class="text-xl"></ng-icon>
            </button>
          </div>
        }
      </div>
    }
  `
})
export class AlarmToastComponent {
  private plcService = inject(PlcWebSocketService);

  alarms = this.plcService.alarms;

  constructor() {
    effect(() => {
      // Logic for auto-dismiss could go here, but doing it safely inside a signal effect 
      // without triggering infinite loops requires care.
      // Better to handle it in the service or via RxJS. For now we will use a simple timeout approach in component.
      // We will iterate over new alarms and set timeouts for LOW/MEDIUM.
      const currentAlarms = this.alarms();
      currentAlarms.forEach(alarm => {
        if (!this.activeTimers.has(alarm.timestamp + alarm.alarmCode)) {
          if (alarm.severity === 'LOW' || alarm.severity === 'MEDIUM') {
            const timerId = setTimeout(() => {
              this.dismiss(alarm);
            }, 10000);
            this.activeTimers.set(alarm.timestamp + alarm.alarmCode, timerId);
          } else {
            // We mark it as tracked so we don't process again, but no timer
            this.activeTimers.set(alarm.timestamp + alarm.alarmCode, null);

            if (alarm.severity === 'CRITICAL') {
              this.playCriticalSound();
            }
          }
        }
      });
    });
  }

  private activeTimers = new Map<string, any>();

  dismiss(alarm: AlarmEvent): void {
    const key = alarm.timestamp + alarm.alarmCode;
    const timer = this.activeTimers.get(key);
    if (timer) clearTimeout(timer);
    this.activeTimers.delete(key);

    this.plcService.removeAlarm(alarm.alarmCode, alarm.timestamp);
  }

  severityClasses(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'border-[var(--color-accent-red)] text-[var(--color-accent-red)] shadow-[0_0_15px_rgba(239,68,68,0.2)]';
      case 'HIGH': return 'border-[var(--color-accent-orange)] text-[var(--color-accent-orange)]';
      case 'MEDIUM': return 'border-[var(--color-accent-amber)] text-[var(--color-accent-amber)]';
      default: return 'border-[var(--color-accent-blue)] text-[var(--color-accent-blue)]';
    }
  }

  severityIcon(severity: string): string {
    switch (severity) {
      case 'CRITICAL': return 'heroFire';
      case 'HIGH': return 'heroExclamationCircle';
      case 'MEDIUM': return 'heroExclamationTriangle';
      default: return 'heroInformationCircle';
    }
  }

  private playCriticalSound(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.setValueAtTime(1108.73, audioCtx.currentTime + 0.1); // C#6

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      // Ignore audio errors if not interacted or not supported
    }
  }
}
