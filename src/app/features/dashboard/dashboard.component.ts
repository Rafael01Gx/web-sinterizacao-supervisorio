import { Component, inject, computed, OnInit, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { StatusBarComponent } from './components/status-bar/status-bar.component';
import { SequenceStepperComponent } from './components/sequence-stepper/sequence-stepper.component';
import { AnalogGaugesComponent } from './components/analog-gauges/analog-gauges.component';
import { DigitalStatusComponent } from './components/digital-status/digital-status.component';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { EventLogComponent } from './components/event-log/event-log.component';
import { AlarmToastComponent } from './components/alarm-toast/alarm-toast.component';
import { PlcWebSocketService } from '../../core/services/plc-websocket.service';
import { BurningApiService } from '../../core/services/burning-api.service';
import { CommandMessage } from '../../core/models/plc.models';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatusBarComponent,
    SequenceStepperComponent,
    AnalogGaugesComponent,
    DigitalStatusComponent,
    ControlPanelComponent,
    EventLogComponent,
    AlarmToastComponent
  ],
  template: `
    <div class="min-h-screen bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-[var(--font-ui)] flex flex-col relative transition-colors duration-500"
         [ngClass]="isFailed() ? 'bg-[rgba(239,68,68,0.05)]' : ''">
      
      <app-status-bar></app-status-bar>
      <app-sequence-stepper></app-sequence-stepper>

      <div class="flex-1 flex flex-col md:flex-row relative">
        <!-- Main content area for gauges and status -->
        <div class="flex-1 flex flex-col xl:flex-row min-h-0 relative">
          
          <div class="flex-[2] overflow-y-auto">
             <app-analog-gauges></app-analog-gauges>
          </div>
          
          <div class="flex-1 border-l border-[var(--color-border)] overflow-y-auto bg-[var(--color-bg-base)]">
             <app-digital-status></app-digital-status>
          </div>
          
          <!-- Offline Overlay for Gauges and Status -->
          @if (!connected() && !isInitializing()) {
            <div class="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center">
               <div class="bg-[var(--color-bg-panel)] border border-[var(--color-border)] p-6 rounded-lg flex flex-col items-center gap-4 shadow-xl">
                 <div class="w-10 h-10 border-4 border-[var(--color-accent-amber)] border-t-transparent rounded-full animate-spin"></div>
                 <span class="font-bold text-lg text-[var(--color-accent-amber)] tracking-widest font-[var(--font-ui)]">
                   PLC OFFLINE — Reconectando...
                 </span>
               </div>
            </div>
          }
          <!-- Rotating Siren for Emergency / Failure -->
          @if (isFailed()) {
            <div class="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none">
              <!-- Luz rotativa -->
              <div class="relative w-24 h-24 rounded-full bg-[var(--color-bg-base)] border-4 border-[var(--color-accent-red)] flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.6)] overflow-hidden">
                <!-- Efeito de giro (luz girando) -->
                <div class="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,rgba(239,68,68,0.8)_50%,transparent_100%)] animate-spin" style="animation-duration: 0.5s;"></div>
                
                <!-- Centro escuro para dar profundidade -->
                <div class="absolute inset-2 bg-[var(--color-bg-base)] rounded-full"></div>
                
                <!-- LED central piscando -->
                <div class="absolute w-6 h-6 bg-[var(--color-accent-red)] rounded-full animate-pulse shadow-[0_0_15px_red]"></div>
              </div>
              <span class="mt-3 font-bold text-[var(--color-accent-red)] tracking-widest uppercase font-[var(--font-ui)] bg-black/60 px-4 py-1 rounded shadow-lg backdrop-blur animate-pulse">
                EMERGÊNCIA ATIVA
              </span>
            </div>
            
            <!-- Borda piscante na tela toda -->
            <div class="absolute inset-0 z-30 pointer-events-none border-[6px] border-[var(--color-accent-red)] opacity-50 animate-pulse"></div>
          }

        </div>
      </div>

      <app-control-panel (command)="handleCommand($event)" (isEmergencyActive)="isFailed()" />
      <app-event-log></app-event-log>
      <app-alarm-toast></app-alarm-toast>

    </div>
  `
})
export class DashboardComponent {
  public plcService = inject(PlcWebSocketService);
  private apiService = inject(BurningApiService);

  connected = this.plcService.connected;
  sessionState = this.plcService.sessionState;
  alarmeEmergencia = computed(() => this.plcService.snapshot()?.digital.alarmeEmergencia);

  isFailed = computed(() => {
    const session = this.sessionState();
    console.log(this.alarmeEmergencia())
    return session?.state === 'FALHA' || this.alarmeEmergencia();
  });

  private platformId = inject(PLATFORM_ID);

  isInitializing = signal(true);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Previne o "piscar" (flicker) da tela de OFFLINE durante a hidratação inicial do navegador
      setTimeout(() => this.isInitializing.set(false), 1500);

      this.apiService.getSnapshot().subscribe({
        next: (data) => {
          if (Array.isArray(data)) {
            // Tratamento temporário caso o array retorne
          } else {
            this.plcService.snapshot.set(data);
            if (data.session) {
              this.plcService.sessionState.set(data.session);
            }

            // Se recarregar a página e já estiver em falha/emergência, criamos um alarme visual
            if (data.session?.state === 'FALHA' || data.digital?.emergenciaAcionada) {
              this.plcService.alarms.update(current => {
                if (!current.some(a => a.alarmCode === 'EMERGENCIA_ATIVA')) {
                  return [...current, {
                    alarmCode: 'EMERGENCIA_ATIVA',
                    description: 'Sistema encontra-se em estado de Emergência ou Falha.',
                    severity: 'CRITICAL',
                    timestamp: new Date().toISOString()
                  }];
                }
                return current;
              });
            }
          }
        },
        error: (err) => console.error('Erro HTTP Snapshot', err)
      });
    }
  }

  handleCommand(cmd: CommandMessage) {
    // We send via WebSocket first as primary
    this.plcService.sendCommand(cmd);

    // As a fallback, we could also call the REST API.
    // For this implementation, we will use the REST API as requested by "comunicacao STOMP over WebSocket",
    // but the backend doc says POST /api/burning/start -> 202. We'll call the REST endpoints as a dual guarantee,
    // or we can rely solely on STOMP if preferred. The instruction says "O snapshot WebSocket é a fonte de verdade",
    // and mentions REST endpoints for commands. Let's use the REST api for commands.
    switch (cmd.command) {
      case 'START':
        this.apiService.start().subscribe({ error: e => console.error(e) });
        break;
      case 'STOP':
        this.apiService.stop().subscribe({ error: e => console.error(e) });
        break;
      case 'EMERGENCY':
        this.apiService.emergency().subscribe({ error: e => console.error(e) });
        break;
      case 'RESET':
        this.apiService.reset().subscribe({ error: e => console.error(e) });
        break;
      case 'FORCE_MAIN':
        this.apiService.forceMain().subscribe({ error: e => console.error(e) });
        break;
    }
  }
}
