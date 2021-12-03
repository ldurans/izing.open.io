import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  AutoIncrement,
  Default,
  // AfterCreate,
  DataType,
  AllowNull
} from "sequelize-typescript";

import Contact from "./Contact";
import Message from "./Message";
import User from "./User";
import Whatsapp from "./Whatsapp";
import AutoReply from "./AutoReply";
import StepsReply from "./StepsReply";
import Queue from "./Queue";
// import ShowStepAutoReplyMessageService from "../services/AutoReplyServices/ShowStepAutoReplyMessageService";
import Tenant from "./Tenant";
import MessagesOffLine from "./MessageOffLine";
import ChatFlow from "./ChatFlow";

@Table
class Ticket extends Model<Ticket> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column({ defaultValue: "pending" })
  status: string;

  @Column
  unreadMessages: number;

  @Column
  lastMessage: string;

  @Column
  channel: string;

  @Default(true)
  @Column
  answered: boolean;

  @Default(false)
  @Column
  isGroup: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column(DataType.DATE)
  closedAt: Date;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @HasMany(() => Message)
  messages: Message[];

  @ForeignKey(() => AutoReply)
  @Column
  autoReplyId: number;

  @BelongsTo(() => AutoReply)
  autoReply: AutoReply;

  @ForeignKey(() => StepsReply)
  @Column
  stepAutoReplyId: number;

  @BelongsTo(() => StepsReply)
  stepsReply: StepsReply;

  @ForeignKey(() => ChatFlow)
  @Column
  chatFlowId: number;

  @BelongsTo(() => ChatFlow)
  chatFlow: ChatFlow;

  @Default(null)
  @AllowNull
  @Column(DataType.INTEGER)
  stepChatFlow: number;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @Default(null)
  @Column(DataType.VIRTUAL)
  isTransference: string | boolean | null;

  @Default(null)
  @Column(DataType.VIRTUAL)
  isCreated: boolean | null;

  @Default([])
  @Column(DataType.VIRTUAL)
  scheduledMessages: Message[];

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @HasMany(() => MessagesOffLine)
  messagesOffLine: MessagesOffLine[];

  // @AfterCreate
  // static async AutoReplyWelcome(instance: Ticket): Promise<void> {
  //   if (instance.userId || instance.isGroup) return;

  //   const stepAutoReply = await ShowStepAutoReplyMessageService(
  //     0,
  //     0,
  //     0,
  //     true,
  //     instance.tenantId
  //   );

  //   if (!stepAutoReply) return;

  //   const contato = await Contact.findByPk(instance.contactId);
  //   const { celularTeste } = stepAutoReply.autoReply;
  //   const celularContato = contato?.number;

  //   if (
  //     (celularTeste &&
  //       celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
  //     !celularContato
  //   ) {
  //     return;
  //   }

  //   await instance.update({
  //     autoReplyId: stepAutoReply.autoReply.id,
  //     stepAutoReplyId: stepAutoReply.id
  //   });
  // }
}

export default Ticket;
