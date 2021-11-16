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
  AfterUpdate
  // DefaultScope
} from "sequelize-typescript";
import Queue from "../libs/Queue";
import ApiConfig from "./ApiConfig";
import Tenant from "./Tenant";
import Ticket from "./Ticket";

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

  @Default("whatsapp")
  @Column(DataType.ENUM("whatsapp", "telegram"))
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

  @AfterUpdate
  static async HookStatus(instance: Whatsapp & any): Promise<void> {
    const statusHook = ["DESTROYED", "DISCONNECTED", "CONNECTED"];

    if (
      statusHook.includes(instance.status) &&
      // eslint-disable-next-line no-underscore-dangle
      instance._previousDataValues.status !== instance.status
    ) {
      const messages: any = {
        DESTROYED:
          "Desconectado devido à várias tentativas de extabelecimento da conexão sem sucesso. Verifique o celular e internet do aparelho.",
        DISCONNECTED:
          "Desconectado por: Telefone sem internet / Número despareado / Utilizado no whatsapp web.",
        CONNECTED: "Sessão conectada."
      };
      const { status, name, number, tenantId, id: sessionId } = instance;
      const payload = {
        name,
        number,
        status,
        timestamp: Date.now(),
        msg: messages[status],
        type: "hookSessionStatus"
      };

      const apiConfig = await ApiConfig.findAll({
        where: { tenantId, sessionId }
      });

      if (!apiConfig) return;

      await Promise.all(
        apiConfig.map((api: ApiConfig) => {
          return Queue.add("WebHooksAPI", {
            url: api.urlServiceStatus,
            type: payload.type,
            payload
          });
        })
      );
    }
  }
}

export default Whatsapp;
