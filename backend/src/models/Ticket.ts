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
  AfterCreate,
  DataType
} from "sequelize-typescript";

import Contact from "./Contact";
import Message from "./Message";
import User from "./User";
import Whatsapp from "./Whatsapp";
import AutoReply from "./AutoReply";
import StepsReply from "./StepsReply";
import Queue from "./Queue";
import ShowStepAutoReplyMessageService from "../services/AutoReplyServices/ShowStepAutoReplyMessageService";
import Tenant from "./Tenant";
import MessagesOffLine from "./MessageOffLine";

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

  @Default(false)
  @Column
  isGroup: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

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

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @HasMany(() => MessagesOffLine)
  messagesOffLine: MessagesOffLine[];

  @AfterCreate
  static async AutoReplyWelcome(instance: Ticket): Promise<void> {
    if (instance.userId) return;

    const stepAutoReply = await ShowStepAutoReplyMessageService(0, 0, 0, true);

    if (!stepAutoReply) return;

    const contato = await Contact.findByPk(instance.contactId);
    const { celularTeste } = stepAutoReply.autoReply;
    const celularContato = contato?.number;

    if (
      (celularTeste &&
        celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
      !celularContato
    ) {
      return;
    }

    await instance.update({
      autoReplyId: stepAutoReply.autoReply.id,
      stepAutoReplyId: stepAutoReply.id
    });
  }
}

export default Ticket;
