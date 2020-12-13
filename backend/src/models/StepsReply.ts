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
  AutoIncrement,
  HasMany,
  Default
} from "sequelize-typescript";
import User from "./User";
import AutoReply from "./AutoReply";
import StepsReplyAction from "./StepsReplyAction";

@Table({ freezeTableName: true })
class StepsReply extends Model<StepsReply> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: string;

  @Column(DataType.TEXT)
  reply: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  initialStep: boolean;

  @Column
  @ForeignKey(() => AutoReply)
  idAutoReply: number;

  @BelongsTo(() => AutoReply, "idAutoReply")
  autoReply: AutoReply;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;

  @HasMany(() => StepsReplyAction)
  stepsReplyAction: StepsReplyAction;

  tableName: "StepsReply";
}

export default StepsReply;
