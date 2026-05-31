import { Component, inject, ViewChild, ElementRef, effect, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlcWebSocketService } from '../../../../core/services/plc-websocket.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { heroTrash } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-event-log',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [provideIcons({ heroTrash })],
  template: `
    <div class="flex flex-col h-[250px] bg-[var(--color-bg-base)] border-t border-[var(--color-border)] relative">
      <div class="flex items-center justify-between px-4 py-2 bg-[var(--color-bg-panel)] border-b border-[var(--color-border)]">
        <span class="text-xs font-bold text-[var(--color-text-secondary)] font-[var(--font-ui)] tracking-widest uppercase">
          LOG DE EVENTOS
        </span>
        <button 
          (click)="clearLogs()"
          class="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1"
          title="Limpar Log">
          <ng-icon name="heroTrash"></ng-icon>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 font-[var(--font-mono)] text-sm space-y-1" #logContainer>
        @defer (on viewport) {
          @for (log of logs(); track log.timestamp) {
            <div class="flex items-start gap-4 hover:bg-[var(--color-bg-elevated)] px-2 py-1 rounded transition-colors"
                 [ngClass]="levelClasses(log.level)">
              <span class="text-[var(--color-text-muted)] whitespace-nowrap">
                [{{ log.timestamp | date:'HH:mm:ss' }}]
              </span>
              <span class="font-bold w-12 shrink-0">
                {{ log.level }}
              </span>
              @if (log.state) {
                <span class="text-[var(--color-text-muted)] w-32 shrink-0">
                   [{{ formatState(log.state) }}]
                </span>
              }
              <span class="flex-1 text-[var(--color-text-primary)]">
                {{ log.message }}
              </span>
            </div>
          } @empty {
            <div class="text-[var(--color-text-muted)] text-center italic mt-4">
               Nenhum evento registrado.
            </div>
          }
        } @placeholder {
          <div class="flex items-center justify-center h-full text-[var(--color-text-muted)]">
            Aguardando visibilidade do painel...
          </div>
        }
      </div>
    </div>
  `
})
export class EventLogComponent implements AfterViewChecked {
  private plcService = inject(PlcWebSocketService);

  logs = this.plcService.logs;

  @ViewChild('logContainer') private logContainer!: ElementRef;
  private shouldScroll = false;

  constructor() {
    effect(() => {
      // Trigger when logs change to queue a scroll down
      const currentLogs = this.logs();
      if (currentLogs.length > 0) {
        this.shouldScroll = true;
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.logContainer) {
      try {
        this.logContainer.nativeElement.scrollTop = this.logContainer.nativeElement.scrollHeight;
      } catch (err) { }
      this.shouldScroll = false;
    }
  }

  clearLogs(): void {
    this.plcService.clearLogs();
  }

  levelClasses(level: string): string {
    switch (level) {
      case 'ERROR': return 'text-[var(--color-accent-red)]';
      case 'WARN': return 'text-[var(--color-accent-amber)]';
      default: return 'text-[var(--color-text-secondary)]';
    }
  }

  formatState(state: string): string {
    return state.replace(/_/g, ' ');
  }
}
