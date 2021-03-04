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
  HasMany
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

  @Column
  end: Date;

  @Column
  status: string;

  @Column
  message1: string;

  @Column
  message2: string;

  @Column
  message3: string;

  @Column
  message4: string;

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
}

export default Campaign;
