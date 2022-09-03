import {
  // Table,
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
import { v4 as uuidV4 } from "uuid";
import User from "./User";
import Tenant from "./Tenant";
import Whatsapp from "./Whatsapp";

// @Table({ freezeTableName: true })
class ApiConfig extends Model<ApiConfig> {
  @PrimaryKey
  @Default(uuidV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => Whatsapp)
  @Column
  sessionId: number;

  @BelongsTo(() => Whatsapp)
  session: Whatsapp;

  @Column
  name: string;

  @Default(true)
  @Column
  isActive: boolean;

  @Column
  token: string;

  @Column
  authToken: string;

  @Column
  urlServiceStatus: string;

  @Column
  urlMessageStatus: string;

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

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  tableName: "ApiConfigs";
}

export default ApiConfig;
