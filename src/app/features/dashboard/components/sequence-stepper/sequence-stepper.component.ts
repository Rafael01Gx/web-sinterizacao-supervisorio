import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlcWebSocketService } from '../../../../core/services/plc-websocket.service';
import { BurningState } from '../../../../core/models/plc.models';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroCheckCircleSolid } from '@ng-icons/heroicons/solid';
import { heroExclamationTriangle } from '@ng-icons/heroicons/outline';

const STATE_ORDER: BurningState[] = [
  'IDLE',
  'PRE_PURGA',
  'ABRE_GLP',
  'ABRE_SV01',
  'IGNICAO',
  'PILOTO_ESTAVEL',
  'ABRE_SV02',
  'QUEIMA_PLENA',
  'RESFRIAMENTO',
  'DESLIGAMENTO'
];

@Component({
  selector: 'app-sequence-stepper',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ heroCheckCircleSolid, heroExclamationTriangle })],
  template: `
    <div class="flex bg-[var(--color-bg-panel)] border-b border-[var(--color-border)] px-6 py-8 overflow-x-auto whitespace-nowrap relative min-h-full">
      <div class="flex-1 flex items-center min-w-max">
        @for (state of states; track state; let last = $last) {
          <div class="flex items-center">
            
            <div class="flex flex-col items-center gap-2 relative">
              @if (isFailed() && isCurrent(state)) {
                 <div class="w-8 h-8 rounded-full bg-[var(--color-accent-red)] flex items-center justify-center animate-pulse z-10 shadow-[0_0_12px_var(--color-accent-red)] text-[var(--color-text-value)]">
                    <ng-icon name="heroExclamationTriangle" class="text-xl"></ng-icon>
                 </div>
              } @else if (isPassed(state)) {
                 <div class="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] border-2 border-[var(--color-accent-green)] flex items-center justify-center z-10 text-[var(--color-accent-green)]">
                    <ng-icon name="heroCheckCircleSolid" class="text-2xl"></ng-icon>
                 </div>
              } @else if (isCurrent(state)) {
                 <div class="w-8 h-8 rounded-full bg-[var(--color-bg-elevated)] border-2 flex items-center justify-center z-10 animate-pulse"
                      [ngClass]="activeBorderColor()">
                    <div class="w-3 h-3 rounded-full" [ngClass]="activeBgColor()"></div>
                 </div>
              } @else {
                 <div class="w-8 h-8 rounded-full bg-[var(--color-bg-base)] border-2 border-[var(--color-border)] z-10"></div>
              }
              
              <span class="text-[10px] font-bold tracking-widest uppercase absolute top-10 font-[var(--font-ui)]"
                    [ngClass]="isCurrent(state) && !isFailed() ? activeTextColor() : (isFailed() && isCurrent(state) ? 'text-[var(--color-accent-red)]' : (isPassed(state) ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'))">
                {{ formatState(state) }}
              </span>
            </div>

            @if (!last) {
              <div class="w-16 h-1 mx-2 rounded"
                   [ngClass]="isPassed(state) ? 'bg-[var(--color-accent-blue)]' : 'bg-[var(--color-border)]'">
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class SequenceStepperComponent {
  private plcService = inject(PlcWebSocketService);

  states = STATE_ORDER;
  sessionState = this.plcService.sessionState;

  currentState = computed(() => {
    const session = this.sessionState();
    return session ? session.state : null;
  });

  isFailed = computed(() => this.currentState() === 'FALHA');

  currentIndex = computed(() => {
    const state = this.currentState();
    if (state === 'FALHA') {
      // If it's a failure, we might not know exactly where it failed from just the state, 
      // but typically the backend provides context. Here we'll just mark the whole sequence or a specific failure node.
      // For simplicity, let's assume FALHA overrides the current visual state.
      // To be safe, we might want a separate falha indicator, but let's highlight the last known state or just all gray.
      return -1; // We'll handle FALHA specially
    }
    return this.states.indexOf(state as BurningState);
  });

  isCurrent(state: BurningState): boolean {
    const curr = this.currentState();
    if (curr === 'FALHA' && state === 'IDLE') return true; // default highlight for falha if we don't know the exact step
    return state === curr;
  }

  isPassed(state: BurningState): boolean {
    if (this.isFailed()) return false;
    const index = this.states.indexOf(state);
    return index > -1 && index < this.currentIndex();
  }

  formatState(state: BurningState): string {
    return state.replace(/_/g, ' ');
  }

  activeBorderColor = computed(() => {
    const state = this.currentState();
    switch (state) {
      case 'QUEIMA_PLENA': return 'border-[var(--color-accent-orange)] shadow-[0_0_8px_var(--color-accent-orange)]';
      case 'IGNICAO':
      case 'ABRE_SV02': return 'border-[var(--color-accent-amber)] shadow-[0_0_8px_var(--color-accent-amber)]';
      case 'PILOTO_ESTAVEL': return 'border-[var(--color-accent-cyan)] shadow-[0_0_8px_var(--color-accent-cyan)]';
      default: return 'border-[var(--color-accent-blue)] shadow-[0_0_8px_var(--color-accent-blue)]';
    }
  });

  activeBgColor = computed(() => {
    const state = this.currentState();
    switch (state) {
      case 'QUEIMA_PLENA': return 'bg-[var(--color-accent-orange)]';
      case 'IGNICAO':
      case 'ABRE_SV02': return 'bg-[var(--color-accent-amber)]';
      case 'PILOTO_ESTAVEL': return 'bg-[var(--color-accent-cyan)]';
      default: return 'bg-[var(--color-accent-blue)]';
    }
  });

  activeTextColor = computed(() => {
    const state = this.currentState();
    switch (state) {
      case 'QUEIMA_PLENA': return 'text-[var(--color-accent-orange)]';
      case 'IGNICAO':
      case 'ABRE_SV02': return 'text-[var(--color-accent-amber)]';
      case 'PILOTO_ESTAVEL': return 'text-[var(--color-accent-cyan)]';
      default: return 'text-[var(--color-accent-blue)]';
    }
  });
}
