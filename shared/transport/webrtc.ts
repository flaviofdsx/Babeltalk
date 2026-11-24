// ============================================================
// Transporte P2P via WebRTC DataChannel
// Abstração modular: sinalização/descoberta é desacoplada
// ============================================================

import type { MessageTransport, OutboxPayload } from "../types";

export type SignalingCallback = (peerId: string, answer: RTCSessionDescriptionInit) => void;

export interface WebRtcConfig {
  iceServers?: RTCIceServer[];
  signalingSend: (peerId: string, offer: RTCSessionDescriptionInit) => void;
  onSignal: (callback: SignalingCallback) => void;
}

export class WebRtcTransport implements MessageTransport {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private config: WebRtcConfig;
  private connected = false;
  private pendingMessages: OutboxPayload[] = [];

  constructor(config: WebRtcConfig) {
    this.config = config;
    this.config.onSignal((peerId, answer) => this.handleSignal(peerId, answer));
  }

  async connect(peerId: string): Promise<void> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.config.iceServers ?? [{ urls: "stun:stun.l.google.com:19302" }]
    });

    this.dataChannel = this.peerConnection.createDataChannel("babeltalk", {
      ordered: true
    });

    this.dataChannel.onopen = () => {
      this.connected = true;
      this.flushPending();
    };

    this.dataChannel.onclose = () => {
      this.connected = false;
    };

    this.dataChannel.onerror = () => {
      this.connected = false;
    };

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.config.signalingSend(peerId, offer);
  }

  private handleSignal(_peerId: string, _answer: RTCSessionDescriptionInit): void {
    // Recebido via signaling — implementar conforme sistema de descoberta
  }

  private flushPending(): void {
    for (const msg of this.pendingMessages) {
      this.sendInternal(msg);
    }
    this.pendingMessages = [];
  }

  private sendInternal(payload: OutboxPayload): void {
    if (this.dataChannel?.readyState === "open") {
      this.dataChannel.send(JSON.stringify(payload));
    }
  }

  async send(_contactId: string, payload: OutboxPayload): Promise<boolean> {
    if (this.connected && this.dataChannel?.readyState === "open") {
      this.sendInternal(payload);
      return true;
    }
    // Se desconectado, armazena para envio quando conectar
    this.pendingMessages.push(payload);
    return false;
  }

  disconnect(): void {
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.peerConnection = null;
    this.dataChannel = null;
    this.connected = false;
  }
}

export function createWebRtcTransport(config: WebRtcConfig): WebRtcTransport {
  return new WebRtcTransport(config);
}
