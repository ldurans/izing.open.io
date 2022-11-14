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
  ForeignKey,
  AllowNull
} from "sequelize-typescript";
import { v4 as uuidV4 } from "uuid";
import Contact from "./Contact";
import Tenant from "./Tenant";
import Ticket from "./Ticket";
import User from "./User";

@Table
class Message extends Model<Message> {
  @PrimaryKey
  @Default(uuidV4)
  @Column
  id: string;

  @Default(null)
  @AllowNull
  @Column
  messageId: string;

  @Default(0)
  @Column
  ack: number;

  @Default(null)
  @AllowNull
  @Column(DataType.ENUM("pending", "sended", "received"))
  status: string;

  @Default(null)
  @AllowNull
  @Column(DataType.TEXT)
  wabaMediaId: string;

  @Default(false)
  @Column
  read: boolean;

  @Default(false)
  @Column
  fromMe: boolean;

  @Column(DataType.TEXT)
  body: string;

  @Column(DataType.VIRTUAL)
  get mediaName(): string | null {
    return this.getDataValue("mediaUrl");
  }

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

  // @HasOne(() => Message, "messageId")
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

  @Default(null)
  @AllowNull
  @Column(DataType.BIGINT)
  timestamp: number;

  @ForeignKey(() => User)
  @Default(null)
  @AllowNull
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Default(null)
  @AllowNull
  @Column(DataType.DATE)
  scheduleDate: Date;

  @Default(null)
  @AllowNull
  @Column(
    DataType.ENUM("campaign", "chat", "external", "schedule", "bot", "sync")
  )
  sendType: string;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @Default(null)
  @AllowNull
  @Column
  idFront: string;
}

// Message.sequelize?.define("Message", {
//   quotedMsgId: {
//     type: DataType.STRING,
//     references: {
//       model: Message,
//       key: "messageId"
//     }
//   }
// });

export default Message;
