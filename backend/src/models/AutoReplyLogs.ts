import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  BelongsTo,
  ForeignKey,
  AutoIncrement
} from "sequelize-typescript";
import Contact from "./Contact";
import Ticket from "./Ticket";

@Table({ freezeTableName: true })
class AutoReplyLogs extends Model<AutoReplyLogs> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: string;

  @Column
  autoReplyId: string;

  @Column(DataType.TEXT)
  autoReplyName: string;

  @Column
  stepsReplyId: string;

  @Column(DataType.TEXT)
  stepsReplyMessage: string;

  @Column(DataType.TEXT)
  wordsReply: string;

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

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  tableName: "AutoReplyLogs";
}

export default AutoReplyLogs;
