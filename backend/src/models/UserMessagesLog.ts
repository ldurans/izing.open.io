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
  AllowNull,
  AutoIncrement
} from "sequelize-typescript";
import Message from "./Message";
import Ticket from "./Ticket";
import User from "./User";

@Table({ freezeTableName: true })
class UserMessagesLog extends Model<UserMessagesLog> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Message)
  @Default(null)
  @AllowNull
  @Column
  messageId: string;

  @BelongsTo(() => Message, "messageId")
  message: Message;

  @ForeignKey(() => Ticket)
  @Default(null)
  @AllowNull
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  tableName: "UserMessagesLog";
}

export default UserMessagesLog;
