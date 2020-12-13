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
  Default
} from "sequelize-typescript";
import User from "./User";
import StepsReply from "./StepsReply";
import Queue from "./Queue";

@Table({ freezeTableName: true })
class StepsReplyActions extends Model<StepsReplyActions> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: string;

  @Column
  @ForeignKey(() => StepsReply)
  stepReplyId: number;

  @BelongsTo(() => StepsReply, "stepReplyId")
  stepsReply: StepsReply;

  @Column(DataType.STRING)
  words: string;

  @Default(null)
  @Column(DataType.TEXT)
  replyDefinition: string;

  @Column
  action: number;

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

  @ForeignKey(() => Queue)
  @Column(DataType.INTEGER)
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @ForeignKey(() => User)
  @Column
  userIdDestination: number;

  @BelongsTo(() => User)
  userDestination: User;

  @Column
  @ForeignKey(() => StepsReply)
  nextStepId: number;

  @BelongsTo(() => StepsReply, "nextStepId")
  nextStep: StepsReply;

  tableName: "StepsReplyActions";
}

export default StepsReplyActions;
