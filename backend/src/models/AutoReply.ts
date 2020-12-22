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
  AutoIncrement,
  HasMany
} from "sequelize-typescript";
import User from "./User";
import StepsReply from "./StepsReply";
import Tenant from "./Tenant";

@Table({ freezeTableName: true })
class AutoReply extends Model<AutoReply> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: string;

  @Column(DataType.TEXT)
  name: string;

  @Default(null)
  @Column(DataType.TEXT)
  celularTeste: string;

  @Default(true)
  @Column
  isActive: boolean;

  @Default(0)
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

  @HasMany(() => StepsReply)
  stepsReply: StepsReply;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  tableName: "AutoReply";
}

export default AutoReply;
