import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroAcademicCap,
  heroArrowUpCircle,
  heroArrowPath,
  heroFire,
  heroLockOpen,
  heroExclamationCircle,
  heroExclamationTriangle,
  heroBellAlert,
  heroCheckCircle
} from '@ng-icons/heroicons/outline';

export type StatusColor = 'green' | 'orange' | 'blue' | 'cyan' | 'red' | 'amber';

@Component({
  selector: 'app-status-indicator',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  providers: [
    provideIcons({
      heroAcademicCap,
      heroArrowUpCircle,
      heroArrowPath,
      heroFire,
      heroLockOpen,
      heroExclamationCircle,
      heroExclamationTriangle,
      heroBellAlert,
      heroCheckCircle
    })
  ],
  template: `
    <div 
      class="rounded p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 ease-in-out border text-center h-24"
      [ngClass]="active() ? activeClasses() : 'bg-[var(--color-bg-panel)] border-[var(--color-border)] text-[var(--color-text-muted)]'">
      
      <ng-icon 
        [name]="icon()" 
        class="text-3xl transition-all duration-200"
        [style.filter]="active() ? 'drop-shadow(0 0 6px var(' + cssColorVar() + '))' : 'none'"
      ></ng-icon>
      
      <span class="text-xs font-bold leading-tight font-[var(--font-ui)]"
            [ngClass]="active() ? 'text-[var(--color-text-primary)]' : ''">
        {{ label() }}
      </span>
    </div>
  `
})
export class StatusIndicatorComponent {
  active = input.required<boolean>();
  label = input.required<string>();
  icon = input.required<string>();
  color = input.required<StatusColor>();

  cssColorVar = computed(() => {
    switch (this.color()) {
      case 'green': return '--color-accent-green';
      case 'orange': return '--color-accent-orange';
      case 'blue': return '--color-accent-blue';
      case 'cyan': return '--color-accent-cyan';
      case 'red': return '--color-accent-red';
      case 'amber': return '--color-accent-amber';
    }
  });

  activeClasses = computed(() => {
    const base = 'bg-[var(--color-bg-elevated)] text-[var(' + this.cssColorVar() + ')] ';
    switch (this.color()) {
      case 'green': return base + 'border-[var(--color-accent-green)]';
      case 'orange': return base + 'border-[var(--color-accent-orange)]';
      case 'blue': return base + 'border-[var(--color-accent-blue)]';
      case 'cyan': return base + 'border-[var(--color-accent-cyan)]';
      case 'red': return base + 'border-[var(--color-accent-red)] animate-pulse';
      case 'amber': return base + 'border-[var(--color-accent-amber)] animate-pulse';
    }
  });
}
