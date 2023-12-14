import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
  Default,
  AfterFind
} from "sequelize-typescript";
import CampaignContacts from "./CampaignContacts";
import Tenant from "./Tenant";
import User from "./User";
import Whatsapp from "./Whatsapp";

@Table
class Campaign extends Model<Campaign> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  start: Date;

  @Default("pending")
  @Column(
    DataType.ENUM("pending", "scheduled", "processing", "canceled", "finished")
  )
  status: string;

  @Column
  message1: string;

  @Column
  message2: string;

  @Column
  message3: string;

  @Column(DataType.STRING)
  get mediaUrl(): string | null {
    const value = this.getDataValue("mediaUrl");
    if (value && value !== "null") {
      const { BACKEND_URL } = process.env;
      return `${BACKEND_URL}:${process.env.PROXY_PORT}/public/${value}`;
    }
    return null;
  }

  @Column
  mediaType: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Whatsapp)
  @Column
  sessionId: number;

  @BelongsTo(() => Whatsapp)
  session: Whatsapp;

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @HasMany(() => CampaignContacts)
  campaignContacts: CampaignContacts[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  delay: number;

  @AfterFind
  static async updatedInstances(instances: any): Promise<void | any> {
    if (!Array.isArray(instances)) return instances;
    const newInstances = await Promise.all(
      // eslint-disable-next-line consistent-return
      instances.map(async (instance: any) => {
        if (!["pending", "finished", "canceled"].includes(instance.status)) {
          const pendentesEntrega = +instance.dataValues.pendentesEntrega;
          const pendentesEnvio = +instance.dataValues.pendentesEnvio;
          const recebidas = +instance.dataValues.recebidas;
          const lidas = +instance.dataValues.lidas;
          const contactsCount = +instance.dataValues.contactsCount;

          const totalTransacionado =
            pendentesEntrega + pendentesEnvio + recebidas + lidas;

          if (
            instance.status === "scheduled" &&
            contactsCount === pendentesEnvio
          ) {
            return instance;
          }

          if (contactsCount !== totalTransacionado) {
            instance.status = "processing";
            await instance.update({ status: "processing" });
          }

          if (contactsCount === totalTransacionado) {
            instance.status = "finished";
            await instance.update({ status: "finished" });
          }

          return instance;
        }
        // ("pending", "scheduled", "processing", "canceled", "finished")
      })
    );
    return newInstances;
  }
}

export default Campaign;
