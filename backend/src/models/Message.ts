import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  Default,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Contact from "./Contact";
import Ticket from "./Ticket";

@Table
class Message extends Model<Message> {
  @PrimaryKey
  @Column
  id: string;

  @Default(0)
  @Column
  ack: number;

  @Default(false)
  @Column
  read: boolean;

  @Default(false)
  @Column
  fromMe: boolean;

  @Column(DataType.TEXT)
  body: string;

  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    if (this.getDataValue("mediaUrl")) {
      const { BACKEND_URL } = process.env;
      const value = this.getDataValue("mediaUrl");
      return `${BACKEND_URL}:${process.env.PROXY_PORT}/public/${value}`;
    }
    return null;
  }

  @Column
  mediaType: string;

  @Default(false)
  @Column
  isDeleted: boolean;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @ForeignKey(() => Message)
  @Column
  quotedMsgId: string;

  @BelongsTo(() => Message, "quotedMsgId")
  quotedMsg: Message;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  // @BeforeUpsert
  // static async AutoReplyActionTicket(instance: Message): Promise<void> {
  //   const ticket = await ShowTicketService(instance.ticketId);
  //   const celularContato = ticket.contact.number;
  //   let celularTeste = "";

  //   if (
  //     ticket.autoReplyId &&
  //     // ticket.contactId === 1 &&
  //     ticket.status === "pending" &&
  //     !instance.fromMe
  //   ) {
  //     if (ticket.autoReplyId) {
  //       const actionAutoReply = await VerifyActionStepAutoReplyService(
  //         ticket.stepAutoReplyId,
  //         instance.body
  //       );
  //       if (actionAutoReply) {
  //         const io = getIO();

  //         // action = 0: enviar para proximo step: nextStepId
  //         if (actionAutoReply.action === 0) {
  //           await ticket.update({
  //             stepAutoReplyId: actionAutoReply.nextStepId
  //           });
  //           const stepAutoReply = await ShowStepAutoReplyMessageService(
  //             0,
  //             actionAutoReply.stepReplyId,
  //             actionAutoReply.nextStepId
  //           );

  //           // Verificar se rotina em teste
  //           celularTeste = stepAutoReply.autoReply.celularTeste;
  //           if (
  //             (celularTeste &&
  //               celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
  //             !celularContato
  //           ) {
  //             return;
  //           }

  //           await SendWhatsAppMessage({
  //             body: stepAutoReply.reply,
  //             ticket,
  //             quotedMsg: undefined
  //           });
  //           await SetTicketMessagesAsRead(ticket);
  //           return;
  //         }

  //         // action = 1: enviar para fila: queue
  //         if (actionAutoReply.action === 1) {
  //           ticket.update({
  //             queueId: actionAutoReply.queueId,
  //             autoReplyId: null,
  //             stepAutoReplyId: null
  //           });
  //         }

  //         // action = 2: enviar para determinado usuário
  //         if (actionAutoReply.action === 2) {
  //           ticket.update({
  //             userId: actionAutoReply.userIdDestination,
  //             status: "open",
  //             autoReplyId: null,
  //             stepAutoReplyId: null
  //           });
  //         }
  //         io.to(ticket.status).emit("ticket", {
  //           action: "updateQueue",
  //           ticket
  //         });

  //         if (actionAutoReply.replyDefinition) {
  //           await SendWhatsAppMessage({
  //             body: actionAutoReply.replyDefinition,
  //             ticket,
  //             quotedMsg: undefined
  //           });
  //           await SetTicketMessagesAsRead(ticket);
  //         }
  //       } else {
  //         // retornar a ultima mensagem (estapa atual do ticket)
  //         const stepAutoReply = await ShowStepAutoReplyMessageService(
  //           0,
  //           ticket.autoReplyId,
  //           ticket.stepAutoReplyId
  //         );

  //         // Verificar se rotina em teste
  //         celularTeste = stepAutoReply.autoReply.celularTeste;
  //         if (
  //           (celularTeste &&
  //             celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
  //           !celularContato
  //         ) {
  //           return;
  //         }

  //         await SendWhatsAppMessage({
  //           body: stepAutoReply.reply,
  //           ticket,
  //           quotedMsg: undefined
  //         });
  //         await SetTicketMessagesAsRead(ticket);
  //       }
  //     }
  //   }
  // }
}

export default Message;
