import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="group relative flex flex-col justify-between p-5 rounded-2xl border border-[var(--color-border)] overflow-hidden transition-all duration-300 hover:border-[var(--color-border-active)] hover:shadow-xl hover:-translate-y-0.5"
         [ngClass]="backgroundGlowClass()">
      
      <!-- Subtle gradient background -->
      <div class="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none"></div>

      <!-- Header: Label + Min/Max -->
      <div class="flex justify-between items-start mb-4 z-10">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
            {{ label() }}
          </span>
          <span class="text-[10px] text-[var(--color-text-muted)] font-mono bg-black/40 px-1.5 py-0.5 rounded-sm self-start shadow-inner">
            {{ min() }} ~ {{ max() }} {{ unit() }}
          </span>
        </div>
        
        <!-- Status Dot -->
        <div class="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" [ngClass]="dotColorClass()"></div>
      </div>

      <!-- Value Display -->
      <div class="flex items-end gap-1.5 mb-5 z-10 mt-2">
        <span class="text-4xl font-black tabular-nums tracking-tight font-[var(--font-mono)] leading-none drop-shadow-md"
              [ngClass]="textColorClass()">
          {{ isNaN(value()) ? '--' : (value() | number:'1.0-1') }}
        </span>
        <span class="text-sm font-bold text-[var(--color-text-secondary)] mb-0.5">
          {{ unit() }}
        </span>
      </div>

      <!-- Modern Glow Progress Bar -->
      <div class="relative w-full h-2.5 bg-black/50 rounded-full overflow-visible z-10 shadow-inner">
        <!-- Ticks / Markers (Warn / Crit) -->
        @if (warnAt() !== null) {
          <div class="absolute top-0 bottom-0 w-0.5 bg-[var(--color-accent-amber)]/70 z-20 transition-all" 
               [ngStyle]="{'left': warnPercent() + '%'}"></div>
        }
        @if (critAt() !== null) {
          <div class="absolute top-0 bottom-0 w-0.5 bg-[var(--color-accent-red)]/70 z-20 transition-all" 
               [ngStyle]="{'left': critPercent() + '%'}"></div>
        }

        <!-- Fill -->
        <div class="absolute top-0 bottom-0 left-0 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_currentColor]"
             [ngStyle]="{'width': percentage() + '%'}"
             [ngClass]="progressBarColorClass()">
          
          <!-- Thumb / Head of the progress -->
          <div class="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_8px_white] border-2" [ngClass]="thumbBorderClass()"></div>
        </div>
      </div>
    </div>
  `
})
export class GaugeComponent {
  value = input.required<number>();
  label = input.required<string>();
  unit = input.required<string>();
  min = input<number>(0);
  max = input.required<number>();
  warnAt = input<number | null>(null);
  critAt = input<number | null>(null);

  isNaN(val: number): boolean {
    return Number.isNaN(val) || val === undefined || val === null;
  }

  percentage = computed(() => {
    if (this.isNaN(this.value())) return 0;
    const minVal = this.min();
    const maxVal = this.max();
    const current = Math.max(minVal, Math.min(maxVal, this.value()));
    return ((current - minVal) / (maxVal - minVal)) * 100;
  });

  warnPercent = computed(() => {
    const w = this.warnAt();
    if (w === null) return 0;
    return ((w - this.min()) / (this.max() - this.min())) * 100;
  });

  critPercent = computed(() => {
    const c = this.critAt();
    if (c === null) return 0;
    return ((c - this.min()) / (this.max() - this.min())) * 100;
  });

  statusState = computed(() => {
    if (this.isNaN(this.value())) return 'UNKNOWN';
    const val = this.value();
    const crit = this.critAt();
    const warn = this.warnAt();

    if (crit !== null && val >= crit) return 'CRITICAL';
    if (warn !== null && val >= warn) return 'WARNING';
    return 'OK';
  });

  backgroundGlowClass = computed(() => {
    switch (this.statusState()) {
      case 'CRITICAL': return 'bg-[var(--color-bg-panel)] shadow-[inset_0_0_40px_rgba(239,68,68,0.15)] border-[var(--color-accent-red)]/30';
      case 'WARNING': return 'bg-[var(--color-bg-panel)] shadow-[inset_0_0_40px_rgba(245,158,11,0.1)] border-[var(--color-accent-amber)]/30';
      default: return 'bg-[var(--color-bg-panel)] shadow-sm';
    }
  });

  dotColorClass = computed(() => {
    switch (this.statusState()) {
      case 'CRITICAL': return 'text-[var(--color-accent-red)] bg-[var(--color-accent-red)] animate-pulse';
      case 'WARNING': return 'text-[var(--color-accent-amber)] bg-[var(--color-accent-amber)]';
      case 'OK': return 'text-[var(--color-accent-green)] bg-[var(--color-accent-green)]';
      default: return 'text-[var(--color-text-muted)] bg-[var(--color-text-muted)]';
    }
  });

  textColorClass = computed(() => {
    switch (this.statusState()) {
      case 'CRITICAL': return 'text-[var(--color-accent-red)]';
      case 'WARNING': return 'text-[var(--color-accent-amber)]';
      default: return 'text-[var(--color-text-value)]';
    }
  });

  progressBarColorClass = computed(() => {
    switch (this.statusState()) {
      case 'CRITICAL': return 'bg-[var(--color-accent-red)] text-[var(--color-accent-red)]';
      case 'WARNING': return 'bg-[var(--color-accent-amber)] text-[var(--color-accent-amber)]';
      default: return 'bg-[var(--color-accent-blue)] text-[var(--color-accent-blue)]';
    }
  });

  thumbBorderClass = computed(() => {
    switch (this.statusState()) {
      case 'CRITICAL': return 'border-[var(--color-accent-red)]';
      case 'WARNING': return 'border-[var(--color-accent-amber)]';
      default: return 'border-[var(--color-accent-blue)]';
    }
  });
}
