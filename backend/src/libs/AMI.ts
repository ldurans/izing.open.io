import Asterisk from "asterisk-manager";

// const ami: any = new Asterisk(
//   "5038",
//   "192.168.206.51",
//   "admin",
//   "start123",
//   true
// );

const ami: any = new Asterisk(
  "5038",
  "192.168.206.50",
  "admin",
  "start123",
  true
);

ami.keepConnected();

// ami.action({ action: "QueueStatus" }, (err: any, res: any) => {
//   console.log("QueueStatus", err, res);
// });

// ami.action({ action: "Agents" }, (err: any, res: any) => {
//   console.log("AgentShow", err, res);
// });

// // Evento de quando a chamada entra na fila
// ami.on("queuecallerjoin", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// // Evento de quando a chamada sai da fila (quando e atendida ou abandonada)
// ami.on("queuecallerleave", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// // Evento de quando a chamada e abandonada
// ami.on("queuecallerabandon", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// // Evento de quando o membro da fila (agente) muda de status
// ami.on("queuememberstatus", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// // Evento de quando a chamada é atendida
// ami.on("agentconnect", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// // Evento de membros de uma fila (que so aparece quando voce da um queue show na fila)
// ami.on("queuemember", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// // Evento de parametros de uma fila (que so aparece quando voce da um queue show na fila)
// ami.on("queueparams", (evt: any) => {
//   console.log(
//     `### Emitindo no canal ${evt.queue} a mensagem: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

// ami.on("Hangup", (evt: any) => {
//   console.log(
//     `### Emitindo no canal a mensagem de desligamento da chamada: \r\n ${JSON.stringify(
//       evt
//     )} \r\n \r\n \r\n`
//   );
//   // io.emit(evt.queue, evt);
// });

ami.on("Dial", (evt: any) => {
  console.log(
    `### Emitindo no canal a mensagem de desligamento da chamada: \r\n ${JSON.stringify(
      evt
    )} \r\n \r\n \r\n`
  );
  // io.emit(evt.queue, evt);
});

// ami.on("peerstatus", (evt: any) => {
//   console.log(JSON.stringify(evt));
// });

// realizar chamada
ami.action(
  {
    action: "originate",
    // channel: "SIP/4815",
    channel: "SIP/4815",
    context: "from-internal",
    exten: "0991191708",
    priority: 1,
    variable: {
      connectedlinenum: "0991191708",
      connectedlinename: "CID:4815"
      // name1: "value1",
      // name2: "value2"
    }
  },
  (err: any, res: any) => {
    console.log("action", err, res);
  }
);

// ami.on("managerevent", (evt: any) => {
//   if (!(evt.event === "RTCPReceived" || evt.event === "RTCPSent")) {
//     console.log("managerevent", evt);
//   }
//   // QueueMemberPaused => agente entrou em pausa
//   if (evt.queue === "call_center") {
//     console.log("call_center", evt);
//   }
//   if (evt.queue === "call_center" && evt.event === "AgentComplete") {
//     console.log("AgentComplete", evt);
//     // socket.emit('AgentComplete', evt);
//   }
//   if (evt.queue === "call_center" && evt.event === "AgentCalled") {
//     console.log("AgentCalled", evt);
//     // socket.emit('AgentCalled', evt);
//   }
// });

// Listen for specific AMI events. A list of event names can be found at
// https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+AMI+Events
// ligação é desligada
ami.on("hangup", (evt: any) => {
  console.log("hangup", evt);
});

// Listen for Action responses.
ami.on("response", (evt: any) => {
  console.log("response", evt);
});

export default ami;
