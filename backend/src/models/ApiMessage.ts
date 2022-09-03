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
  ForeignKey,
  AllowNull,
  AfterCreate,
  AfterUpdate
} from "sequelize-typescript";
import { v4 as uuidV4 } from "uuid";
import Queue from "../libs/Queue";
import Tenant from "./Tenant";
import Whatsapp from "./Whatsapp";

// @Table({ freezeTableName: true })
class ApiMessage extends Model<ApiMessage> {
  @PrimaryKey
  @Default(uuidV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => Whatsapp)
  @Column
  sessionId: number;

  @BelongsTo(() => Whatsapp)
  session: Whatsapp;

  @Default(0)
  @Column
  ack: number;

  @PrimaryKey
  @Column
  messageId: string;

  @Column(DataType.TEXT)
  body: string;

  @AllowNull(false)
  @Column
  number: string;

  @Column
  mediaName: string;

  @Column
  mediaUrl: string;

  @Column
  externalKey: string;

  @Default(null)
  @AllowNull
  @Column(DataType.INTEGER)
  timestamp: number;

  @Default(null)
  @AllowNull
  @Column(DataType.JSONB)
  // eslint-disable-next-line @typescript-eslint/ban-types
  messageWA: object;

  @Default(null)
  @AllowNull
  @Column(DataType.JSONB)
  // eslint-disable-next-line @typescript-eslint/ban-types
  apiConfig: object;

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

  tableName: "ApiMessages";

  @AfterCreate
  @AfterUpdate
  static HookMessage(instance: any): void {
    if (instance?.apiConfig?.urlMessageStatus) {
      const payload = {
        ack: instance.ack,
        body: instance.body,
        messageId: instance.messageId,
        number: instance.number,
        externalKey: instance.externalKey,
        type: "hookMessageStatus",
        authToken: instance.authToken
      };

      Queue.add("WebHooksAPI", {
        url: instance.apiConfig.urlMessageStatus,
        type: payload.type,
        payload
      });
    }
  }
}

export default ApiMessage;
