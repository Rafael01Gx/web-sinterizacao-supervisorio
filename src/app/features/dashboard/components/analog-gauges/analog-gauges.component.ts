import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlcWebSocketService } from '../../../../core/services/plc-websocket.service';
import { GaugeComponent } from '../../../../shared/components/gauge/gauge.component';

@Component({
  selector: 'app-analog-gauges',
  standalone: true,
  imports: [CommonModule, GaugeComponent],
  host: { class: 'block w-full h-full' },
  template: `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      @if (analogic()) {
        <app-gauge [value]="analogic()!.temperaturaRefratario" label="Temp. Refratário" unit="°C" [max]="1000" [warnAt]="700" [critAt]="900"></app-gauge>
        <app-gauge [value]="analogic()!.temperaturaIgnicao" label="Temp. Ignição" unit="°C" [max]="400" [warnAt]="250" [critAt]="350"></app-gauge>
        <app-gauge [value]="analogic()!.temperaturaCxVento" label="Temp. Cx. Vento" unit="°C" [max]="1000" [warnAt]="600" [critAt]="analogic()!.temperaturaCxVentoMax"></app-gauge>
        <app-gauge [value]="analogic()!.pressaoGlp" label="Pressão GLP" unit="bar" [max]="5" [warnAt]="3.5" [critAt]="4.5"></app-gauge>
        <app-gauge [value]="analogic()!.vazaoGlp" label="Vazão GLP" unit="Nm³/h" [max]="15" [warnAt]="12" [critAt]="14"></app-gauge>
        <app-gauge [value]="analogic()!.pressaoGases" label="Pressão Gases" unit="bar" [max]="2" [warnAt]="1.5" [critAt]="1.8"></app-gauge>
        <app-gauge [value]="analogic()!.vazaoAr" label="Vazão Ar" unit="Nm³/h" [max]="50" [warnAt]="40" [critAt]="46"></app-gauge>
        <app-gauge [value]="analogic()!.tempoParcialSinterizacao" label="Tempo Sinterização" unit="s" [max]="analogic()!.tempoSinterizacao" [warnAt]="analogic()!.tempoSinterizacao * 0.8" [critAt]="analogic()!.tempoSinterizacao"></app-gauge>
      } @else {
        @for (i of [1,2,3,4,5,6,7,8]; track i) {
           <div class="bg-[var(--color-bg-panel)] rounded-2xl p-5 border border-[var(--color-border)] h-32 animate-pulse shadow-sm"></div>
        }
      }
    </div>
  `
})
export class AnalogGaugesComponent {
  private plcService = inject(PlcWebSocketService);

  analogic = computed(() => {
    const snap = this.plcService.snapshot();
    return snap ? snap.analogic : null;
  });
}
