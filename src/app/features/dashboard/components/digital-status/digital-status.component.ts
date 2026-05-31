import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlcWebSocketService } from '../../../../core/services/plc-websocket.service';
import { StatusIndicatorComponent } from '../../../../shared/components/status-indicator/status-indicator.component';

@Component({
  selector: 'app-digital-status',
  standalone: true,
  imports: [CommonModule, StatusIndicatorComponent],
  host: { class: 'block w-full h-full' },
  template: `
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
      @if (digital()) {
        <app-status-indicator label="Válvula GLP" icon="heroAcademicCap" color="green" [active]="digital()!.valvulaGlpAberta"></app-status-indicator>
        <app-status-indicator label="Válvula SV-01" icon="heroAcademicCap" color="green" [active]="digital()!.valvula01Aberta"></app-status-indicator>
        <app-status-indicator label="Válvula SV-02" icon="heroAcademicCap" color="orange" [active]="digital()!.valvula02Aberta"></app-status-indicator>
        <app-status-indicator label="Cx. de Vento" icon="heroArrowUpCircle" color="blue" [active]="digital()!.valvulaCxVentoAberta"></app-status-indicator>
        <app-status-indicator label="Soprador" icon="heroArrowPath" color="blue" [active]="digital()!.sopradorLigado"></app-status-indicator>
        <app-status-indicator label="Chama Piloto" icon="heroFire" color="cyan" [active]="digital()!.queimadorPilotoAceso"></app-status-indicator>
        <app-status-indicator label="Chama Principal" icon="heroFire" color="orange" [active]="digital()!.queimadorPrincipalAceso"></app-status-indicator>
        <app-status-indicator label="Piloto Acesso" icon="heroLockOpen" color="green" [active]="digital()!.pilotoAcesso"></app-status-indicator>
        <app-status-indicator label="Emergência" icon="heroExclamationCircle" color="red" [active]="digital()!.emergenciaAcionada"></app-status-indicator>
        <app-status-indicator label="Defeito" icon="heroExclamationTriangle" color="amber" [active]="digital()!.defeito"></app-status-indicator>
        <app-status-indicator label="Alarme" icon="heroBellAlert" color="red" [active]="digital()!.alarmeEmergencia"></app-status-indicator>
        <app-status-indicator label="Selo Sint." icon="heroCheckCircle" color="green" [active]="digital()!.seloTempoSinterizacao"></app-status-indicator>
      } @else {
        @for (i of [1,2,3,4,5,6,7,8,9,10,11,12]; track i) {
           <div class="bg-[var(--color-bg-panel)] rounded border border-[var(--color-border)] h-24 animate-pulse"></div>  
        }
      }
    </div>
  `
})
export class DigitalStatusComponent {
  private plcService = inject(PlcWebSocketService);

  digital = computed(() => {
    const snap = this.plcService.snapshot();
    return snap ? snap.digital : null;
  });
}
