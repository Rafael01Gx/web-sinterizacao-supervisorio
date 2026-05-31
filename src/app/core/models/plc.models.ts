export interface SnapshotMessage {
  timestamp: string;
  plcConnected: boolean;
  session: SessionInfo | null;
  analogic: AnalogicData;
  digital: DigitalStatus;
}

export interface AnalogicData {
  temperaturaRefratario: number;
  temperaturaIgnicao: number;
  temperaturaCxVento: number;
  temperaturaCxVentoMax: number;
  pressaoGlp: number;
  vazaoGlp: number;
  pressaoGases: number;
  vazaoAr: number;
  tempoSinterizacao: number;
  tempoParcialSinterizacao: number;
  tempoResfriamento: number;
}

export interface DigitalStatus {
  valvulaGlpFechada: boolean;
  valvulaGlpAberta: boolean;
  valvula01Fechada: boolean;
  valvula01Aberta: boolean;
  valvula02Fechada: boolean;
  valvula02Aberta: boolean;
  valvulaCxVentoFechada: boolean;
  valvulaCxVentoAberta: boolean;
  queimadorPilotoAceso: boolean;
  queimadorPrincipalAceso: boolean;
  sopradorLigado: boolean;
  emergenciaAcionada: boolean;
  defeito: boolean;
  alarmeEmergencia: boolean;
  pilotoAcesso: boolean;
  seloTempoSinterizacao: boolean;
}

export interface SessionInfo {
  sessionId: string;
  state: BurningState;
  startedAt: string;
  active: boolean;
}

export type BurningState =
  | 'IDLE'
  | 'PRE_PURGA'
  | 'ABRE_GLP'
  | 'ABRE_SV01'
  | 'IGNICAO'
  | 'PILOTO_ESTAVEL'
  | 'ABRE_SV02'
  | 'QUEIMA_PLENA'
  | 'DESLIGAMENTO'
  | 'RESFRIAMENTO'
  | 'FALHA';

export interface LogEvent {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  state: BurningState | null;
}

export interface AlarmEvent {
  timestamp: string;
  alarmCode: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface CommandMessage {
  command: 'START' | 'STOP' | 'EMERGENCY' | 'RESET' | 'FORCE_MAIN';
  params?: Record<string, unknown>;
}
