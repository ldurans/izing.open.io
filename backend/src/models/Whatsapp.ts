import { sign } from "jsonwebtoken";
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  HasMany,
  Unique,
  ForeignKey,
  BelongsTo,
  AfterUpdate,
  BeforeCreate,
  BeforeUpdate
  // DefaultScope
} from "sequelize-typescript";
import webHooks from "../config/webHooks.dev.json";

import authConfig from "../config/auth";

import Queue from "../libs/Queue";
import ApiConfig from "./ApiConfig";
import Tenant from "./Tenant";
import Ticket from "./Ticket";
import ChatFlow from "./ChatFlow";

// @DefaultScope(() => ({
//   where: { isDeleted: false }
// }))
@Table
class Whatsapp extends Model<Whatsapp> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull
  @Unique
  @Column(DataType.TEXT)
  name: string;

  @Column(DataType.TEXT)
  session: string;

  @Column(DataType.TEXT)
  qrcode: string;

  @Column
  status: string;

  @Column
  battery: string;

  @Column
  plugged: boolean;

  @Default(true)
  @Column
  isActive: boolean;

  @Default(false)
  @Column
  isDeleted: boolean;

  @Column
  retries: number;

  @Default(false)
  @AllowNull
  @Column
  isDefault: boolean;

  @Default(null)
  @AllowNull
  @Column
  tokenTelegram: string;

  @Default(null)
  @AllowNull
  @Column
  instagramUser: string;

  @Default(null)
  @AllowNull
  @Column
  instagramKey: string;

  @Default(null)
  @AllowNull
  @Column
  fbPageId: string;

  @Default(null)
  @AllowNull
  @Column(DataType.JSONB)
  // eslint-disable-next-line @typescript-eslint/ban-types
  fbObject: object;

  @Default("whatsapp")
  @Column(DataType.ENUM("whatsapp", "telegram", "instagram", "messenger"))
  type: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  number: string;

  @Column(DataType.JSONB)
  // eslint-disable-next-line @typescript-eslint/ban-types
  phone: object;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @ForeignKey(() => ChatFlow)
  @Column
  chatFlowId: number;

  @BelongsTo(() => ChatFlow)
  chatFlow: ChatFlow;

  @Default(null)
  @AllowNull
  @Column(DataType.ENUM("360", "gupshup"))
  wabaBSP: string;

  @Default(null)
  @AllowNull
  @Column(DataType.TEXT)
  tokenAPI: string;

  @Default(null)
  @AllowNull
  @Column(DataType.TEXT)
  tokenHook: string;

  @Default(null)
  @AllowNull
  @Column(DataType.TEXT)
  farewellMessage: string;

  @Column(DataType.VIRTUAL)
  get UrlWabaWebHook(): string | null {
    const key = this.getDataValue("tokenHook");
    const wabaBSP = this.getDataValue("wabaBSP");
    let BACKEND_URL;
    BACKEND_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === "dev") {
      BACKEND_URL = webHooks.urlWabahooks;
    }
    return `${BACKEND_URL}/wabahooks/${wabaBSP}/${key}`;
  }

  @Column(DataType.VIRTUAL)
  get UrlMessengerWebHook(): string | null {
    const key = this.getDataValue("tokenHook");
    let BACKEND_URL;
    BACKEND_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === "dev") {
      BACKEND_URL = webHooks.urlWabahooks;
    }
    return `${BACKEND_URL}/fb-messenger-hooks/${key}`;
  }

  @AfterUpdate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async HookStatus(instance: Whatsapp & any): Promise<void> {
    const { status, name, qrcode, number, tenantId, id: sessionId } = instance;
    const payload: any = {
      name,
      number,
      status,
      qrcode,
      timestamp: Date.now(),
      type: "hookSessionStatus"
    };

    const apiConfig: any = await ApiConfig.findAll({
      where: { tenantId, sessionId }
    });

    if (!apiConfig) return;

    await Promise.all(
      apiConfig.map((api: ApiConfig) => {
        if (api.urlServiceStatus) {
          if (api.authToken) {
            payload.authToken = api.authToken;
          }
          return Queue.add("WebHooksAPI", {
            url: api.urlServiceStatus,
            type: payload.type,
            payload
          });
        }
      })
    );
  }

  @BeforeUpdate
  @BeforeCreate
  static async CreateTokenWebHook(instance: Whatsapp): Promise<void> {
    const { secret } = authConfig;

    if (
      !instance?.tokenHook &&
      (instance.type === "waba" || instance.type === "messenger")
    ) {
      const tokenHook = sign(
        {
          tenantId: instance.tenantId,
          whatsappId: instance.id
          // wabaBSP: instance.wabaBSP
        },
        secret,
        {
          expiresIn: "10000d"
        }
      );

      instance.tokenHook = tokenHook;
    }
  }
}

export default Whatsapp;
