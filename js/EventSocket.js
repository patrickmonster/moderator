"use strict";
// wss://eventsub.wss.twitch.tv/ws

const host = "wss://eventsub.wss.twitch.tv/ws";

const socket = new WebSocket(host);

class EventSocket {
  //
  _ws = null;
  constructor() {
    this._ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
    this._ws.onopen = this.onOpen;
    this._ws.onmessage = this.onMessage;
    this._ws.onclose = this.onClose;
    this._ws.onerror = this.onError;
  }

  onOpen() {
    const socket = this._ws;
    if (socket != null && socket.readyState == 1) {
      console.log("socket is open");
    }
  }
  onMessage(msg) {
    if (msg == "PING") return socket.send("PONG");

    const { metadata, payload } = JSON.parse(msg.data);
    if (metadata) {
      // message_type
      const { message_type, message_id, message_timestamp } = metadata;

      switch (message_type) {
        case "session_welcome": // 세션 시작
          break;
        case "session_keepalive": // 유지요청
          break;
        case "notification": // 세션 시작
          break;
        case "session_reconnect": // 세션 시작
          break;
        case "revocation": // 세션 시작
          break;

        default:
          break;
      }
    }

    console.log(metadata, payload);
  }
  onClose(msg) {
    console.log(msg);
  }
  onError(msg) {
    console.error(msg);
  }
}

window.EventSocket = EventSocket;
