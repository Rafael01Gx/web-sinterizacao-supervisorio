import { Component, output, inject, computed, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlcWebSocketService } from '../../../../core/services/plc-websocket.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPlayCircle,
  heroStopCircle,
  heroBolt,
  heroArrowPath,
  heroExclamationCircle
} from '@ng-icons/heroicons/outline';
import { CommandMessage } from '../../../../core/models/plc.models';

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      heroPlayCircle,
      heroStopCircle,
      heroBolt,
      heroArrowPath,
      heroExclamationCircle
    })
  ],
  template: `
    <div class="flex flex-wrap justify-center gap-4 p-6 border-t border-[var(--color-border)] bg-[var(--color-bg-base)]">
      
      <button 
        class="flex items-center gap-2 px-6 py-3 rounded font-bold font-[var(--font-ui)] tracking-wider transition-all duration-200"
        [ngClass]="canStart() ? 'bg-[var(--color-accent-green)] text-[var(--color-bg-base)] hover:brightness-110 shadow-[0_0_12px_rgba(34,197,94,0.3)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed'"
        [disabled]="!canStart()"
        (click)="emitCommand('START')">
        @if (pendingCommand() === 'START') {
           <ng-icon name="heroArrowPath" class="text-2xl animate-spin"></ng-icon> PROCESSANDO...
        } @else {
           <ng-icon name="heroPlayCircle" class="text-2xl"></ng-icon> INICIAR QUEIMA
        }
      </button>

      <button 
        class="flex items-center gap-2 px-6 py-3 rounded font-bold font-[var(--font-ui)] tracking-wider transition-all duration-200"
        [ngClass]="canStop() ? 'bg-[var(--color-accent-amber)] text-[var(--color-bg-base)] hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed'"
        [disabled]="!canStop()"
        (click)="emitCommand('STOP')">
        @if (pendingCommand() === 'STOP') {
           <ng-icon name="heroArrowPath" class="text-2xl animate-spin"></ng-icon> PROCESSANDO...
        } @else {
           <ng-icon name="heroStopCircle" class="text-2xl"></ng-icon> FINALIZAR
        }
      </button>

      <button 
        class="flex items-center gap-2 px-6 py-3 rounded font-bold font-[var(--font-ui)] tracking-wider transition-all duration-200"
        [ngClass]="canForceMain() ? 'bg-[var(--color-accent-blue)] text-[var(--color-bg-base)] hover:brightness-110 shadow-[0_0_12px_rgba(59,130,246,0.3)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed'"
        [disabled]="!canForceMain()"
        (click)="emitCommand('FORCE_MAIN')">
        @if (pendingCommand() === 'FORCE_MAIN') {
           <ng-icon name="heroArrowPath" class="text-2xl animate-spin"></ng-icon> PROCESSANDO...
        } @else {
           <ng-icon name="heroBolt" class="text-2xl"></ng-icon> FORÇAR PRINCIPAL
        }
      </button>

      <button 
        class="flex items-center gap-2 px-6 py-3 rounded font-bold font-[var(--font-ui)] tracking-wider transition-all duration-200"
        [ngClass]="canReset() ? 'bg-[var(--color-text-muted)] text-[var(--color-text-value)] hover:brightness-110' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed'"
        [disabled]="!canReset()"
        (click)="emitCommand('RESET')">
        @if (pendingCommand() === 'RESET') {
           <ng-icon name="heroArrowPath" class="text-2xl animate-spin"></ng-icon> PROCESSANDO...
        } @else {
           <ng-icon name="heroArrowPath" class="text-2xl"></ng-icon> RESET
        }
      </button>

      <div class="relative">
         <button 
           class="flex items-center gap-2 px-8 py-3 rounded font-bold font-[var(--font-ui)] tracking-wider transition-all duration-200"
           [ngClass]="canEmergency() ? 'bg-[var(--color-accent-red)] text-[var(--color-bg-base)] hover:brightness-110 shadow-[0_0_16px_rgba(239,68,68,0.5)]' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed'"
           [disabled]="!canEmergency()"
           (mousedown)="startEmergencyTimer()"
           (mouseup)="cancelEmergencyTimer()"
           (mouseleave)="cancelEmergencyTimer()"
           (touchstart)="startEmergencyTimer()"
           (touchend)="cancelEmergencyTimer()">
           @if (pendingCommand() === 'EMERGENCY') {
              <ng-icon name="heroArrowPath" class="text-2xl animate-spin"></ng-icon> PROCESSANDO...
           } @else {
              <ng-icon name="heroExclamationCircle" class="text-2xl"></ng-icon> EMERGÊNCIA (SEGURE)
           }
         </button>
         
         @if (emergencyProgress() > 0 && pendingCommand() !== 'EMERGENCY') {
           <div class="absolute bottom-0 left-0 h-1 bg-[var(--color-text-value)] rounded-b transition-all duration-100" [ngStyle]="{'width': emergencyProgress() + '%'}"></div>
         }
      </div>

    </div>
  `
})
export class ControlPanelComponent {
  private plcService = inject(PlcWebSocketService);

  command = output<CommandMessage>();
  isEmergencyActive = input<boolean>();

  sessionState = this.plcService.sessionState;
  connected = this.plcService.connected;

  emergencyProgress = signal(0);
  private emergencyTimer: any = null;
  private readonly EMERGENCY_HOLD_MS = 2000;
  private readonly EMERGENCY_INTERVAL = 50;

  pendingCommand = signal<string | null>(null);

  canStart = computed(() => {
    const session = this.sessionState();
    return this.connected() && (!session || session.state === 'IDLE') && !this.pendingCommand();
  });

  canStop = computed(() => {
    const session = this.sessionState();
    return this.connected() && session && (session.state === 'QUEIMA_PLENA' || session.state === 'PILOTO_ESTAVEL') && !this.pendingCommand();
  });

  canForceMain = computed(() => {
    const session = this.sessionState();
    return this.connected() && session && session.state === 'PILOTO_ESTAVEL' && !this.pendingCommand();
  });

  canReset = computed(() => {
    const session = this.sessionState();
    return this.connected() && session && session.state === 'FALHA' && !this.pendingCommand() || !this.isEmergencyActive();
  });

  canEmergency = computed(() => {
    return this.connected() && !this.pendingCommand();
  });

  emitCommand(cmd: CommandMessage['command']): void {
    if (this.pendingCommand()) return;
    this.pendingCommand.set(cmd);
    this.command.emit({ command: cmd });

    // Libera o botão após 2 segundos (tempo suficiente para a API/PLC responder)
    setTimeout(() => {
      this.pendingCommand.set(null);
    }, 2000);
  }

  startEmergencyTimer(): void {
    if (!this.canEmergency()) return;
    this.emergencyProgress.set(0);

    let elapsed = 0;
    this.emergencyTimer = setInterval(() => {
      elapsed += this.EMERGENCY_INTERVAL;
      const progress = Math.min((elapsed / this.EMERGENCY_HOLD_MS) * 100, 100);
      this.emergencyProgress.set(progress);

      if (progress >= 100) {
        clearInterval(this.emergencyTimer);
        this.emitCommand('EMERGENCY');
        this.emergencyProgress.set(0);
      }
    }, this.EMERGENCY_INTERVAL);
  }

  cancelEmergencyTimer(): void {
    if (this.emergencyTimer) {
      clearInterval(this.emergencyTimer);
      this.emergencyTimer = null;
    }
    this.emergencyProgress.set(0);
  }
}
