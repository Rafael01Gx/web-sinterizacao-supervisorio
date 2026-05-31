import { Injectable, signal, DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Client } from '@stomp/stompjs';
import { environment } from '../../../environments/environment';
import {
  SnapshotMessage,
  SessionInfo,
  LogEvent,
  AlarmEvent,
  CommandMessage,
} from '../models/plc.models';

@Injectable({
  providedIn: 'root',
})
export class PlcWebSocketService {
  readonly snapshot = signal<SnapshotMessage | null>(null);
  readonly sessionState = signal<SessionInfo | null>(null);
  readonly logs = signal<LogEvent[]>([]);
  readonly alarms = signal<AlarmEvent[]>([]);
  readonly connected = signal<boolean>(false);

  private client: Client | null = null;
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.client = new Client({
        brokerURL: environment.wsUrl,
        reconnectDelay: 3000,
        onConnect: () => {
          this.connected.set(true);

          if (this.client) {
            // Subscriptions
            this.client.subscribe('/topic/plc/snapshot', (message) => {
              if (message.body) {
                const data: SnapshotMessage = JSON.parse(message.body);
                this.snapshot.set(data);
                if (data.session) {
                  this.sessionState.set(data.session);
                }
              }
            });

            this.client.subscribe('/topic/plc/session', (message) => {
              if (message.body) {
                const data: SessionInfo = JSON.parse(message.body);
                this.sessionState.set(data);
              }
            });

            this.client.subscribe('/topic/plc/log', (message) => {
              if (message.body) {
                const data: LogEvent = JSON.parse(message.body);
                this.logs.update((current) => {
                  const updated = [...current, data];
                  return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
                });
              }
            });

            this.client.subscribe('/user/queue/errors', (message) => {
              if (message.body) {
                const data: LogEvent = JSON.parse(message.body);
                this.logs.update((current) => {
                  const updated = [...current, data];
                  return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
                });
              }
            });

            this.client.subscribe('/topic/plc/alarm', (message) => {
              if (message.body) {
                const data: AlarmEvent = JSON.parse(message.body);
                this.alarms.update((current) => {
                  if (current.some(a => a.alarmCode === data.alarmCode)) {
                    return current;
                  }
                  return [...current, data];
                });
              }
            });

            // Publish to snapshot to request initial data
            this.client.publish({ destination: '/app/burning/snapshot' });
          }
        },
        onWebSocketClose: () => {
          this.connected.set(false);
        },
        onDisconnect: () => {
          this.connected.set(false);
        }
      });

      this.client.activate();
    }

    this.destroyRef.onDestroy(() => {
      if (this.client) {
        this.client.deactivate();
      }
    });
  }

  sendCommand(cmd: CommandMessage): void {
    if (this.connected() && this.client) {
      this.client.publish({
        destination: '/app/burning/command',
        body: JSON.stringify(cmd),
      });
    } else {
      console.error('Cannot send command. WebSocket is disconnected.');
    }
  }

  removeAlarm(alarmCode: string, timestamp: string): void {
    this.alarms.update(current => current.filter(a => !(a.alarmCode === alarmCode && a.timestamp === timestamp)));
  }

  clearLogs(): void {
    this.logs.set([]);
  }
}
